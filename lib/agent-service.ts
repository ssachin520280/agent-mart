import "server-only"

import type { AgentListing } from "@/lib/agent-data"
import { createLocusCheckoutSession, getAppUrl, isPublicHttpsUrl } from "@/lib/locus"
import { getPrisma } from "@/lib/prisma"

export type AgentRunSummary = {
  id: string
  agentSlug: string
  agentName: string
  requesterAgentName: string | null
  input: string
  status: string
  amount: string
  locusSessionId: string | null
  locusCheckoutUrl: string | null
  paymentTxHash: string | null
  payerAddress: string | null
  paidAt: Date | null
  outputTitle: string | null
  outputBlocks: OutputBlock[]
  outputJson: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
}

export type AgentRunPaymentRecord = AgentRunSummary & {
  locusWebhookSecret: string | null
}

export type OutputBlock = {
  title: string
  body: string
}

export type OwnedAgentSummary = AgentListing & {
  id: string
  createdAt: Date
}

export type OwnedAgentHireSummary = {
  agentId: string
  agentName: string
  agentSlug: string
  hireCount: number
  hires: AgentHireSummary[]
}

export type AgentHireSummary = {
  id: string
  amount: string
  buyerLabel: string
  createdAt: Date
  input: string
  requesterAgentName: string | null
  status: string
}

export type AgentListingInput = Omit<AgentListing, "rating" | "jobs" | "apiSnippet" | "accent" | "deliverables"> & {
  deliverables: string[]
}

type CreateAgentInput = AgentListingInput & {
  ownerClerkId: string
}

type CreateRunInput = {
  ownerClerkId: string
  agent: AgentListing
  input: string
  agentId?: string
  requesterAgentName?: string
}

type CreateApiRunInput = {
  agent: AgentListing
  agentId?: string
  amount: string
  requesterAgentName: string
  input: string
}

type AgentRecord = {
  slug: string
  name: string
  category: string
  tagline: string
  description: string
  price: string
  rating: string
  jobs: string
  turnaround: string
  inputLabel: string
  executionType: string
  accent: string
  promptExample: string
  deliverables: string[]
  apiSnippet: string
}

type AgentRunRecord = {
  id: string
  ownerClerkId: string
  agentSlug: string
  agentName: string
  requesterAgentName: string | null
  input: string
  status: string
  amount: string
  locusSessionId: string | null
  locusCheckoutUrl: string | null
  locusWebhookSecret: string | null
  paymentTxHash: string | null
  payerAddress: string | null
  paidAt: Date | null
  outputTitle: string | null
  outputBlocks: unknown
  outputJson: unknown
  createdAt: Date
  updatedAt: Date
}

type Prisma = NonNullable<ReturnType<typeof getPrisma>>

const defaultAccent = "from-lime-300 via-emerald-300 to-cyan-300"

export async function listAgentListings(): Promise<AgentListing[]> {
  const prisma = getPrisma()

  if (!prisma) {
    return []
  }

  const savedAgents = await prisma.agent.findMany({
    orderBy: { createdAt: "desc" },
  })

  return savedAgents.map(agentRecordToListing)
}

export async function getAgentListing(slug: string): Promise<(AgentListing & { id?: string }) | null> {
  const prisma = getPrisma()

  if (prisma) {
    const savedAgent = await prisma.agent.findUnique({ where: { slug } })

    if (savedAgent) {
      return { ...agentRecordToListing(savedAgent), id: savedAgent.id }
    }
  }

  return null
}

export async function listOwnedAgents(ownerClerkId: string): Promise<OwnedAgentSummary[]> {
  const prisma = getPrisma()

  if (!prisma) {
    return []
  }

  const ownedAgents = await prisma.agent.findMany({
    where: { ownerClerkId },
    orderBy: { createdAt: "desc" },
  })

  return ownedAgents.map((agent) => ({
    ...agentRecordToListing(agent),
    id: agent.id,
    createdAt: agent.createdAt,
  }))
}

