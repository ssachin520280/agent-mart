"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { notFound, redirect } from "next/navigation"

import {
  type AgentListingInput,
  completeOwnedRun,
  createAgentListing,
  createAgentRun,
  deleteOwnedAgentListing,
  getAgentListing,
  updateOwnedAgentListing,
  toSlug,
} from "@/lib/agent-service"

export async function createAgentListingAction(formData: FormData) {
  const userId = await requireUserId()
  const input = readAgentListingInput(formData)

  if (!input) {
    redirect("/sell?error=missing-fields")
  }

  const agent = await createAgentListing({ ownerClerkId: userId, ...input }).catch((error: unknown) => {
    if (isUniqueConstraintError(error)) {
      redirect("/sell?error=slug-taken")
    }

    throw error
  })

  revalidatePath("/marketplace")
  revalidatePath("/dashboard")
  redirect(`/agent/${agent.slug}`)
}

export async function updateAgentListingAction(formData: FormData) {
  const userId = await requireUserId()
  const id = readString(formData, "id")
  const originalSlug = readString(formData, "originalSlug")
  const input = readAgentListingInput(formData)
  const errorPath = originalSlug ? `/agent/${originalSlug}/edit?error=missing-fields` : "/dashboard"

  if (!id || !originalSlug || !input) {
    redirect(errorPath)
  }

  const agent = await updateOwnedAgentListing(userId, id, input).catch((error: unknown) => {
    if (isUniqueConstraintError(error)) {
      redirect(`/agent/${originalSlug}/edit?error=slug-taken`)
    }

    throw error
  })

  if (!agent) {
    notFound()
  }

  revalidatePath("/marketplace")
  revalidatePath("/dashboard")
  revalidatePath(`/agent/${originalSlug}`)
  revalidatePath(`/agent/${agent.slug}`)
  redirect(`/agent/${agent.slug}`)
}

export async function deleteAgentListingAction(formData: FormData) {
  const userId = await requireUserId()
  const id = readString(formData, "id")
  const slug = readString(formData, "slug")

  if (!id) {
    redirect("/dashboard")
  }

  const deleted = await deleteOwnedAgentListing(userId, id)

  if (!deleted) {
    notFound()
  }

  revalidatePath("/marketplace")
  revalidatePath("/dashboard")
  revalidatePath(`/agent/${slug}`)
  redirect("/dashboard")
}

export async function hireAgentAction(formData: FormData) {
  const userId = await requireUserId()
  const slug = readString(formData, "slug")
  const input = readString(formData, "input")
  const agent = await getAgentListing(slug)

  if (!agent) {
    notFound()
  }

  if (!input) {
    throw new Error("Input is required before hiring an agent.")
  }

  const run = await createAgentRun({
    ownerClerkId: userId,
    agent,
    agentId: agent.id,
    input,
  })

  revalidatePath("/dashboard")
  redirect(`/agent/${agent.slug}/checkout?runId=${run.id}`)
}

export async function completeAgentRunAction(formData: FormData) {
  const userId = await requireUserId()
  const runId = readString(formData, "runId")

  if (!runId) {
    throw new Error("Missing run id.")
  }

  const run = await completeOwnedRun(userId, runId)

  if (!run) {
    notFound()
  }

  revalidatePath("/dashboard")
  revalidatePath(`/task/${run.id}`)
  redirect(`/task/${run.id}`)
}

async function requireUserId() {
  const { userId, redirectToSignIn } = await auth()

  if (!userId) {
    redirectToSignIn()
    throw new Error("Unauthorized")
  }

  return userId
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

function readAgentListingInput(formData: FormData): AgentListingInput | null {
  const name = readString(formData, "name")
  const slug = toSlug(readString(formData, "slug") || name)
  const category = readString(formData, "category")
  const price = readString(formData, "price")
  const description = readString(formData, "description")
  const inputLabel = readString(formData, "inputLabel")
  const executionType = readString(formData, "executionType")
  const execution = readString(formData, "execution")

  if (!name || !slug || !category || !price || !description || !inputLabel || !executionType || !execution) {
    return null
  }

  const normalizedExecutionType: AgentListingInput["executionType"] = executionType.toLowerCase().includes("webhook")
    ? "Seller webhook"
    : "Built-in GPT"

  return {
    slug,
    name,
    category: category as AgentListingInput["category"],
    tagline: description.slice(0, 96),
    description,
    price,
    turnaround: "60 sec",
    inputLabel,
    executionType: normalizedExecutionType,
    promptExample: execution,
    deliverables: ["Agent output", "Execution summary", "Buyer-ready result"],
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002"
}
