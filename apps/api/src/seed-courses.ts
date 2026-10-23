import type { FastifyBaseLogger } from "fastify";
import { prisma } from "./prisma.js";

export async function ensureSeedCourses(log: FastifyBaseLogger) {
  const course = await prisma.course.upsert({
    where: { slug: "fl-formula-de-lancamento" },
    create: {
      slug: "fl-formula-de-lancamento",
      title: "Fórmula de Lançamento — 6 em 7",
      summary:
        "Trilha interna na ordem oficial do mapa (Doc001 → módulos 2–11 → F340). Uso exclusivo da equipe Ederson Programador.",
      status: "PUBLISHED",
      visibility: "INTERNAL",
      contentKey: "fl",
      sortOrder: 0
    },
    update: {
      title: "Fórmula de Lançamento — 6 em 7",
      status: "PUBLISHED",
      contentKey: "fl"
    }
  });

  log.info({ slug: course.slug }, "Curso FL disponível na área Cursos.");
}
