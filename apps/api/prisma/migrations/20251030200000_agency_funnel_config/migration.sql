CREATE TABLE "AgencyFunnelConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "livePublished" BOOLEAN NOT NULL DEFAULT false,
    "liveTitle" TEXT NOT NULL DEFAULT 'Aula ao vivo — App do Zero ao Lançamento',
    "liveSubtitle" TEXT,
    "liveScheduledAt" TIMESTAMP(3),
    "liveStreamUrl" TEXT,
    "liveReplayUrl" TEXT,
    "packagesJson" JSONB,
    "contractIntro" TEXT,
    "contractClausesJson" JSONB,
    "checkoutTitle" TEXT,
    "checkoutBody" TEXT,
    "checkoutPixKey" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyFunnelConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgencyNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgencyNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AgencyNotification_userId_readAt_idx" ON "AgencyNotification"("userId", "readAt");
CREATE INDEX "AgencyNotification_projectId_idx" ON "AgencyNotification"("projectId");

ALTER TABLE "AgencyNotification" ADD CONSTRAINT "AgencyNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgencyNotification" ADD CONSTRAINT "AgencyNotification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
