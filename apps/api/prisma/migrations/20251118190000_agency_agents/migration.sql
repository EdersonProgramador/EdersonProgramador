-- CreateTable
CREATE TABLE "AgencyAgent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sourceProjectId" TEXT,
    "brandVoice" TEXT,
    "offerSummary" TEXT,
    "guardrails" TEXT,
    "systemPrompt" TEXT,
    "configJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyAgentDeployment" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyAgentDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyAgentJob" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "projectId" TEXT,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "title" TEXT NOT NULL,
    "inputJson" JSONB,
    "draftJson" JSONB,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyAgentJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgencyAgent_status_templateId_idx" ON "AgencyAgent"("status", "templateId");

-- CreateIndex
CREATE INDEX "AgencyAgent_sourceProjectId_idx" ON "AgencyAgent"("sourceProjectId");

-- CreateIndex
CREATE INDEX "AgencyAgentDeployment_projectId_status_idx" ON "AgencyAgentDeployment"("projectId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AgencyAgentDeployment_agentId_projectId_key" ON "AgencyAgentDeployment"("agentId", "projectId");

-- CreateIndex
CREATE INDEX "AgencyAgentJob_status_createdAt_idx" ON "AgencyAgentJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AgencyAgentJob_agentId_status_idx" ON "AgencyAgentJob"("agentId", "status");

-- AddForeignKey
ALTER TABLE "AgencyAgentDeployment" ADD CONSTRAINT "AgencyAgentDeployment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgencyAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyAgentJob" ADD CONSTRAINT "AgencyAgentJob_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgencyAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
