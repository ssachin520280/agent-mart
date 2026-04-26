import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { createAgentRun, getAgentListing } from "@/lib/agent-service"

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await context.params
  const agent = await getAgentListing(slug)

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  const body = (await request.json().catch(() => null)) as { input?: unknown } | null
  const input = typeof body?.input === "string" ? body.input.trim() : ""

  if (!input) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 })
  }

  const run = await createAgentRun({
    ownerClerkId: userId,
    agent,
    agentId: agent.id,
    input,
  })

  return NextResponse.json({
    taskId: run.id,
    checkoutUrl: run.locusCheckoutUrl ?? `/agent/${agent.slug}/checkout?runId=${run.id}`,
    embeddedCheckoutUrl: `/agent/${agent.slug}/checkout?runId=${run.id}`,
    locusSessionId: run.locusSessionId,
    status: run.status,
  })
}
