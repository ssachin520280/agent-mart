import { auth } from "@clerk/nextjs/server"
import Link from "next/link"

import { PageShell } from "@/components/site-shell"
import { Button } from "@/components/ui/button"
import { deleteAgentListingAction } from "@/lib/actions"
import { listOwnedAgents, listOwnedRuns } from "@/lib/agent-service"

type MetricProps = {
  label: string
  value: string
}

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { userId, redirectToSignIn } = await auth()

  if (!userId) {
    redirectToSignIn()
    throw new Error("Unauthorized")
  }

  const [sellerAgents, recentTasks] = await Promise.all([listOwnedAgents(userId), listOwnedRuns(userId)])
  const completedTasks = recentTasks.filter((task) => task.status === "COMPLETED")
  const totalEarned = completedTasks.reduce((sum, task) => sum + Number(task.amount || 0), 0)

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
          <Metric value={`$${totalEarned.toFixed(2)}`} label="Completed spend" />
          <Metric value={String(recentTasks.length)} label="Agents hired" />
          <Metric value={String(sellerAgents.length)} label="Agents listed" />
          <Metric value={String(completedTasks.length)} label="Completed tasks" />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-4 sm:rounded-[2.5rem] sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">Agents you listed</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Neon scoped</span>
            </div>
            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10">
              {sellerAgents.length > 0 ? (
                sellerAgents.map((agent) => (
                  <div key={agent.id} className="grid gap-3 border-b border-white/10 bg-black/25 p-4 text-sm last:border-b-0 lg:grid-cols-[1.35fr_0.7fr_0.7fr_1.1fr] lg:items-center">
                    <Link href={`/agent/${agent.slug}`} className="font-semibold text-white hover:text-lime-200">
                      {agent.name}
                    </Link>
                    <p className="text-zinc-400">${agent.price} USDC</p>
                    <p className="text-zinc-400">{agent.category}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" className="h-8 rounded-full border-white/15 bg-white/5 px-3 text-xs text-white hover:bg-white/10">
                        <Link href={`/agent/${agent.slug}/edit`}>Edit</Link>
                      </Button>
                      <form action={deleteAgentListingAction}>
                        <input name="id" type="hidden" value={agent.id} />
                        <input name="slug" type="hidden" value={agent.slug} />
                        <Button className="h-8 rounded-full bg-red-300 px-3 text-xs font-black text-black hover:bg-red-200">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-black/25 p-5 text-sm leading-6 text-zinc-400">
                  You have not listed an agent yet. Create one from the seller onboarding page.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-4 sm:rounded-[2.5rem] sm:p-6">
            <h2 className="text-2xl font-black text-white">Work from hired agents</h2>
            <div className="mt-5 space-y-3">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <Link key={task.id} href={`/task/${task.id}`} className="block rounded-[1.5rem] border border-white/10 bg-black/25 p-4 transition hover:border-lime-300/30">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-sm text-lime-200">{task.id}</p>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300">
                        {task.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">{task.agentName}</p>
                    <p className="mt-1 text-sm text-zinc-500">${task.amount} USDC</p>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5 text-sm leading-6 text-zinc-400">
                  Hire an agent from the marketplace to see its work and delivery output here.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function Metric({ value, label }: MetricProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6">
      <p className="text-4xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{label}</p>
    </div>
  )
}
