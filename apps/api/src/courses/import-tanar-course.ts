import type { FastifyBaseLogger } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { PORTAL_CONTENT_KEY } from "./content-key.js";
import { env } from "../env.js";
import { TANAR_CATALOG, type TanarCatalog, type TanarLesson } from "./catalog/tanar.catalog.js";

export const TANAR_SLUG = TANAR_CATALOG.slug;

function countCatalogLessons(catalog: TanarCatalog) {
  let n = 0;
  for (const mod of catalog.modules) n += mod.lessons.length;
  return n;
}

/** Assinatura do catálogo — detecta mudança de títulos/slugs mesmo com mesma contagem. */
function catalogSyncSignature(catalog: TanarCatalog) {
  return catalog.modules
    .flatMap((mod) => mod.lessons.map((l) => `${mod.title}|${l.sectionTitle}|${l.slug}|${l.title}`))
    .join("\n");
}

function lessonCreateData(lesson: TanarLesson, sortOrder: number) {
  const lessonType = lesson.lessonType ?? "article";
  return {
    slug: lesson.slug,
    sortOrder,
    title: lesson.title,
    lessonType,
    status: "PUBLISHED" as const,
    bodyHtml: lesson.bodyHtml ?? null,
    videoUrl: lesson.videoId ? `https://www.youtube.com/watch?v=${lesson.videoId}` : null,
    documentUrl: lesson.documentUrl?.trim() || null,
    sectionTitle: lesson.sectionTitle,
    sectionSortOrder: lesson.sectionSortOrder
  };
}

export async function ensureTanarCourse(prisma: PrismaClient, log: FastifyBaseLogger) {
  const catalog = TANAR_CATALOG;
  const expectedLessons = countCatalogLessons(catalog);

  const course = await prisma.course.upsert({
    where: { slug: catalog.slug },
    create: {
      slug: catalog.slug,
      title: catalog.title,
      summary: catalog.summary,
      status: "PUBLISHED",
      visibility: "INTERNAL",
      contentKey: PORTAL_CONTENT_KEY,
      coverUrl: catalog.coverUrl ?? null,
      sortOrder: catalog.sortOrder
    },
    update: {
      title: catalog.title,
      summary: catalog.summary,
      status: "PUBLISHED",
      contentKey: PORTAL_CONTENT_KEY,
      coverUrl: catalog.coverUrl ?? null,
      sortOrder: catalog.sortOrder
    }
  });

  const expectedModules = catalog.modules.length;
  const signature = catalogSyncSignature(catalog);
  const storedPage =
    course.salesPage != null && typeof course.salesPage === "object"
      ? (course.salesPage as { catalogVersion?: number; catalogSignature?: string })
      : {};
  const needsSync =
    storedPage.catalogVersion !== catalog.catalogVersion ||
    storedPage.catalogSignature !== signature;

  if (needsSync) {
    await prisma.courseModule.deleteMany({ where: { courseId: course.id } });

    let sortOrder = 0;
    for (const mod of catalog.modules) {
      await prisma.courseModule.create({
        data: {
          courseId: course.id,
          sortOrder: sortOrder++,
          title: mod.title,
          lessons: {
            create: mod.lessons.map((lesson, li) => lessonCreateData(lesson, li))
          }
        }
      });
    }

    await prisma.course.update({
      where: { id: course.id },
      data: {
        salesPage: {
          catalogVersion: catalog.catalogVersion,
          catalogSignature: signature
        }
      }
    });

    log.info(
      { slug: catalog.slug, modules: expectedModules, lessons: expectedLessons, catalogVersion: catalog.catalogVersion },
      "Trilha Tanar sincronizada."
    );
  }

  for (const [i, book] of catalog.libraryBooks.entries()) {
    await prisma.courseLibraryBook.upsert({
      where: { courseId_slug: { courseId: course.id, slug: book.slug } },
      create: {
        courseId: course.id,
        slug: book.slug,
        title: book.title,
        author: book.author ?? null,
        summary: book.summary ?? null,
        coverUrl: book.coverUrl ?? null,
        pdfUrl: book.pdfUrl,
        sortOrder: i,
        status: "PUBLISHED"
      },
      update: {
        title: book.title,
        author: book.author ?? null,
        summary: book.summary ?? null,
        coverUrl: book.coverUrl ?? null,
        pdfUrl: book.pdfUrl,
        sortOrder: i,
        status: "PUBLISHED"
      }
    });
  }

  await ensureAdminEnrollmentsForTanar(prisma, course.id, log);
}

async function ensureAdminEnrollmentsForTanar(
  prisma: PrismaClient,
  courseId: string,
  log: FastifyBaseLogger
) {
  const adminIds = new Set<string>();
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", status: "ACTIVE" },
    select: { id: true }
  });
  for (const u of admins) adminIds.add(u.id);

  const bootstrapEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (bootstrapEmail) {
    const bootstrap = await prisma.user.findUnique({
      where: { email: bootstrapEmail },
      select: { id: true }
    });
    if (bootstrap) adminIds.add(bootstrap.id);
  }

  if (adminIds.size === 0) {
    log.warn("Nenhum admin encontrado para matricular no curso Tanar.");
    return;
  }

  for (const userId of adminIds) {
    await prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId, source: "ADMIN_GRANT", status: "ACTIVE" },
      update: { status: "ACTIVE", source: "ADMIN_GRANT" }
    });
  }

  log.info({ courseId, admins: adminIds.size }, "Admins matriculados no curso Tanar.");
}
