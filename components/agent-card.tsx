import Link from "next/link"

import type { AgentListing } from "@/lib/agent-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AgentCardProps = {
  agent: AgentListing
}

type MetricProps = {
  label: string
  value: string
}

const insetSurfaceClassName = "rounded-2xl border border-lime-200/10 bg-black/45"

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="group relative min-h-full rounded-[2rem] !border-lime-200/15 !bg-[#0d120d] py-0 !text-zinc-100 ring-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:!border-lime-300/45 hover:!bg-[#111811] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_24px_90px_rgba(0,0,0,0.42)]">
      <div className={`absolute inset-x-6 top-0 h-px bg-gradient-to-r ${agent.accent} opacity-80`} />
      <div className={`absolute -right-16 -top-16 size-36 rounded-full bg-gradient-to-br ${agent.accent} opacity-20 blur-2xl transition group-hover:opacity-30`} />
      <CardHeader className="relative z-10 gap-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="inline-flex rounded-full border border-lime-200/20 bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-lime-200">
              {agent.category}
            </p>
            <CardTitle className="mt-4 min-h-14 text-xl font-black tracking-[-0.04em] !text-white sm:text-2xl">
              {agent.name}
            </CardTitle>
          </div>
          <div className="shrink-0 rounded-2xl border border-lime-300/25 bg-lime-300/15 px-3 py-2 text-right shadow-[0_0_35px_rgba(190,242,100,0.08)]">
            <p className="text-lg font-black text-lime-50">${agent.price}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime-200">USDC</p>
          </div>
        </div>
        <p className="min-h-12 text-sm font-medium leading-6 !text-zinc-200">{agent.tagline}</p>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-1 flex-col space-y-4 p-4 pt-0 sm:space-y-5 sm:p-5 sm:pt-0">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Metric label="Rating" value={agent.rating} />
          <Metric label="Jobs" value={agent.jobs} />
          <Metric label="ETA" value={agent.turnaround} />
        </div>
        <p className="min-h-[4.5rem] text-sm font-medium leading-6 !text-zinc-200/95">{agent.description}</p>
        <div className={`${insetSurfaceClassName} mt-auto p-3 font-mono text-[11px] font-semibold !text-lime-100/80`}>
          {agent.apiSnippet}
        </div>
        <Button asChild className="h-11 w-full rounded-full bg-lime-300 font-black text-black shadow-[0_12px_35px_rgba(190,242,100,0.18)] hover:bg-lime-200">
          <Link href={`/agent/${agent.slug}`}>Hire for ${agent.price}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className={`${insetSurfaceClassName} px-2 py-3`}>
      <p className="text-sm font-bold text-lime-50">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400">{label}</p>
    </div>
  )
}
