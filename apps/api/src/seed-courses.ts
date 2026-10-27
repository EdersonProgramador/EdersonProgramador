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

  const patched = await prisma.course.updateMany({
    where: {
      status: "PUBLISHED",
      visibility: "INTERNAL",
      OR: [{ contentKey: null }, { contentKey: "" }, { NOT: { contentKey: "fl" } }]
    },
    data: { contentKey: "fl" }
  });
  if (patched.count > 0) {
    log.info({ count: patched.count }, "Cursos internos publicados alinhados ao contentKey fl.");
  }
}
