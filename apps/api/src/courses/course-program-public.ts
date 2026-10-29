import {
  buildDefaultCourseProgramContent,
  type CourseProgramContent,
  type PublicCourseProgram
} from "@ederson-agencia/shared";
import type { Course } from "@prisma/client";
import { z } from "zod";
import { courseContentReady } from "./resolve-study-payload.js";
import { prisma } from "../prisma.js";

const salesPageSchema = z
  .object({
    promise: z.string().min(1).optional(),
    deliverables: z.array(z.string().min(1)).optional(),
    bonus: z
      .array(
        z.object({
          title: z.string().min(1),
          body: z.string().min(1)
        })
      )
      .optional(),
    guarantee: z.string().min(1).optional()
  })
  .partial();

function mergeProgramContent(
  course: Pick<Course, "slug" | "title" | "summary" | "salesPage">
): CourseProgramContent {
  const base = buildDefaultCourseProgramContent(course);

  if (course.salesPage == null) return base;

  const parsed = salesPageSchema.safeParse(course.salesPage);
  if (!parsed.success) return base;

  const patch = parsed.data;
  return {
    promise: patch.promise ?? base.promise,
    deliverables: patch.deliverables?.length ? patch.deliverables : base.deliverables,
    bonus: patch.bonus?.length ? patch.bonus : base.bonus,
    guarantee: patch.guarantee ?? base.guarantee
  };
}

export async function getPublicCourseProgram(slug: string): Promise<PublicCourseProgram | null> {
  const course = await prisma.course.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      visibility: "PUBLIC_SALE",
      priceCents: { gt: 0 }
    }
  });
  if (!course) return null;

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    priceCents: course.priceCents!,
    currency: course.currency,
    coverUrl: course.coverUrl,
    contentReady: await courseContentReady(course),
    program: mergeProgramContent(course)
  };
}
