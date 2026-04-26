ALTER TABLE "AgentRun"
ADD COLUMN "locusCheckoutUrl" TEXT,
ADD COLUMN "locusWebhookSecret" TEXT,
ADD COLUMN "paymentTxHash" TEXT,
ADD COLUMN "payerAddress" TEXT,
ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "AgentRun_locusSessionId_key" ON "AgentRun"("locusSessionId");
