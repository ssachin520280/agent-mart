"use client"

import { LocusCheckout, type CheckoutSuccessData } from "@withlocus/checkout-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

type LocusCheckoutPanelProps = {
  cancelPath: string
  checkoutUrl: string | null
  sessionId: string
  taskId: string
}

export function LocusCheckoutPanel({ cancelPath, checkoutUrl, sessionId, taskId }: LocusCheckoutPanelProps) {
  const router = useRouter()
  const [message, setMessage] = useState("Complete payment to unlock the agent run.")
  const isConfirmingRef = useRef(false)

  const confirmCheckout = useCallback(
    async (successData?: CheckoutSuccessData) => {
      if (isConfirmingRef.current) {
        return
      }

      isConfirmingRef.current = true

      if (successData?.txHash) {
        setMessage(`Payment confirmed: ${successData.txHash}`)
      }

      const response = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, taskId }),
      })

      if (response.ok) {
        router.push(`/task/${taskId}`)
        router.refresh()
        return
      }

      isConfirmingRef.current = false

      if (response.status === 409) {
        return
      }

      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      setMessage(payload?.error ?? "Payment confirmed, but task confirmation is still pending.")
    },
    [router, sessionId, taskId]
  )

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void confirmCheckout()
    }, 2500)

    return () => window.clearInterval(intervalId)
  }, [confirmCheckout])

  async function handleSuccess(data: CheckoutSuccessData) {
    await confirmCheckout(data)
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
