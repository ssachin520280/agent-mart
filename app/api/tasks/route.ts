import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { listOwnedRuns } from "@/lib/agent-service"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tasks = await listOwnedRuns(userId)

  return NextResponse.json({ tasks })
}
