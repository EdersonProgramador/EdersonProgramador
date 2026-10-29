-- Submódulos (seções) dentro de cada módulo — mesmo modelo do sumário FL (section + sectionTitle)
ALTER TABLE "CourseLesson" ADD COLUMN "sectionTitle" TEXT;
ALTER TABLE "CourseLesson" ADD COLUMN "sectionSortOrder" INTEGER NOT NULL DEFAULT 1;
