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

function mapLessonType(lessonType: string): "document" | "video" {
  if (lessonType === "document") return "document";
  if (lessonType === "article") return "document";
  return "video";
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

type PublishedLesson = {
  slug: string;
  title: string;
  lessonKey: string | null;
  lessonType: string;
  sortOrder: number;
  sectionTitle: string | null;
  sectionSortOrder: number;
  bodyHtml: string | null;
  videoUrl: string | null;
  documentUrl: string | null;
};

function sectionKey(lesson: Pick<PublishedLesson, "sectionSortOrder" | "sectionTitle">) {
  const title = lesson.sectionTitle?.trim() || "";
  return `${lesson.sectionSortOrder}::${title}`;
}

function buildSectionMap(lessons: PublishedLesson[]) {
  const order: string[] = [];
  const map = new Map<string, PublishedLesson[]>();
  for (const lesson of lessons) {
    const key = sectionKey(lesson);
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(lesson);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return { order, map };
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

    const { order: sectionOrder, map: sectionMap } = buildSectionMap(published);

    sectionOrder.forEach((key, sectionIndex) => {
      const sectionLessons = sectionMap.get(key)!;
      const sectionNum = sectionIndex + 1;
      const sectionTitle =
        sectionLessons[0]?.sectionTitle?.trim() || mod.title;

      sectionLessons.forEach((lesson, li) => {
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
          section: sectionNum,
          sectionTitle,
          indexInSection: li + 1,
          countInSection: sectionLessons.length,
          breadcrumb: [mod.title, sectionTitle, lesson.title].filter(Boolean),
          prev: null,
          next: null
        });
        order += 1;
      });
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
