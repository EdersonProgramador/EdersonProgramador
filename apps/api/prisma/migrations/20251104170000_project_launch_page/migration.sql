-- AlterTable
ALTER TABLE "Project" ADD COLUMN "launchPublicSlug" TEXT;
ALTER TABLE "Project" ADD COLUMN "launchPagePublished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Project" ADD COLUMN "launchPageJson" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "Project_launchPublicSlug_key" ON "Project"("launchPublicSlug");
