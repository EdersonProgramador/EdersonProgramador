-- AlterTable
ALTER TABLE "MarketingCampaign" ADD COLUMN IF NOT EXISTS "kind" TEXT NOT NULL DEFAULT 'BLAST';
ALTER TABLE "MarketingCampaign" ADD COLUMN IF NOT EXISTS "sequenceJson" JSONB;

-- CreateTable
CREATE TABLE IF NOT EXISTS "MarketingCampaignEnrollment" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "leadId" TEXT,
    "level" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextSendAt" TIMESTAMP(3),
    "lastSentAt" TIMESTAMP(3),
    "metaJson" JSONB,

    CONSTRAINT "MarketingCampaignEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MarketingCampaignEnrollment_campaignId_email_key" ON "MarketingCampaignEnrollment"("campaignId", "email");
CREATE INDEX IF NOT EXISTS "MarketingCampaignEnrollment_status_nextSendAt_idx" ON "MarketingCampaignEnrollment"("status", "nextSendAt");
CREATE INDEX IF NOT EXISTS "MarketingCampaignEnrollment_email_idx" ON "MarketingCampaignEnrollment"("email");
CREATE INDEX IF NOT EXISTS "MarketingCampaignEnrollment_level_idx" ON "MarketingCampaignEnrollment"("level");

DO $$ BEGIN
  ALTER TABLE "MarketingCampaignEnrollment"
    ADD CONSTRAINT "MarketingCampaignEnrollment_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
