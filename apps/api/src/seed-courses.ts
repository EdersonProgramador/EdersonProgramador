import { FL_COURSE } from "@ederson-agencia/shared";
import type { FastifyBaseLogger } from "fastify";
import { prisma } from "./prisma.js";

export async function ensureSeedCourses(log: FastifyBaseLogger) {
  const course = await prisma.course.upsert({
    where: { slug: FL_COURSE.slug },
    create: {
      slug: FL_COURSE.slug,
      title: FL_COURSE.title,
      summary: FL_COURSE.summary,
      status: "PUBLISHED",
      visibility: "INTERNAL",
      contentKey: "fl",
      sortOrder: 0
    },
    update: {
      title: FL_COURSE.title,
      summary: FL_COURSE.summary,
      status: "PUBLISHED",
      contentKey: "fl"
    }
  });

  log.info({ slug: course.slug }, "Curso FL disponível na área Cursos.");
}
