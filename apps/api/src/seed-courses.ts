import { FL_COURSE } from "@ederson-agencia/shared";
import type { FastifyBaseLogger } from "fastify";
import { FL_CONTENT_KEY, PORTAL_CONTENT_KEY } from "./courses/content-key.js";
import { ensureUspLeituraEscritaCourse } from "./courses/import-catalog-course.js";
import { ensureEnemCronogramaCourse, ENEM_CRONOGRAMA_SLUG } from "./courses/import-enem-cronograma-course.js";
import { ensureTanarCourse, TANAR_SLUG } from "./courses/import-tanar-course.js";
import { ensurePortalStarterContent } from "./courses/portal-starter.js";
import { prisma } from "./prisma.js";

const USP_LEITURA_SLUG = "praticas-leitura-escrita-academicas-usp";

export async function ensureSeedCourses(log: FastifyBaseLogger) {
  const course = await prisma.course.upsert({
    where: { slug: FL_COURSE.slug },
    create: {
      slug: FL_COURSE.slug,
      title: FL_COURSE.title,
      summary: FL_COURSE.summary,
      status: "PUBLISHED",
      visibility: "INTERNAL",
      contentKey: FL_CONTENT_KEY,
      coverUrl: FL_COURSE.coverUrl,
      sortOrder: 0
    },
    update: {
      title: FL_COURSE.title,
      summary: FL_COURSE.summary,
      status: "PUBLISHED",
      contentKey: FL_CONTENT_KEY,
      coverUrl: FL_COURSE.coverUrl
    }
  });

  log.info({ slug: course.slug }, "Curso FL disponível na área Cursos.");

  await ensureUspLeituraEscritaCourse(prisma, log);
  await ensureTanarCourse(prisma, log);
  await ensureEnemCronogramaCourse(prisma, log);

  const portalCourses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      slug: { not: FL_COURSE.slug }
    }
  });

  for (const c of portalCourses) {
    if (c.slug === USP_LEITURA_SLUG || c.slug === TANAR_SLUG || c.slug === ENEM_CRONOGRAMA_SLUG) continue;
    const key = c.contentKey?.trim().toLowerCase();
    if (key === FL_CONTENT_KEY) continue;
    await prisma.course.update({
      where: { id: c.id },
      data: { contentKey: PORTAL_CONTENT_KEY }
    });
    const created = await ensurePortalStarterContent(prisma, c.id, c.title);
    if (created) {
      log.info({ slug: c.slug }, "Trilha portal inicial criada (módulo boas-vindas).");
    }
  }
}
