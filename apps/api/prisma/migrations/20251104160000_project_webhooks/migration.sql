-- AlterTable
ALTER TABLE "Project" ADD COLUMN "webhookIngressToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_webhookIngressToken_key" ON "Project"("webhookIngressToken");

-- CreateTable
CREATE TABLE "ProjectExternalEvent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectExternalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectExternalEvent_projectId_createdAt_idx" ON "ProjectExternalEvent"("projectId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProjectExternalEvent" ADD CONSTRAINT "ProjectExternalEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
