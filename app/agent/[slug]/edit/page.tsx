import { auth } from "@clerk/nextjs/server"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/site-shell"
import { Button } from "@/components/ui/button"
import { deleteAgentListingAction, updateAgentListingAction } from "@/lib/actions"
import { getOwnedAgent } from "@/lib/agent-service"

type FieldProps = {
  defaultValue?: string
  label: string
  name: string
  placeholder: string
  required?: boolean
  type?: "text" | "number"
}

export const dynamic = "force-dynamic"

export default async function EditAgentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { slug } = await params
  const { error } = await searchParams
  const { userId } = await auth()

  if (!userId) {
    notFound()
  }

  const agent = await getOwnedAgent(userId, slug)

  if (!agent) {
    notFound()
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link href="/dashboard" className="text-sm font-semibold text-lime-200 hover:text-lime-100">
          Back to dashboard
        </Link>

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-lime-200">Edit listing</p>
            <h1 className="mt-4 text-[clamp(2.35rem,7vw,4.75rem)] font-black leading-[0.95] tracking-[-0.06em] text-white">
              Update or remove your agent.
            </h1>
            <p className="mt-6 text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8 lg:text-lg">
              Only the Clerk user who created this listing can edit or delete it.
            </p>

            <form action={deleteAgentListingAction} className="mt-8 rounded-[2rem] border border-red-300/20 bg-red-400/10 p-5">
              <input name="id" type="hidden" value={agent.id} />
              <input name="slug" type="hidden" value={agent.slug} />
              <p className="text-sm font-semibold text-red-100">Delete listing</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                This removes the marketplace listing. Existing task history remains attached to buyers.
              </p>
              <Button className="mt-5 h-11 rounded-full bg-red-300 px-5 text-sm font-black text-black hover:bg-red-200">
                Delete agent
              </Button>
            </form>
          </div>

          <form action={updateAgentListingAction} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-4 sm:rounded-[2.5rem] sm:p-6">
            <input name="id" type="hidden" value={agent.id} />
            <input name="originalSlug" type="hidden" value={agent.slug} />
            {error === "missing-fields" ? (
              <div className="mb-5 rounded-[1.5rem] border border-red-300/25 bg-red-400/10 p-4 text-sm font-semibold text-red-100">
                Please complete every required field before saving.
              </div>
            ) : null}
            {error === "slug-taken" ? (
              <div className="mb-5 rounded-[1.5rem] border border-red-300/25 bg-red-400/10 p-4 text-sm font-semibold text-red-100">
                That slug is already used by another listing. Choose a different slug.
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Field defaultValue={agent.name} label="Agent name" name="name" placeholder="Security Reviewer" required />
              <Field defaultValue={agent.slug} label="Slug" name="slug" placeholder="security-reviewer" required />
              <Field defaultValue={agent.category} label="Category" name="category" placeholder="Coding" required />
              <Field defaultValue={agent.price} label="Price in USDC" name="price" placeholder="0.25" required type="number" />
            </div>

            <label className="mt-4 block text-sm font-semibold text-zinc-200" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={agent.description}
              placeholder="Explain what your agent does, what buyers should submit, and what they receive."
              required
              className="mt-2 min-h-28 w-full rounded-[1.5rem] border border-white/10 bg-black/40 p-4 text-sm text-zinc-200 outline-none focus:border-lime-300/50 focus:ring-4 focus:ring-lime-300/10"
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field defaultValue={agent.inputLabel} label="Input label" name="inputLabel" placeholder="Paste your code here" required />
              <Field defaultValue={agent.executionType} label="Execution type" name="executionType" placeholder="BUILTIN or WEBHOOK" required />
            </div>

            <label className="mt-4 block text-sm font-semibold text-zinc-200" htmlFor="execution">
              System prompt or webhook URL
            </label>
            <textarea
              id="execution"
              name="execution"
              defaultValue={agent.promptExample}
              placeholder="You are a strict reviewer... or https://seller.com/agent-webhook"
              required
              className="mt-2 min-h-36 w-full rounded-[1.5rem] border border-white/10 bg-black/40 p-4 text-sm text-zinc-200 outline-none focus:border-lime-300/50 focus:ring-4 focus:ring-lime-300/10"
            />

            <Button className="mt-6 h-12 w-full rounded-full bg-lime-300 text-sm font-black text-black hover:bg-lime-200">
              Save changes
            </Button>
          </form>
        </div>
      </section>
    </PageShell>
  )
}

function Field({ defaultValue, label, name, placeholder, required = false, type = "text" }: FieldProps) {
  return (
    <label className="block text-sm font-semibold text-zinc-200">
      {label}
      <input
        defaultValue={defaultValue}
        min={type === "number" ? "0" : undefined}
        name={name}
        placeholder={placeholder}
        required={required}
        step={type === "number" ? "0.01" : undefined}
        type={type}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-lime-300/50 focus:ring-4 focus:ring-lime-300/10"
      />
    </label>
  )
}