export async function listOwnedAgentHires(ownerClerkId: string): Promise<OwnedAgentHireSummary[]> {
  const prisma = getPrisma()

  if (!prisma) {
    return []
  }

  const agents = await prisma.agent.findMany({
    where: { ownerClerkId },
    orderBy: { createdAt: "desc" },
    include: {
      runs: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  return agents.map((agent) => ({
    agentId: agent.id,
    agentName: agent.name,
    agentSlug: agent.slug,
    hireCount: agent.runs.length,
    hires: agent.runs.map(runRecordToHireSummary),
  }))
}

export async function getOwnedAgent(ownerClerkId: string, slug: string): Promise<OwnedAgentSummary | null> {
  const prisma = getPrisma()

  if (!prisma) {
    return null
  }

  const agent = await prisma.agent.findFirst({
    where: { ownerClerkId, slug },
  })

  if (!agent) {
    return null
  }

  return {
    ...agentRecordToListing(agent),
    id: agent.id,
    createdAt: agent.createdAt,
  }
}

export async function listOwnedRuns(ownerClerkId: string): Promise<AgentRunSummary[]> {
  const prisma = getPrisma()

  if (!prisma) {
    return []
  }

  const runs = await prisma.agentRun.findMany({
    where: { ownerClerkId },
    orderBy: { createdAt: "desc" },
  })

  return runs.map(runRecordToSummary)
}

export async function getOwnedRun(ownerClerkId: string, id: string): Promise<AgentRunSummary | null> {
  const prisma = getPrisma()

  if (!prisma) {
    return null
  }

  const run = await prisma.agentRun.findUnique({
    where: {
      id_ownerClerkId: {
        id,
        ownerClerkId,
      },
    },
  })

  return run ? runRecordToSummary(run) : null
}

export async function getRunPaymentRecordByLocusSessionId(sessionId: string): Promise<AgentRunPaymentRecord | null> {
  const prisma = getPrisma()

  if (!prisma) {
    return null
  }

  const run = await prisma.agentRun.findUnique({
    where: { locusSessionId: sessionId },
  })

  return run ? runRecordToPaymentRecord(run) : null
}

export async function createAgentListing(input: CreateAgentInput): Promise<AgentListing> {
  const prisma = requirePrisma()
  const slug = toSlug(input.slug)

  const agent = await prisma.agent.create({
    data: {
      ownerClerkId: input.ownerClerkId,
      slug,
      name: input.name,
      category: input.category,
      tagline: input.tagline,
      description: input.description,
      price: input.price,
      rating: "New",
      jobs: "0",
      turnaround: input.turnaround,
      inputLabel: input.inputLabel,
      executionType: input.executionType,
      accent: defaultAccent,
      promptExample: input.promptExample,
      deliverables: input.deliverables,
      apiSnippet: `POST /api/hire/${slug}`,
    },
  })

  return agentRecordToListing(agent)
}

export async function updateOwnedAgentListing(
  ownerClerkId: string,
  id: string,
  input: AgentListingInput
): Promise<AgentListing | null> {
  const prisma = requirePrisma()
  const existingAgent = await prisma.agent.findFirst({
    where: { id, ownerClerkId },
  })

  if (!existingAgent) {
    return null
  }

  const slug = toSlug(input.slug)
  const agent = await prisma.agent.update({
    where: { id },
    data: {
      slug,
      name: input.name,
      category: input.category,
      tagline: input.tagline,
      description: input.description,
      price: input.price,
      turnaround: input.turnaround,
      inputLabel: input.inputLabel,
      executionType: input.executionType,
      promptExample: input.promptExample,
      deliverables: input.deliverables,
      apiSnippet: `POST /api/hire/${slug}`,
    },
  })

  return agentRecordToListing(agent)
}

export async function deleteOwnedAgentListing(ownerClerkId: string, id: string): Promise<boolean> {
  const prisma = requirePrisma()
  const result = await prisma.agent.deleteMany({
    where: { id, ownerClerkId },
  })

  return result.count > 0
}

export async function createAgentRun(input: CreateRunInput): Promise<AgentRunSummary> {
  return createRun({
    ownerClerkId: input.ownerClerkId,
    agent: input.agent,
    agentId: input.agentId,
    input: input.input,
    requesterAgentName: input.requesterAgentName,
  })
}

export async function createUnauthenticatedAgentRun(input: CreateApiRunInput): Promise<AgentRunSummary> {
  return createRun({
    ownerClerkId: `api-agent:${toSlug(input.requesterAgentName) || "anonymous"}`,
    agent: { ...input.agent, price: input.amount },
    agentId: input.agentId,
    input: input.input,
    requesterAgentName: input.requesterAgentName,
  })
}

export function createApiFallbackAgent(slug: string, amount: string): AgentListing {
  const normalizedSlug = toSlug(slug) || crypto.randomUUID()
  const displayName = titleizeSlug(normalizedSlug)

  return {
    slug: normalizedSlug,
    name: displayName,
    category: "Coding",
    tagline: `${displayName} requested through the machine API`,
    description: `Unauthenticated API purchase request for ${displayName}.`,
    price: amount,
    rating: "API",
    jobs: "0",
    turnaround: "60 sec",
    inputLabel: "Task input",
    executionType: "Built-in GPT",
    accent: defaultAccent,
    promptExample: "",
    deliverables: ["Agent output", "Execution summary", "Buyer-ready result"],
    apiSnippet: buildApiSnippet(normalizedSlug, amount),
  }
}

async function createRun(input: CreateRunInput): Promise<AgentRunSummary> {
  const prisma = requirePrisma()
  const runId = crypto.randomUUID()
  const amount = formatUsdcAmount(input.agent.price)
  const appUrl = getAppUrl()
  const webhookUrl = `${appUrl}/api/webhooks/locus`
  const session = await createLocusCheckoutSession({
    amount,
    description: `${input.agent.name} agent run`,
    successUrl: `${appUrl}/task/${runId}`,
    cancelUrl: `${appUrl}/agent/${input.agent.slug}`,
    ...(isPublicHttpsUrl(webhookUrl) ? { webhookUrl } : {}),
    metadata: {
      runId,
      agentSlug: input.agent.slug,
      ownerClerkId: input.ownerClerkId,
      ...(input.requesterAgentName ? { requesterAgentName: input.requesterAgentName } : {}),
    },
    idempotencyKey: runId,
    receiptConfig: {
      enabled: true,
      merchantName: "AgentMart",
    },
  })

  const run = await prisma.agentRun.create({
    data: {
      id: runId,
      ownerClerkId: input.ownerClerkId,
      ...(input.agentId ? { agent: { connect: { id: input.agentId } } } : {}),
      agentSlug: input.agent.slug,
      agentName: input.agent.name,
      requesterAgentName: input.requesterAgentName,
      input: input.input,
      amount,
      status: "PENDING_PAYMENT",
      locusSessionId: session.id,
      locusCheckoutUrl: session.checkoutUrl,
      locusWebhookSecret: session.webhookSecret ?? session.secret,
    },
  })

  return runRecordToSummary(run)
}

export async function completeOwnedRun(ownerClerkId: string, id: string): Promise<AgentRunSummary | null> {
  const prisma = requirePrisma()
  const existingRun = await getOwnedRun(ownerClerkId, id)

  if (!existingRun) {
    return null
  }

  const outputBlocks = buildDemoOutputBlocks(existingRun)
  const outputJson = {
    taskId: id,
    status: "COMPLETED",
    output: `${existingRun.agentName} completed`,
    amountPaid: existingRun.amount,
  }

  const run = await prisma.agentRun.update({
    where: {
      id_ownerClerkId: {
        id,
        ownerClerkId,
      },
    },
    data: {
      status: "COMPLETED",
      outputTitle: `${existingRun.agentName} complete`,
      outputBlocks,
      outputJson,
    },
  })

  return runRecordToSummary(run)
}

export async function completeRunFromLocusPayment(input: {
  locusSessionId: string
  paymentTxHash?: string
  payerAddress?: string
  paidAt?: string
}): Promise<AgentRunSummary | null> {
  const prisma = requirePrisma()
  const existingRun = await getRunPaymentRecordByLocusSessionId(input.locusSessionId)

  if (!existingRun) {
    return null
  }

  const outputBlocks = buildDemoOutputBlocks(existingRun)
  const outputJson = {
    taskId: existingRun.id,
    status: "COMPLETED",
    output: `${existingRun.agentName} completed`,
    amountPaid: existingRun.amount,
    paymentTxHash: input.paymentTxHash,
  }

  const run = await prisma.agentRun.update({
    where: { locusSessionId: input.locusSessionId },
    data: {
      status: "COMPLETED",
      paymentTxHash: input.paymentTxHash,
      payerAddress: input.payerAddress,
      paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
      outputTitle: `${existingRun.agentName} complete`,
      outputBlocks,
      outputJson,
    },
  })

  return runRecordToSummary(run)
}

export async function expireRunFromLocusSession(sessionId: string): Promise<AgentRunSummary | null> {
  const prisma = requirePrisma()
  const existingRun = await getRunPaymentRecordByLocusSessionId(sessionId)

  if (!existingRun) {
    return null
  }

  const run = await prisma.agentRun.update({
    where: { locusSessionId: sessionId },
    data: { status: "PAYMENT_EXPIRED" },
  })

  return runRecordToSummary(run)
}

function requirePrisma(): Prisma {
  const prisma = getPrisma()

  if (!prisma) {
    throw new Error("DATABASE_URL is required for creating agents and runs.")
  }

  return prisma
}

function agentRecordToListing(agent: AgentRecord): AgentListing {
  return {
    slug: agent.slug,
    name: agent.name,
    category: agent.category as AgentListing["category"],
    tagline: agent.tagline,
    description: agent.description,
    price: agent.price,
    rating: agent.rating,
    jobs: agent.jobs,
    turnaround: agent.turnaround,
    inputLabel: agent.inputLabel,
    executionType: agent.executionType as AgentListing["executionType"],
    accent: agent.accent,
    promptExample: agent.promptExample,
    deliverables: agent.deliverables,
    apiSnippet: buildApiSnippet(agent.slug, agent.price),
  }
}

function runRecordToSummary(run: AgentRunRecord): AgentRunSummary {
  return {
    id: run.id,
    agentSlug: run.agentSlug,
    agentName: run.agentName,
    requesterAgentName: run.requesterAgentName,
    input: run.input,
    status: run.status,
    amount: run.amount,
    locusSessionId: run.locusSessionId,
    locusCheckoutUrl: run.locusCheckoutUrl,
    paymentTxHash: run.paymentTxHash,
    payerAddress: run.payerAddress,
    paidAt: run.paidAt,
    outputTitle: run.outputTitle,
    outputBlocks: parseOutputBlocks(run.outputBlocks),
    outputJson: isRecord(run.outputJson) ? run.outputJson : null,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
  }
}

function runRecordToHireSummary(run: AgentRunRecord): AgentHireSummary {
  return {
    id: run.id,
    amount: run.amount,
    buyerLabel: run.requesterAgentName ?? humanBuyerLabel(run.ownerClerkId),
    createdAt: run.createdAt,
    input: run.input,
    requesterAgentName: run.requesterAgentName,
    status: run.status,
  }
}

function runRecordToPaymentRecord(run: AgentRunRecord): AgentRunPaymentRecord {
  return {
    ...runRecordToSummary(run),
    locusWebhookSecret: run.locusWebhookSecret,
  }
}

function parseOutputBlocks(value: unknown): OutputBlock[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(isOutputBlock)
}

function isOutputBlock(value: unknown): value is OutputBlock {
  return isRecord(value) && typeof value.title === "string" && typeof value.body === "string"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function buildDemoOutputBlocks(run: AgentRunSummary): OutputBlock[] {
  return [
    {
      title: "Agent response",
      body: `${run.agentName} processed your request and produced a demo delivery for: "${run.input.slice(0, 140)}"`,
    },
    {
      title: "Payment state",
      body: `The run is marked paid for ${run.amount} USDC and is now available in your dashboard history.`,
    },
    {
      title: "Next integration",
      body: "Replace this demo output with the Locus paid webhook handler or the seller webhook response.",
    },
  ]
}

function humanBuyerLabel(ownerClerkId: string): string {
  if (ownerClerkId.startsWith("api-agent:")) {
    return ownerClerkId.replace("api-agent:", "Agent ")
  }

  return `Human ${ownerClerkId.slice(0, 8)}`
}

function formatUsdcAmount(value: string): string {
  const amount = Number(value.replace(/[$,\s]/g, ""))

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Agent price must be a positive USDC amount.")
  }

  return amount.toFixed(2)
}

export function getDefaultApiHireAmount(): string {
  return formatUsdcAmount(process.env.DEFAULT_API_HIRE_AMOUNT_USDC ?? "0.02")
}

export function isMatchingUsdcAmount(value: string, expected: string): boolean {
  return formatUsdcAmount(value) === formatUsdcAmount(expected)
}

function buildApiSnippet(slug: string, amount: string): string {
  return `curl -X POST /api/hire/${slug} \\
  -H "Content-Type: application/json" \\
  -d '{"agentName":"Your Buyer Agent","amount":"${formatUsdcAmount(amount)}","input":"..."}'`
}

function titleizeSlug(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}
