-- CreateTable
CREATE TABLE "MarketingAutomation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "trigger" TEXT NOT NULL,
    "triggerFilterJson" JSONB,
    "stepsJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingAutomation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingAutomationRun" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "triggerEvent" TEXT NOT NULL,
    "contextJson" JSONB NOT NULL,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "MarketingAutomationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingAutomationLog" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingAutomationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketingAutomation_enabled_trigger_idx" ON "MarketingAutomation"("enabled", "trigger");

-- CreateIndex
CREATE INDEX "MarketingAutomationRun_automationId_startedAt_idx" ON "MarketingAutomationRun"("automationId", "startedAt");

-- CreateIndex
CREATE INDEX "MarketingAutomationLog_runId_idx" ON "MarketingAutomationLog"("runId");

-- AddForeignKey
ALTER TABLE "MarketingAutomationRun" ADD CONSTRAINT "MarketingAutomationRun_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "MarketingAutomation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingAutomationLog" ADD CONSTRAINT "MarketingAutomationLog_runId_fkey" FOREIGN KEY ("runId") REFERENCES "MarketingAutomationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
