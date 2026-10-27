import type { FastifyBaseLogger } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { PORTAL_CONTENT_KEY } from "./content-key.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const catalog = JSON.parse(
  readFileSync(fileURLToPath(new URL("./catalog/usp-leitura-escrita.json", import.meta.url)), "utf8")
) as UspCatalog;

type CatalogLesson = {
  slug: string;
  title: string;
  lessonType?: string;
  bodyHtml?: string;
  videoId?: string;
  durationSeconds?: number;
};

type UspCatalog = {
  slug: string;
  title: string;
  summary: string;
  sortOrder?: number;
  introModule?: { title: string; lessons: CatalogLesson[] };
  modules: { title: string; lessons: CatalogLesson[] }[];
};

const EXPECTED_VIDEO_LESSONS = 33;

export async function ensureUspLeituraEscritaCourse(prisma: PrismaClient, log: FastifyBaseLogger) {
  const course = await prisma.course.upsert({
    where: { slug: catalog.slug },
    create: {
      slug: catalog.slug,
      title: catalog.title,
      summary: catalog.summary,
      status: "PUBLISHED",
      visibility: "INTERNAL",
      contentKey: PORTAL_CONTENT_KEY,
      sortOrder: catalog.sortOrder ?? 2
    },
    update: {
      title: catalog.title,
      summary: catalog.summary,
      status: "PUBLISHED",
      contentKey: PORTAL_CONTENT_KEY,
      sortOrder: catalog.sortOrder ?? 2
    }
  });

  const videoLessons = await prisma.courseLesson.count({
    where: { module: { courseId: course.id }, lessonType: "video" }
  });
  if (videoLessons >= EXPECTED_VIDEO_LESSONS) {
    return;
  }

  await prisma.courseModule.deleteMany({ where: { courseId: course.id } });

  let sortOrder = 0;
  const intro = catalog.introModule;
  if (intro?.lessons?.length) {
    await prisma.courseModule.create({
      data: {
        courseId: course.id,
        sortOrder: sortOrder++,
        title: intro.title,
        lessons: {
          create: intro.lessons.map((lesson: CatalogLesson, li: number) => ({
            slug: lesson.slug,
            sortOrder: li,
            title: lesson.title,
            lessonType: lesson.lessonType ?? "article",
            status: "PUBLISHED",
            bodyHtml: lesson.bodyHtml ?? null
          }))
        }
      }
    });
  }

  for (const mod of catalog.modules) {
    await prisma.courseModule.create({
      data: {
        courseId: course.id,
        sortOrder: sortOrder++,
        title: mod.title,
        lessons: {
          create: mod.lessons.map((lesson: CatalogLesson, li: number) => ({
            slug: lesson.slug,
            sortOrder: li,
            title: lesson.title,
            lessonType: "video",
            status: "PUBLISHED",
            videoUrl: lesson.videoId
              ? `https://www.youtube.com/watch?v=${lesson.videoId}`
              : null,
            bodyHtml: lesson.durationSeconds
              ? `<p class="course-text-muted text-sm">Duração aproximada: ${formatDuration(lesson.durationSeconds as number)}.</p>`
              : null
          }))
        }
      }
    });
  }

  log.info({ slug: catalog.slug, modules: catalog.modules.length + (intro ? 1 : 0) }, "Curso USP leitura/escrita sincronizado.");
}

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return s ? `${m} min ${s} s` : `${m} min`;
}
