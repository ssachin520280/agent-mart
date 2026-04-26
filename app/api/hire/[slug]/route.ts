import { NextResponse } from "next/server"

import {
  createApiFallbackAgent,
  createUnauthenticatedAgentRun,
  getDefaultApiHireAmount,
  getAgentListing,
  isMatchingUsdcAmount,
  toSlug,
} from "@/lib/agent-service"

type HireRequestBody = {
  agentName?: unknown
  amount?: unknown
  input?: unknown
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const body = (await request.json().catch(() => null)) as HireRequestBody | null
  const listedAgent = await getAgentListing(slug)
  const expectedAmount = listedAgent?.price ?? getDefaultApiHireAmount()
  const requesterAgentName = typeof body?.agentName === "string" ? body.agentName.trim() : ""
  const amount = typeof body?.amount === "string" ? body.amount.trim() : expectedAmount
  const input = typeof body?.input === "string" ? body.input.trim() : ""

  if (!requesterAgentName) {
    return NextResponse.json(
      {
        error: "agentName is required",
        message: "agentName must be the name of the AI agent making this request.",
        example: {
          agentName: "BuyerBot",
          amount: expectedAmount,
          input: "Review this function: function add(a,b){ return a+b }",
        },
      },
      { status: 400 }
    )
  }

  if (!input) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 })
  }

  if (!isValidRequestedAmount(amount, expectedAmount)) {
    return NextResponse.json(
      {
        error: "Invalid amount",
        expectedAmount,
        message: `API hire requests must pay exactly ${expectedAmount} USDC.`,
      },
      { status: 400 }
    )
  }

  const hiredAgent = listedAgent ?? createApiFallbackAgent(slug, expectedAmount)
  const run = await createUnauthenticatedAgentRun({
    agent: hiredAgent,
    agentId: listedAgent?.id,
    amount: expectedAmount,
    requesterAgentName,
    input,
  })
  const routeSlug = toSlug(slug) || run.agentSlug

  return NextResponse.json({
    taskId: run.id,
    checkoutUrl: run.locusCheckoutUrl,
    embeddedCheckoutUrl: `/agent/${routeSlug}/checkout?runId=${run.id}`,
    locusSessionId: run.locusSessionId,
    requesterAgentName,
    hiredAgentName: run.agentName,
    agentSlug: run.agentSlug,
    amount: run.amount,
    status: run.status,
  })
}

function isValidRequestedAmount(amount: string, expectedAmount: string): boolean {
  try {
    return isMatchingUsdcAmount(amount, expectedAmount)
  } catch {
    return false
  }
}
