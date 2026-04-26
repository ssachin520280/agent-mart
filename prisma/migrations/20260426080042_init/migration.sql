-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "ownerClerkId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "rating" TEXT NOT NULL DEFAULT 'New',
    "jobs" TEXT NOT NULL DEFAULT '0',
    "turnaround" TEXT NOT NULL,
    "inputLabel" TEXT NOT NULL,
    "executionType" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "promptExample" TEXT NOT NULL,
    "deliverables" TEXT[],
    "apiSnippet" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "ownerClerkId" TEXT NOT NULL,
    "agentId" TEXT,
    "agentSlug" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "amount" TEXT NOT NULL,
    "locusSessionId" TEXT,
    "outputTitle" TEXT,
    "outputBlocks" JSONB,
    "outputJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_slug_key" ON "Agent"("slug");

-- CreateIndex
CREATE INDEX "Agent_ownerClerkId_idx" ON "Agent"("ownerClerkId");

-- CreateIndex
CREATE INDEX "AgentRun_ownerClerkId_idx" ON "AgentRun"("ownerClerkId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentRun_id_ownerClerkId_key" ON "AgentRun"("id", "ownerClerkId");

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
