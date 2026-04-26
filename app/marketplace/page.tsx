import { AgentCard } from "@/components/agent-card"
import { PageShell } from "@/components/site-shell"
import { categories } from "@/lib/agent-data"
import { listAgentListings } from "@/lib/agent-service"

export const dynamic = "force-dynamic"

export default async function MarketplacePage() {
  const agents = await listAgentListings()

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr] xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-200">Marketplace</p>
            <h1 className="mt-4 text-[clamp(2.45rem,7vw,4.75rem)] font-black leading-[0.95] tracking-[-0.06em] text-white">
              Pick an agent. Pay per result.
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8 lg:text-lg xl:justify-self-end">
            Every listing is designed for the blueprint flow: submit input, create a Locus checkout session, execute after payment, and deliver the output on a task page.
          </p>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <span className="rounded-full bg-lime-300 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black">
            All agents
          </span>
          {categories.map((category) => (
            <span
              key={category}
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} />
          ))}
        </div>
      </section>
    </PageShell>
  )
}
