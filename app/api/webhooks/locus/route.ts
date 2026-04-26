import crypto from "crypto"

import type { CheckoutWebhookPayload } from "@withlocus/checkout-react"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

import {
  type AgentRunSummary,
  completeRunFromLocusPayment,
  expireRunFromLocusSession,
  getRunPaymentRecordByLocusSessionId,
} from "@/lib/agent-service"

export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get("x-signature-256")
  const event = parseWebhookPayload(payload)
  const sessionId = event?.data.sessionId ?? request.headers.get("x-session-id")

  if (!signature || !event || !sessionId) {
    return NextResponse.json({ error: "Invalid Locus webhook payload." }, { status: 400 })
  }

  const run = await getRunPaymentRecordByLocusSessionId(sessionId)

  if (!run?.locusWebhookSecret) {
    return NextResponse.json({ error: "Unknown Locus checkout session." }, { status: 404 })
  }

  if (!verifyWebhook(payload, signature, run.locusWebhookSecret)) {
    return NextResponse.json({ error: "Invalid Locus webhook signature." }, { status: 401 })
  }

  const updatedRun = await updateRunFromLocusEvent(event, sessionId)

  if (updatedRun) {
    revalidateRunPaths(updatedRun)
  }

  return NextResponse.json({ received: true })
}

async function updateRunFromLocusEvent(
  event: CheckoutWebhookPayload,
  sessionId: string
): Promise<AgentRunSummary | null> {
  switch (event.event) {
    case "checkout.session.paid":
      return completeRunFromLocusPayment({
        locusSessionId: sessionId,
        paymentTxHash: event.data.paymentTxHash,
        payerAddress: event.data.payerAddress,
        paidAt: event.data.paidAt,
      })
    case "checkout.session.expired":
      return expireRunFromLocusSession(sessionId)
  }
}

function revalidateRunPaths(run: AgentRunSummary): void {
  revalidatePath("/dashboard")
  revalidatePath(`/task/${run.id}`)
  revalidatePath(`/agent/${run.agentSlug}/checkout`)
}

function parseWebhookPayload(payload: string): CheckoutWebhookPayload | null {
  try {
    const value = JSON.parse(payload) as Partial<CheckoutWebhookPayload>

    if (
      (value.event === "checkout.session.paid" || value.event === "checkout.session.expired") &&
      typeof value.data?.sessionId === "string"
    ) {
      return value as CheckoutWebhookPayload
    }
  } catch {
    return null
  }

  return null
}

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  return signatureBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
}
