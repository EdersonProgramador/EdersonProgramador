import type { PrismaClient } from "@prisma/client";

/** Trilha mínima para cursos portal (ex.: curso-1) até o admin publicar conteúdo completo. */
export async function ensurePortalStarterContent(
  prisma: PrismaClient,
  courseId: string,
  courseTitle: string
) {
  const existing = await prisma.courseModule.count({ where: { courseId } });
  if (existing > 0) return false;

  const mod = await prisma.courseModule.create({
    data: {
      courseId,
      sortOrder: 0,
      title: "Introdução",
      lessons: {
        create: {
          slug: "boas-vindas",
          sortOrder: 0,
          title: `Boas-vindas — ${courseTitle}`,
          lessonType: "article",
          status: "PUBLISHED",
          bodyHtml:
            "<p>Esta trilha está publicada no portal. Use o admin para adicionar módulos, aulas em vídeo, PDFs e marcar como <strong>Publicado</strong>.</p>"
        }
      }
    }
  });

  return Boolean(mod);
}
