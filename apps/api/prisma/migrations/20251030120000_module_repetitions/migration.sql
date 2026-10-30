CREATE TABLE "CourseModuleUserStudyState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "activeRepetitionCycle" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseModuleUserStudyState_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseModuleRepetitionCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lessonCount" INTEGER NOT NULL,

    CONSTRAINT "CourseModuleRepetitionCompletion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseModuleUserStudyState_userId_moduleId_key" ON "CourseModuleUserStudyState"("userId", "moduleId");
CREATE INDEX "CourseModuleUserStudyState_moduleId_idx" ON "CourseModuleUserStudyState"("moduleId");

CREATE UNIQUE INDEX "CourseModuleRepetitionCompletion_userId_moduleId_cycleNumber_key" ON "CourseModuleRepetitionCompletion"("userId", "moduleId", "cycleNumber");
CREATE INDEX "CourseModuleRepetitionCompletion_moduleId_idx" ON "CourseModuleRepetitionCompletion"("moduleId");

ALTER TABLE "CourseModuleUserStudyState" ADD CONSTRAINT "CourseModuleUserStudyState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseModuleUserStudyState" ADD CONSTRAINT "CourseModuleUserStudyState_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseModuleRepetitionCompletion" ADD CONSTRAINT "CourseModuleRepetitionCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseModuleRepetitionCompletion" ADD CONSTRAINT "CourseModuleRepetitionCompletion_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
