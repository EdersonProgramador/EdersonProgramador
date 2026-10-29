-- Metas de repetição por curso + contagem de ciclos concluídos
ALTER TABLE "Course" ADD COLUMN "repetitionGoalMax" INTEGER;

CREATE TABLE "CourseUserStudyState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "activeRepetitionCycle" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseUserStudyState_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseUserStudyState_userId_courseId_key" ON "CourseUserStudyState"("userId", "courseId");
CREATE INDEX "CourseUserStudyState_courseId_idx" ON "CourseUserStudyState"("courseId");

ALTER TABLE "CourseUserStudyState" ADD CONSTRAINT "CourseUserStudyState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseUserStudyState" ADD CONSTRAINT "CourseUserStudyState_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CourseRepetitionCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lessonCount" INTEGER NOT NULL,

    CONSTRAINT "CourseRepetitionCompletion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseRepetitionCompletion_userId_courseId_cycleNumber_key" ON "CourseRepetitionCompletion"("userId", "courseId", "cycleNumber");
CREATE INDEX "CourseRepetitionCompletion_courseId_idx" ON "CourseRepetitionCompletion"("courseId");

ALTER TABLE "CourseRepetitionCompletion" ADD CONSTRAINT "CourseRepetitionCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseRepetitionCompletion" ADD CONSTRAINT "CourseRepetitionCompletion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
