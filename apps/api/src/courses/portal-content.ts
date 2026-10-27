import type { Course } from "@prisma/client";
import { prisma } from "../prisma.js";

export type StudyCurriculumItem = {
  order: number;
  type: "document" | "video";
  id: string;
  slug: string;
  title: string;
  module?: number | null;
  moduleTitle?: string;
  section?: number;
  sectionTitle?: string;
  indexInSection?: number;
  countInSection?: number;
  breadcrumb: string[];
  prev: string | null;
  next: string | null;
};

/** Artigos e PDFs externos usam o painel de vídeo + `lessonNotes` (sem PDF em `/media/docs`). */
function mapLessonType(lessonType: string): "document" | "video" {
  return lessonType === "video" ? "video" : "video";
}

function buildLessonNoteHtml(lesson: {
  bodyHtml: string | null;
  documentUrl: string | null;
  lessonType: string;
}) {
  const parts: string[] = [];
  if (lesson.lessonType === "document" && lesson.documentUrl?.trim()) {
    const url = lesson.documentUrl.trim();
    parts.push(
      `<p><a href="${url}" target="_blank" rel="noopener noreferrer">Abrir documento</a></p>`,
      `<iframe src="${url}" title="Documento" style="width:100%;height:50vh;border:0;border-radius:8px"></iframe>`
    );
  }
  if (lesson.bodyHtml?.trim()) parts.push(lesson.bodyHtml.trim());
  return parts.length ? parts.join("\n") : null;
}

export async function countPublishedPortalLessons(courseId: string) {
  return prisma.courseLesson.count({
    where: {
      status: "PUBLISHED",
      module: { courseId }
    }
  });
}

export async function courseHasPortalContent(courseId: string) {
  return (await countPublishedPortalLessons(courseId)) > 0;
}

export async function buildPortalStudyPayload(
  course: Course,
  completedSlugs: string[]
) {
  const modules = await prisma.courseModule.findMany({
    where: { courseId: course.id },
    orderBy: { sortOrder: "asc" },
    include: {
      lessons: {
        where: { status: "PUBLISHED" },
        orderBy: { sortOrder: "asc" }
      }
    }
  });

  const flatLessons = modules.flatMap((m) => m.lessons);
  if (flatLessons.length === 0) {
    return null;
  }

  const lessonNotes: Record<string, { html?: string; displayTitle?: string }> = {};
  const files: Record<string, string> = {};
  const items: StudyCurriculumItem[] = [];
  let order = 0;

  for (let mi = 0; mi < modules.length; mi++) {
    const mod = modules[mi];
    const moduleNum = mi + 1;
    const published = mod.lessons;
    if (published.length === 0) continue;

    published.forEach((lesson, li) => {
      const id = lesson.lessonKey?.trim() || lesson.slug.toUpperCase();
      const type = mapLessonType(lesson.lessonType);
      const slug = lesson.slug;

      const noteHtml = buildLessonNoteHtml(lesson);
      if (noteHtml) {
        lessonNotes[slug] = { html: noteHtml, displayTitle: lesson.title };
      }
      if (lesson.videoUrl?.trim()) {
        files[id] = lesson.videoUrl.trim();
      }

      items.push({
        order,
        type,
        id,
        slug,
        title: lesson.title,
        module: moduleNum,
        moduleTitle: mod.title,
        section: 1,
        sectionTitle: mod.title,
        indexInSection: li + 1,
        countInSection: published.length,
        breadcrumb: [mod.title, lesson.title],
        prev: null,
        next: null
      });
      order += 1;
    });
  }

  for (let i = 0; i < items.length; i++) {
    items[i].prev = i > 0 ? items[i - 1].slug : null;
    items[i].next = i < items.length - 1 ? items[i + 1].slug : null;
  }

  const moduleMeta = modules
    .filter((m) => m.lessons.length > 0)
    .map((m, idx) => ({ module: idx + 1, title: m.title }));

  const mediaBaseUrl = `/courses/${course.slug}/media`;

  return {
    curriculum: {
      version: 1,
      courseTitle: course.title,
      mediaBase: `${mediaBaseUrl}/videos`,
      documentBase: `${mediaBaseUrl}/docs`,
      videoExtensions: [".mp4", ".webm", ".mkv"],
      totalLessons: items.length,
      modules: moduleMeta,
      items
    },
    lessonNotes,
    bonusContent: [] as { slug: string; title: string; html?: string }[],
    videoManifest: {
      total: items.length,
      present: Object.keys(files).length,
      files
    },
    telegram: {
      enabled: false,
      baseUrl: "",
      startMessageId: 0,
      overrides: {}
    },
    telegramMessageMap: {} as Record<string, number>,
    completedSlugs
  };
}
