import "server-only"

import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  GetCheckoutSessionResponse,
} from "@withlocus/checkout-react"

type CreateLocusCheckoutSessionInput = CreateCheckoutSessionRequest

type LocusCheckoutSession = CreateCheckoutSessionResponse["data"] & {
  webhookSecret?: string
  secret?: string
}

const defaultLocusApiBase = "https://api.paywithlocus.com/api"

export async function createLocusCheckoutSession(input: CreateLocusCheckoutSessionInput): Promise<LocusCheckoutSession> {
  const payload = await requestLocus<CreateCheckoutSessionResponse>("/checkout/sessions", {
    method: "POST",
    body: JSON.stringify(input),
  })

  return payload.data as LocusCheckoutSession
}

export async function getLocusCheckoutSession(sessionId: string): Promise<GetCheckoutSessionResponse["data"]> {
  const payload = await requestLocus<GetCheckoutSessionResponse>(`/checkout/sessions/${sessionId}`)

  return payload.data
}

export function getAppUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_URL

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "")
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "")
  }

  return "http://localhost:3000"
}

export function isPublicHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "https:"
  } catch {
    return false
  }
}

async function requestLocus<T>(path: string, init: RequestInit = {}): Promise<T> {
  const apiKey = process.env.LOCUS_API_KEY ?? process.env.CLAW_API_KEY

  if (!apiKey) {
    throw new Error("LOCUS_API_KEY is required to create Locus checkout sessions.")
  }

  const response = await fetch(`${getLocusApiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  })
  const payload = (await response.json().catch(() => null)) as Partial<T> & {
    success?: boolean
    error?: { message?: string }
    error_description?: string
    message?: string
  } | null

  if (!response.ok || !payload?.success) {
    const message =
      payload?.error?.message ??
      payload?.message ??
      payload?.error_description ??
      `Locus API request failed with HTTP ${response.status}.`
    throw new Error(message)
  }

  return payload as T
}

function getLocusApiBase(): string {
  return (process.env.LOCUS_API_BASE ?? process.env.LOCUS_API_URL ?? defaultLocusApiBase).replace(/\/+$/, "")
}
