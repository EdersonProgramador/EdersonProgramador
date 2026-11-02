import type { Course } from "@prisma/client";
import { FL_COURSE, isAcademyInternalAdmin } from "@ederson-agencia/shared";
import type { AgencyRole } from "@ederson-agencia/shared";
import { FL_CONTENT_KEY, normalizeContentKey } from "./content-key.js";
import { publishedLessonCountsByCourseIds } from "./portal-content.js";

export function courseUsesFlContent(course: Course): boolean {
  return normalizeContentKey(course.contentKey) === FL_CONTENT_KEY || course.slug === FL_COURSE.slug;
}

export type CatalogListUser = { id: string; role: string; email: string };

export function catalogUserIsInternalAdmin(user: CatalogListUser): boolean {
  return isAcademyInternalAdmin({ role: user.role as AgencyRole, email: user.email });
}

export function catalogHasAccess(
  course: Course,
  user: CatalogListUser,
  internalAdmin: boolean,
  enrolledCourseIds: Set<string>
): boolean {
  if (course.visibility === "INTERNAL") return internalAdmin;
  if (internalAdmin) return true;
  if (course.status !== "PUBLISHED") return false;
  if (course.visibility === "PUBLIC_SALE") return enrolledCourseIds.has(course.id);
  return false;
}

export function catalogVisibleInMineList(
  course: Course,
  internalAdmin: boolean,
  enrolledCourseIds: Set<string>
): boolean {
  if (internalAdmin) return true;
  if (course.visibility === "INTERNAL") return false;
  if (course.visibility === "PUBLIC_SALE") return enrolledCourseIds.has(course.id);
  return false;
}

export async function buildCourseContentReadyMap(courses: Course[]): Promise<Map<string, boolean>> {
  const ready = new Map<string, boolean>();
  const portalIds: string[] = [];
  for (const course of courses) {
    if (courseUsesFlContent(course)) ready.set(course.id, true);
    else portalIds.push(course.id);
  }
  const counts = await publishedLessonCountsByCourseIds(portalIds);
  for (const id of portalIds) {
    ready.set(id, (counts.get(id) ?? 0) > 0);
  }
  return ready;
}

export function courseCardFields(
  course: Course,
  user: CatalogListUser,
  internalAdmin: boolean,
  enrolledCourseIds: Set<string>,
  contentReady: boolean,
  options?: { storeList?: boolean }
) {
  const hasAccess = catalogHasAccess(course, user, internalAdmin, enrolledCourseIds);
  const purchasable =
    course.visibility === "PUBLIC_SALE" && course.priceCents != null && course.priceCents > 0;

  const card = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    visibility: course.visibility,
    priceCents: course.priceCents,
    currency: course.currency,
    purchasable,
    hasAccess,
    locked: !hasAccess && purchasable,
    contentReady,
    coverUrl: course.coverUrl
  };

  if (options?.storeList) return card;
  if (!internalAdmin) {
    return { ...card, purchasable: false, locked: false, priceCents: null };
  }
  return card;
}
