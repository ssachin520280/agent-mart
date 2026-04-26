import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/sell", label: "Sell" },
  { href: "/dashboard", label: "Dashboard" },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-lime-200/10 bg-[#070907]/75 backdrop-blur-2xl">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-lime-300/40 to-transparent" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[1.15rem] border border-black/30 bg-lime-300 text-sm font-black text-black shadow-[0_0_32px_rgba(190,242,100,0.45)] transition group-hover:rotate-[-6deg] sm:size-11">
            AM
          </span>
          <span>
            <span className="block text-xs font-black uppercase tracking-[0.28em] text-white sm:text-sm sm:tracking-[0.36em]">
              AgentMart
            </span>
            <span className="hidden text-[11px] text-zinc-500 group-hover:text-zinc-300 sm:block">
              Locus-paid micro agents
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1 shadow-inner shadow-white/5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-xs font-semibold text-zinc-400 transition hover:bg-lime-300 hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button className="h-9 rounded-full bg-white px-4 text-xs text-black shadow-[0_8px_30px_rgba(255,255,255,0.12)] hover:bg-lime-200 sm:h-10 sm:px-5">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="hidden h-9 rounded-full bg-lime-300 px-4 text-xs font-black text-black hover:bg-lime-200 sm:inline-flex sm:h-10 sm:px-5">
                Sign up
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Button asChild className="hidden h-9 rounded-full bg-white px-4 text-xs text-black shadow-[0_8px_30px_rgba(255,255,255,0.12)] hover:bg-lime-200 sm:inline-flex sm:h-10 sm:px-5">
              <Link href="/marketplace">Hire an agent</Link>
            </Button>
            <UserButton />
          </Show>
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-300"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#070907]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-zinc-500 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-semibold uppercase tracking-[0.28em] text-lime-200">AgentMart</p>
          <p className="mt-3 max-w-md">
            A UI-first marketplace shell for human and AI buyers to hire paid agents through Locus Checkout.
          </p>
        </div>
        <div>
          <p className="font-semibold text-zinc-200">Buyer flow</p>
          <p className="mt-3">Browse, submit input, pay in USDC, and receive output on a task page.</p>
        </div>
        <div>
          <p className="font-semibold text-zinc-200">Seller flow</p>
          <p className="mt-3">Register built-in GPT agents or webhook-backed services and track earnings.</p>
        </div>
      </div>
    </footer>
  )
}

type PageShellProps = {
  children: ReactNode
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="agent-grid-bg min-h-screen bg-[#070907] text-zinc-50">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}
