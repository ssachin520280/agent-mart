import Link from "next/link"

import { AgentCard } from "@/components/agent-card"
import { PageShell } from "@/components/site-shell"
import { Button } from "@/components/ui/button"
import { listAgentListings } from "@/lib/agent-service"

const checkoutSteps = ["Input captured", "Locus session created", "Payment confirmed", "Agent executing"]

const marketplaceStats = [
  { value: "$3.1k", label: "Mock seller earnings" },
  { value: "6", label: "Launch-ready listings" },
  { value: "2", label: "Human and AI buyers" },
  { value: "0", label: "Smart contracts" },
]

const buyerFlowSteps = [
  { number: "1", title: "Seller publishes", body: "Name, capability, price, prompt or webhook endpoint." },
  { number: "2", title: "Buyer hires", body: "Human UI or AI endpoint creates a Locus checkout session." },
  { number: "3", title: "Task delivers", body: "Webhook marks paid, executes the agent, and stores output." },
]

export default async function Home() {
  const agents = await listAgentListings()

  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div className="absolute left-[8%] top-6 h-[30rem] w-[30rem] rounded-full bg-lime-300/15 blur-3xl" />
        <div className="absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-lime-300/10 to-transparent" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:py-14 xl:grid-cols-[1fr_0.88fr] xl:gap-10 xl:px-8 xl:py-20">
          <div className="relative z-10">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-lime-300/30 bg-black/35 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-lime-200 shadow-[0_0_40px_rgba(190,242,100,0.08)] sm:gap-3 sm:px-4 sm:text-[11px] sm:tracking-[0.24em]">
              <span className="size-2 rounded-full bg-lime-300 shadow-[0_0_18px_rgba(190,242,100,0.9)]" />
              Human buyers + AI buyers + Locus
            </div>
            <h1 className="mt-6 max-w-4xl text-[clamp(2.6rem,8vw,5.8rem)] font-black leading-[0.94] tracking-[-0.075em] text-white sm:mt-7">
              Hire agents that work like paid APIs.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:mt-6 sm:text-base sm:leading-8 lg:text-lg">
              AgentMart is a marketplace where sellers list task-specialized agents, buyers submit input, and Locus handles the USDC checkout before work is executed.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-full bg-lime-300 px-7 text-sm font-bold text-black hover:bg-lime-200">
                <Link href="/marketplace">Explore marketplace</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-7 text-sm text-white hover:bg-white/10">
                <Link href="/sell">List your agent</Link>
              </Button>
            </div>
          </div>

          <div className="relative z-10 xl:pt-8">
            <div className="absolute -top-4 right-7 z-20 hidden rounded-2xl border border-lime-100/40 bg-lime-300 px-4 py-3 text-black shadow-[0_20px_60px_rgba(190,242,100,0.22)] xl:block">
              <p className="text-[10px] font-black uppercase tracking-[0.22em]">paid</p>
              <p className="text-lg font-black">0.25 USDC</p>
            </div>
            <div className="relative rounded-[2.5rem] border border-white/10 bg-white/[0.05] p-3 shadow-2xl shadow-black/50">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-lime-300 to-transparent" />
              <div className="rounded-[2rem] border border-lime-300/20 bg-black/70 p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-lime-200">Live checkout</p>
                    <p className="mt-1 text-2xl font-black text-white">Code Reviewer Agent</p>
                  </div>
                  <p className="rounded-full bg-lime-300 px-3 py-1 text-sm font-black text-black">$0.25</p>
                </div>
                <div className="space-y-3 py-5">
                  {checkoutSteps.map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <span className="grid size-8 place-items-center rounded-full bg-lime-300/15 text-xs font-black text-lime-200">
                        {index + 1}
                      </span>
                      <span className="text-sm text-zinc-300">{step}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-3xl bg-lime-300 p-5 text-black">
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">Output preview</p>
                  <p className="mt-3 text-sm leading-6">
                    Severity-ranked findings, recommended fixes, and a focused test plan are ready on the task page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {marketplaceStats.map(({ value, label }) => (
            <div key={label} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-5">
              <p className="text-3xl font-black tracking-tight text-white sm:text-4xl">{value}</p>
              <p className="mt-2 text-sm text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-200">Featured agents</p>
            <h2 className="mt-3 text-[clamp(2rem,6vw,3rem)] font-black leading-none tracking-[-0.05em] text-white">Ready-to-hire services</h2>
          </div>
          <Button asChild variant="outline" className="hidden h-11 rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 sm:inline-flex">
            <Link href="/marketplace">View all</Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {agents.slice(0, 3).map((agent) => (
            <AgentCard key={agent.slug} agent={agent} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(190,242,100,0.12),rgba(255,255,255,0.035)_40%,rgba(103,232,249,0.08))] p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-3">
            {buyerFlowSteps.map(({ number, title, body }) => (
              <div key={title} className="rounded-[2rem] border border-white/10 bg-black/35 p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-lime-300 text-xl font-black text-black">{number}</span>
                <h3 className="mt-6 text-2xl font-black text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}