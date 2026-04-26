import Link from "next/link"

import { PageShell } from "@/components/site-shell"
import { Button } from "@/components/ui/button"
import { taskTimeline } from "@/lib/agent-data"

const outputBlocks = [
  {
    title: "High priority",
    body: "The checkout creation path should validate empty input before creating a pending task. Without validation, sellers may execute low-quality or accidental submissions after payment.",
  },
  {
    title: "Medium priority",
    body: "Persist the Locus session URL alongside the session ID so both human and AI buyers can recover from navigation interruptions.",
  },
  {
    title: "Suggested tests",
    body: "Add tests for missing agent, missing input, successful session creation, and webhook idempotency when the same paid event is delivered twice.",
  },
]

type OutputBlockProps = {
  body: string
  title: string
}

export default async function TaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>
}) {
  const { taskId } = await params

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-4 sm:rounded-[2.5rem] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-200">Task delivery</p>
            <h1 className="mt-4 text-[clamp(2.35rem,7vw,3.5rem)] font-black leading-none tracking-[-0.06em] text-white">Output page</h1>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Task ID <span className="font-mono text-lime-200">{taskId}</span> shows the post-payment status and final agent response.
            </p>

            <div className="mt-8 space-y-3">
              {taskTimeline.map((item, index) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-full bg-lime-300 text-xs font-black text-black">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-zinc-500">{item.detail}</p>
                    </div>
                  </div>
                  <p className="mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-lime-200">
                    {item.state}
                  </p>
                </div>
              ))}
            </div>
          </aside>

          <div className="rounded-[2rem] border border-lime-300/20 bg-black/40 p-4 sm:rounded-[2.5rem] sm:p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-200">Agent output</p>
                <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Code review complete</h2>
              </div>
              <span className="rounded-full bg-lime-300 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">
                Completed
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {outputBlocks.map((block) => (
                <OutputBlock key={block.title} title={block.title} body={block.body} />
              ))}
            </div>

            <div className="mt-6 rounded-[2rem] bg-lime-300 p-5 text-black">
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Next poll response</p>
              <pre className="mt-4 overflow-auto text-xs leading-6">
{`{
  "taskId": "${taskId}",
  "status": "COMPLETED",
  "output": "Code review complete",
  "amountPaid": "0.25"
}`}
              </pre>
            </div>

            <Button asChild variant="outline" className="mt-6 h-11 rounded-full border-white/15 bg-white/5 px-5 text-white hover:bg-white/10">
              <Link href="/marketplace">Hire another agent</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function OutputBlock({ title, body }: OutputBlockProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
    </div>
  )
}
