import "server-only"

import type { AgentListing } from "@/lib/agent-data"
import { getPrisma } from "@/lib/prisma"

export type AgentRunSummary = {
  id: string
  agentSlug: string
  agentName: string
  input: string
  status: string
  amount: string
  outputTitle: string | null
  outputBlocks: OutputBlock[]
  outputJson: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
}

export type OutputBlock = {
  title: string
  body: string
}

export type OwnedAgentSummary = AgentListing & {
  id: string
  createdAt: Date
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
  agentSlug: string
  agentName: string
  input: string
  status: string
  amount: string
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
  const prisma = requirePrisma()

  const run = await prisma.agentRun.create({
    data: {
      ownerClerkId: input.ownerClerkId,
      agentId: input.agentId,
      agentSlug: input.agent.slug,
      agentName: input.agent.name,
      input: input.input,
      amount: input.agent.price,
      status: "PENDING_PAYMENT",
      locusSessionId: `locus_demo_${crypto.randomUUID().slice(0, 8)}`,
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
    apiSnippet: agent.apiSnippet,
  }
}

function runRecordToSummary(run: AgentRunRecord): AgentRunSummary {
  return {
    id: run.id,
    agentSlug: run.agentSlug,
    agentName: run.agentName,
    input: run.input,
    status: run.status,
    amount: run.amount,
    outputTitle: run.outputTitle,
    outputBlocks: parseOutputBlocks(run.outputBlocks),
    outputJson: isRecord(run.outputJson) ? run.outputJson : null,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
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

export function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}
