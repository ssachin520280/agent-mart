"use client"

import { LocusCheckout, type CheckoutSuccessData } from "@withlocus/checkout-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type LocusCheckoutPanelProps = {
  cancelPath: string
  checkoutUrl: string | null
  sessionId: string
  taskId: string
}

export function LocusCheckoutPanel({ cancelPath, checkoutUrl, sessionId, taskId }: LocusCheckoutPanelProps) {
  const router = useRouter()
  const [message, setMessage] = useState("Complete payment to unlock the agent run.")

  async function handleSuccess(data: CheckoutSuccessData) {
    setMessage(`Payment confirmed: ${data.txHash}`)
    const response = await fetch("/api/checkout/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId: data.sessionId, taskId }),
    })

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      setMessage(payload?.error ?? "Payment confirmed, but task confirmation is still pending.")
      return
    }

    router.push(`/task/${taskId}`)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[1.5rem] bg-white text-black">
        <LocusCheckout
          sessionId={sessionId}
          checkoutUrl={checkoutUrl ?? undefined}
          mode="embedded"
          style={{ minHeight: 700, width: "100%" }}
          onSuccess={handleSuccess}
          onCancel={() => router.push(cancelPath)}
          onError={(error) => setMessage(error.message)}
        />
      </div>
      <p className="text-center text-xs leading-5 text-zinc-400">{message}</p>
    </div>
  )
}
