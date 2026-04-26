import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

import { completeRunFromLocusPayment, getOwnedRun } from "@/lib/agent-service"
import { getLocusCheckoutSession } from "@/lib/locus"

type ConfirmCheckoutBody = {
  sessionId?: unknown
  taskId?: unknown
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as ConfirmCheckoutBody | null
  const taskId = typeof body?.taskId === "string" ? body.taskId : ""
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : ""

  if (!taskId || !sessionId) {
    return NextResponse.json({ error: "Missing checkout confirmation details." }, { status: 400 })
  }

  const run = await getOwnedRun(userId, taskId)

  if (!run || run.locusSessionId !== sessionId) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 })
  }

  const session = await getLocusCheckoutSession(sessionId)

  if (session.status !== "PAID") {
    return NextResponse.json({ error: "Locus checkout is not paid yet.", status: session.status }, { status: 409 })
  }

  const completedRun = await completeRunFromLocusPayment({
    locusSessionId: sessionId,
    paymentTxHash: session.paymentTxHash,
    paidAt: session.paidAt,
  })

  if (!completedRun) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 })
  }

  revalidatePath("/dashboard")
  revalidatePath(`/task/${completedRun.id}`)
  revalidatePath(`/agent/${completedRun.agentSlug}/checkout`)

  return NextResponse.json({ taskId: completedRun.id, status: completedRun.status })
}
