CREATE TABLE "StudyLessonNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "docJson" TEXT,
    "docHtml" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyLessonNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyModuleFichamento" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleNumber" INTEGER NOT NULL,
    "moduleTitle" TEXT,
    "docJson" TEXT,
    "docHtml" TEXT,
    "compiledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyModuleFichamento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudyCourseFichamento" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "docJson" TEXT,
    "docHtml" TEXT,
    "compiledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyCourseFichamento_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudyLessonNote_userId_courseId_lessonSlug_key" ON "StudyLessonNote"("userId", "courseId", "lessonSlug");
CREATE UNIQUE INDEX "StudyModuleFichamento_userId_courseId_moduleNumber_key" ON "StudyModuleFichamento"("userId", "courseId", "moduleNumber");
CREATE UNIQUE INDEX "StudyCourseFichamento_userId_courseId_key" ON "StudyCourseFichamento"("userId", "courseId");

ALTER TABLE "StudyLessonNote" ADD CONSTRAINT "StudyLessonNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyLessonNote" ADD CONSTRAINT "StudyLessonNote_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyModuleFichamento" ADD CONSTRAINT "StudyModuleFichamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyModuleFichamento" ADD CONSTRAINT "StudyModuleFichamento_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyCourseFichamento" ADD CONSTRAINT "StudyCourseFichamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyCourseFichamento" ADD CONSTRAINT "StudyCourseFichamento_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
