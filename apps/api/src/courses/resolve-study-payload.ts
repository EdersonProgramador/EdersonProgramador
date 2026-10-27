import type { Course } from "@prisma/client";
import { FL_COURSE } from "@ederson-agencia/shared";
import { loadFlBundle } from "./fl-content.js";
import {
  effectiveContentKey,
  FL_CONTENT_KEY,
  normalizeContentKey,
  PORTAL_CONTENT_KEY
} from "./content-key.js";
import { buildPortalStudyPayload, courseHasPortalContent } from "./portal-content.js";
import { prisma } from "../prisma.js";

function buildFlPayload(course: Course, completedSlugs: string[]) {
  const bundle = loadFlBundle();
  const mediaBaseUrl = `/courses/${course.slug}/media`;
  const files: Record<string, string> = {};
  for (const [id, rel] of Object.entries(bundle.videoManifest.files)) {
    files[id] = `${mediaBaseUrl}/${rel.replace(/^media\//, "")}`;
  }
  return {
    source: "fl" as const,
    curriculum: {
      ...bundle.curriculum,
      courseTitle: course.title,
      mediaBase: `${mediaBaseUrl}/videos`,
      documentBase: `${mediaBaseUrl}/docs`
    },
    lessonNotes: bundle.lessonNotes,
    bonusContent: bundle.bonusContent,
    videoManifest: { ...bundle.videoManifest, files },
    telegram: bundle.telegram,
    telegramMessageMap: bundle.telegramMessageMap,
    completedSlugs
  };
}

export async function courseContentReady(course: Course) {
  if (normalizeContentKey(course.contentKey) === FL_CONTENT_KEY || course.slug === FL_COURSE.slug) {
    return true;
  }
  return courseHasPortalContent(course.id);
}

export async function resolveStudyPayload(course: Course, userId: string) {
  const progress = await prisma.lessonProgress.findMany({
    where: { userId, courseId: course.id },
    select: { lessonSlug: true }
  });
  const completedSlugs = progress.map((p) => p.lessonSlug);

  const key = effectiveContentKey(course.contentKey);
  const preferFl =
    key === FL_CONTENT_KEY || course.slug === FL_COURSE.slug || normalizeContentKey(course.contentKey) === FL_CONTENT_KEY;

  if (!preferFl) {
    const portal = await buildPortalStudyPayload(course, completedSlugs);
    if (portal) {
      return { source: "portal" as const, ...portal };
    }
  }

  if (preferFl || course.slug === FL_COURSE.slug) {
    return buildFlPayload(course, completedSlugs);
  }

  const portalFallback = await buildPortalStudyPayload(course, completedSlugs);
  if (portalFallback) {
    return { source: "portal" as const, ...portalFallback };
  }

  return null;
}
