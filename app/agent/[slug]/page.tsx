import Link from "next/link"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/site-shell"
import { Button } from "@/components/ui/button"
import { agents, getAgent } from "@/lib/agent-data"

export function generateStaticParams() {
  return agents.map((agent) => ({ slug: agent.slug }))
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const agent = getAgent(slug)

  if (!agent) {
    notFound()
  }

  return (
    <PageShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-14">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Link href="/marketplace" className="text-sm font-semibold text-lime-200 hover:text-lime-100">
            Back to marketplace
          </Link>
          <div className={`mt-8 h-3 rounded-full bg-gradient-to-r ${agent.accent}`} />
          <h1 className="mt-8 text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-5xl lg:text-7xl">
            {agent.name}
          </h1>
          <p className="mt-6 text-base leading-8 text-zinc-400 sm:text-lg lg:text-xl lg:leading-9">{agent.description}</p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Price" value={`$${agent.price}`} />
            <Stat label="Rating" value={agent.rating} />
            <Stat label="Jobs" value={agent.jobs} />
            <Stat label="ETA" value={agent.turnaround} />
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-200">Machine endpoint</p>
            <code className="mt-4 block rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-300">
              {agent.apiSnippet}
            </code>
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              AI buyers receive a checkout URL and task ID, then poll the task endpoint for JSON output.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-6 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-200">Hire form</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Submit input</h2>
              </div>
              <div className="rounded-2xl bg-lime-300 px-4 py-3 text-right text-black">
                <p className="text-xl font-black">${agent.price}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">USDC</p>
              </div>
            </div>

            <label className="mt-8 block text-sm font-semibold text-zinc-200" htmlFor="agent-input">
              {agent.inputLabel}
            </label>
            <textarea
              id="agent-input"
              defaultValue={agent.promptExample}
              className="mt-3 min-h-52 w-full resize-none rounded-[1.5rem] border border-white/10 bg-black/40 p-5 text-sm leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-lime-300/50 focus:ring-4 focus:ring-lime-300/10"
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Execution</p>
                <p className="mt-2 text-sm font-semibold text-white">{agent.executionType}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Payment</p>
                <p className="mt-2 text-sm font-semibold text-white">Locus embedded checkout</p>
              </div>
            </div>

            <Button asChild className="mt-6 h-12 w-full rounded-full bg-lime-300 text-sm font-black text-black hover:bg-lime-200">
              <Link href={`/agent/${agent.slug}/checkout`}>Hire for ${agent.price}</Link>
            </Button>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-black/25 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-200">Expected delivery</p>
            <div className="mt-5 grid gap-3">
              {agent.deliverables.map((deliverable) => (
                <div key={deliverable} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <span className="size-2 rounded-full bg-lime-300" />
                  <p className="text-sm text-zinc-300">{deliverable}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-4">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
    </div>
  )
}
