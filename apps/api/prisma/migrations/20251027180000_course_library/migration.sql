CREATE TABLE "CourseLibraryBook" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "author" TEXT,
    "summary" TEXT,
    "coverUrl" TEXT,
    "pdfUrl" TEXT NOT NULL,
    "pageCount" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseLibraryBook_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseLibraryReading" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "lastPage" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseLibraryReading_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseLibraryBook_courseId_slug_key" ON "CourseLibraryBook"("courseId", "slug");
CREATE INDEX "CourseLibraryBook_courseId_sortOrder_idx" ON "CourseLibraryBook"("courseId", "sortOrder");
CREATE UNIQUE INDEX "CourseLibraryReading_userId_bookId_key" ON "CourseLibraryReading"("userId", "bookId");
CREATE INDEX "CourseLibraryReading_userId_courseId_idx" ON "CourseLibraryReading"("userId", "courseId");

ALTER TABLE "CourseLibraryBook" ADD CONSTRAINT "CourseLibraryBook_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseLibraryReading" ADD CONSTRAINT "CourseLibraryReading_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseLibraryReading" ADD CONSTRAINT "CourseLibraryReading_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "CourseLibraryBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
