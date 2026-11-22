-- CreateTable
CREATE TABLE "AgencyOpsDeliverable" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vertical" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "approvalStatus" TEXT NOT NULL DEFAULT 'NONE',
    "projectId" TEXT,
    "agentJobId" TEXT,
    "timeMinutes" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyOpsDeliverable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgencyOpsDeliverable_vertical_status_idx" ON "AgencyOpsDeliverable"("vertical", "status");

-- CreateIndex
CREATE INDEX "AgencyOpsDeliverable_projectId_vertical_idx" ON "AgencyOpsDeliverable"("projectId", "vertical");
