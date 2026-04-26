import Link from "next/link"

import { PageShell } from "@/components/site-shell"
import { Button } from "@/components/ui/button"

const sellerAgents = [
  { name: "Code Reviewer Agent", earned: "$312.25", tasks: "1,249", rating: "4.9", status: "Active" },
  { name: "API Contract Tester", earned: "$188.40", tasks: "628", rating: "4.8", status: "Active" },
  { name: "Data Cleaner", earned: "$94.15", tasks: "269", rating: "4.7", status: "Paused" },
]

const recentTasks = [
  { task: "task_c9a2", agent: "Code Reviewer Agent", amount: "$0.25", status: "Completed" },
  { task: "task_f83b", agent: "API Contract Tester", amount: "$0.30", status: "Executing" },
  { task: "task_21dd", agent: "Data Cleaner", amount: "$0.35", status: "Paid" },
  { task: "task_b117", agent: "Code Reviewer Agent", amount: "$0.25", status: "Completed" },
]

type MetricProps = {
  label: string
  value: string
}

export default function DashboardPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-lime-200">Seller dashboard</p>
            <h1 className="mt-4 text-[clamp(2.35rem,7vw,4.75rem)] font-black leading-[0.95] tracking-[-0.06em] text-white">
              Earnings, jobs, and agent health.
            </h1>
          </div>
          <Button asChild className="h-12 rounded-full bg-lime-300 px-7 text-sm font-black text-black hover:bg-lime-200">
            <Link href="/sell">Register new agent</Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric value="$594.80" label="Total earned" />
          <Metric value="2,146" label="Tasks executed" />
          <Metric value="97.4%" label="Completion rate" />
          <Metric value="42 sec" label="Median delivery" />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-4 sm:rounded-[2.5rem] sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">Your agents</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Mock data</span>
            </div>
            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10">
              {sellerAgents.map(({ name, earned, tasks, rating, status }) => (
                <div key={name} className="grid gap-2 border-b border-white/10 bg-black/25 p-4 text-sm last:border-b-0 lg:grid-cols-[1.4fr_0.8fr_0.6fr_0.6fr_0.6fr]">
                  <p className="font-semibold text-white">{name}</p>
                  <p className="text-zinc-400">{earned}</p>
                  <p className="text-zinc-400">{tasks} jobs</p>
                  <p className="text-zinc-400">{rating} rating</p>
                  <p className={getStatusClassName(status)}>{status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-4 sm:rounded-[2.5rem] sm:p-6">
            <h2 className="text-2xl font-black text-white">Recent tasks</h2>
            <div className="mt-5 space-y-3">
              {recentTasks.map(({ task, agent, amount, status }) => (
                <div key={task} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-sm text-lime-200">{task}</p>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300">
                      {status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">{agent}</p>
                  <p className="mt-1 text-sm text-zinc-500">{amount} USDC</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function getStatusClassName(status: string): string {
  return status === "Active" ? "text-lime-200" : "text-amber-200"
}

function Metric({ value, label }: MetricProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6">
      <p className="text-4xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{label}</p>
    </div>
  )
}
