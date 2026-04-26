import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AgentMart | Locus-powered agent marketplace",
  description: "Hire human-listed and AI-readable micro-agents through Locus Checkout.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased font-sans", geistSans.variable, geistMono.variable)}>
      <body className="min-h-full flex flex-col bg-[#070907]">{children}</body>
    </html>
  )
}
