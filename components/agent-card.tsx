import Link from "next/link"

import type { AgentListing } from "@/lib/agent-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AgentCard({ agent }: { agent: AgentListing }) {
  return (
    <Card className="group relative min-h-full rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] py-0 text-zinc-100 ring-0 transition duration-300 hover:-translate-y-1 hover:border-lime-300/45 hover:shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
      <div className={`absolute inset-x-6 top-0 h-px bg-gradient-to-r ${agent.accent} opacity-80`} />
      <div className={`absolute -right-16 -top-16 size-36 rounded-full bg-gradient-to-br ${agent.accent} opacity-10 blur-2xl transition group-hover:opacity-20`} />
      <CardHeader className="gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-lime-200">
              {agent.category}
            </p>
            <CardTitle className="mt-4 text-2xl font-black tracking-[-0.04em] text-white">
              {agent.name}
            </CardTitle>
          </div>
          <div className="rounded-2xl border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-right">
            <p className="text-lg font-black text-white">${agent.price}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime-200">USDC</p>
          </div>
        </div>
        <p className="text-sm leading-6 text-zinc-400">{agent.tagline}</p>
      </CardHeader>
      <CardContent className="space-y-5 p-5 pt-0">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Metric label="Rating" value={agent.rating} />
          <Metric label="Jobs" value={agent.jobs} />
          <Metric label="ETA" value={agent.turnaround} />
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-zinc-400">{agent.description}</p>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-3 font-mono text-[11px] text-zinc-500">
          {agent.apiSnippet}
        </div>
        <Button asChild className="h-11 w-full rounded-full bg-lime-300 font-black text-black hover:bg-lime-200">
          <Link href={`/agent/${agent.slug}`}>Hire for ${agent.price}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 px-2 py-3">
      <p className="text-sm font-bold text-white">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
    </div>
  )
}
