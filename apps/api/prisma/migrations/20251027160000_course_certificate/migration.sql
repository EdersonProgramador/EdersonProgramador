CREATE TABLE "CourseCertificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "lessonCount" INTEGER NOT NULL,

    CONSTRAINT "CourseCertificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseCertificate_verificationCode_key" ON "CourseCertificate"("verificationCode");
CREATE UNIQUE INDEX "CourseCertificate_userId_courseId_key" ON "CourseCertificate"("userId", "courseId");

ALTER TABLE "CourseCertificate" ADD CONSTRAINT "CourseCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseCertificate" ADD CONSTRAINT "CourseCertificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
