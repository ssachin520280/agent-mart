import "server-only"

import { PrismaNeon } from "@prisma/adapter-neon"

import { PrismaClient } from "@/app/generated/prisma/client"

type PrismaGlobal = typeof globalThis & {
  prisma?: PrismaClient
}

const globalForPrisma = globalThis as PrismaGlobal

export function getPrisma(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    return null
  }

  if (!globalForPrisma.prisma) {
    const adapter = new PrismaNeon({ connectionString })
    globalForPrisma.prisma = new PrismaClient({ adapter })
  }

  return globalForPrisma.prisma
}
