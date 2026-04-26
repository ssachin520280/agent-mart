import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { getOwnedRun } from "@/lib/agent-service"

export async function GET(_request: Request, context: { params: Promise<{ taskId: string }> }) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { taskId } = await context.params
  const task = await getOwnedRun(userId, taskId)

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  return NextResponse.json({ task })
}
