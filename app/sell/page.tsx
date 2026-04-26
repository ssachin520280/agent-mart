import { PageShell } from "@/components/site-shell"
import { Button } from "@/components/ui/button"

type FieldProps = {
  label: string
  placeholder: string
}

export default function SellPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-lime-200">Seller onboarding</p>
            <h1 className="mt-4 text-[clamp(2.35rem,7vw,4.75rem)] font-black leading-[0.95] tracking-[-0.06em] text-white">
              Register an agent people can pay to run.
            </h1>
            <p className="mt-6 text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8 lg:text-lg">
              This form mirrors the future Prisma Agent model: identity, category, price, input style, and either a built-in system prompt or webhook endpoint.
            </p>
          </div>

          <form className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-4 sm:rounded-[2.5rem] sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Agent name" placeholder="Security Reviewer" />
              <Field label="Slug" placeholder="security-reviewer" />
              <Field label="Category" placeholder="CODING" />
              <Field label="Price in USDC" placeholder="0.25" />
            </div>

            <label className="mt-4 block text-sm font-semibold text-zinc-200" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Explain what your agent does, what buyers should submit, and what they receive."
              className="mt-2 min-h-28 w-full rounded-[1.5rem] border border-white/10 bg-black/40 p-4 text-sm text-zinc-200 outline-none focus:border-lime-300/50 focus:ring-4 focus:ring-lime-300/10"
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Input label" placeholder="Paste your code here" />
              <Field label="Execution type" placeholder="BUILTIN or WEBHOOK" />
            </div>

            <label className="mt-4 block text-sm font-semibold text-zinc-200" htmlFor="execution">
              System prompt or webhook URL
            </label>
            <textarea
              id="execution"
              placeholder="You are a strict reviewer... or https://seller.com/agent-webhook"
              className="mt-2 min-h-36 w-full rounded-[1.5rem] border border-white/10 bg-black/40 p-4 text-sm text-zinc-200 outline-none focus:border-lime-300/50 focus:ring-4 focus:ring-lime-300/10"
            />

            <div className="mt-6 rounded-[2rem] border border-lime-300/20 bg-lime-300/10 p-5">
              <p className="text-sm font-semibold text-lime-100">Ready for Clerk later</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Once auth is added, this submit action can attach ownerId from Clerk and create the agent record in Prisma.
              </p>
            </div>

            <Button className="mt-6 h-12 w-full rounded-full bg-lime-300 text-sm font-black text-black hover:bg-lime-200">
              Preview listing
            </Button>
          </form>
        </div>
      </section>
    </PageShell>
  )
}

function Field({ label, placeholder }: FieldProps) {
  return (
    <label className="block text-sm font-semibold text-zinc-200">
      {label}
      <input
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-lime-300/50 focus:ring-4 focus:ring-lime-300/10"
      />
    </label>
  )
}
