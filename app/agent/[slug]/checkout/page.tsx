import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/site-shell"
import { Button } from "@/components/ui/button"
import { agents } from "@/lib/agent-data"
import { completeAgentRunAction } from "@/lib/actions"
import { getAgentListing, getOwnedRun } from "@/lib/agent-service"

type RowProps = {
  label: string
  value: string
}

export function generateStaticParams() {
  return agents.map((agent) => ({ slug: agent.slug }))
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ runId?: string }>
}) {
  const { slug } = await params
  const { runId } = await searchParams
  const { userId } = await auth()
  const agent = await getAgentListing(slug)

  if (!agent || !userId || !runId) {
    notFound()
  }

  const run = await getOwnedRun(userId, runId)

  if (!run || run.agentSlug !== agent.slug) {
    notFound()
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-4 sm:rounded-[2.5rem] md:p-8">
          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <aside className="rounded-[2rem] border border-white/10 bg-black/30 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-200">Checkout session</p>
              <h1 className="mt-4 text-[clamp(2.25rem,7vw,3rem)] font-black leading-none tracking-[-0.05em] text-white">Pay to execute</h1>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                This screen is a UI placeholder for the future embedded Locus checkout component.
              </p>

              <div className="mt-8 space-y-3">
                <Row label="Agent" value={agent.name} />
                <Row label="Amount" value={`$${agent.price} USDC`} />
                <Row label="Mode" value="Embedded" />
                <Row label="Task" value={run.id} />
                <Row label="Status" value={run.status.replaceAll("_", " ")} />
              </div>
            </aside>

            <div className="rounded-[2rem] border border-lime-300/20 bg-[#d7ff66] p-4 text-black shadow-[0_0_80px_rgba(190,242,100,0.12)]">
              <div className="rounded-[1.5rem] bg-black p-5 text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-200">Locus</p>
                    <p className="mt-1 text-2xl font-black">Embedded checkout</p>
                  </div>
                  <div className="rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-black">
                    {agent.price} USDC
                  </div>
                </div>

                <div className="my-6 rounded-[1.5rem] border border-dashed border-lime-300/40 bg-lime-300/10 p-8 text-center">
                  <p className="text-sm font-semibold text-lime-100">LocusCheckout renders here</p>
                  <p className="mt-3 text-xs leading-5 text-zinc-400">
                    After Clerk and Locus are wired, this panel can receive sessionId and handle onSuccess.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Wallet</p>
                    <p className="mt-2 text-sm font-semibold text-white">Locus Wallet or MetaMask</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Webhook</p>
                    <p className="mt-2 text-sm font-semibold text-white">checkout.session.paid</p>
                  </div>
                </div>

                <form action={completeAgentRunAction}>
                  <input name="runId" type="hidden" value={run.id} />
                  <Button className="mt-6 h-12 w-full rounded-full bg-lime-300 text-sm font-black text-black hover:bg-lime-200">
                    Simulate success
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function Row({ label, value }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  )
}
