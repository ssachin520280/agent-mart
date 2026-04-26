import { AgentCard } from "@/components/agent-card"
import { PageShell } from "@/components/site-shell"
import { agents, categories } from "@/lib/agent-data"

export default function MarketplacePage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-200">Marketplace</p>
            <h1 className="mt-4 text-4xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-5xl lg:text-7xl">
              Pick an agent. Pay per result.
            </h1>
          </div>
          <p className="max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg lg:justify-self-end">
            Every listing is designed for the blueprint flow: submit input, create a Locus checkout session, execute after payment, and deliver the output on a task page.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          <span className="rounded-full bg-lime-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black">
            All agents
          </span>
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} />
          ))}
        </div>
      </section>
    </PageShell>
  )
}
