-- Lead ↔ usuário e participação na live
ALTER TABLE "Lead" ADD COLUMN "userId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "liveAttended" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN "liveAttendedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Lead_userId_key" ON "Lead"("userId");
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Contrato digital do projeto
ALTER TABLE "Project" ADD COLUMN "contractStatus" TEXT NOT NULL DEFAULT 'NONE';
ALTER TABLE "Project" ADD COLUMN "contractSignedAt" TIMESTAMP(3);
ALTER TABLE "Project" ADD COLUMN "contractAcceptedName" TEXT;
ALTER TABLE "Project" ADD COLUMN "contractVersion" TEXT NOT NULL DEFAULT 'app-zero-v1';
