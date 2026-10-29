-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "packageTier" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "packageTier" TEXT NOT NULL DEFAULT 'professional';

-- CreateTable
CREATE TABLE "ProjectUpgradeRequest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fromTier" TEXT NOT NULL,
    "toTier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "clientMessage" TEXT,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectUpgradeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPhaseDeliverable" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "feedbackNote" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectPhaseDeliverable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectUpgradeRequest_projectId_status_idx" ON "ProjectUpgradeRequest"("projectId", "status");

-- CreateIndex
CREATE INDEX "ProjectPhaseDeliverable_phaseId_sortOrder_idx" ON "ProjectPhaseDeliverable"("phaseId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ProjectUpgradeRequest" ADD CONSTRAINT "ProjectUpgradeRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPhaseDeliverable" ADD CONSTRAINT "ProjectPhaseDeliverable_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ProjectPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
