import { createReadStream, existsSync } from "node:fs";
import { extname, resolve } from "node:path";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAcademyUser } from "../auth-access.js";
import {
  certificateToDto,
  ensureCourseCertificate,
  getCourseProgressSummary
} from "../courses/certificate.js";
import {
  getRepetitionDto,
  recordRepetitionIfComplete,
  startNextRepetition
} from "../courses/course-repetitions.js";
import { courseContentReady, resolveStudyPayload } from "../courses/resolve-study-payload.js";
import { userCanAccessCourse } from "../courses/access.js";
import { env } from "../env.js";
import { prisma } from "../prisma.js";

function mediaRoot() {
  if (env.FL_MEDIA_ROOT?.trim()) return resolve(env.FL_MEDIA_ROOT.trim());
  return null;
}

function resolveMediaPath(relative: string) {
  const root = mediaRoot();
  if (!root) return null;
  const full = resolve(root, relative.replace(/^\/+/, ""));
  if (!full.startsWith(root)) return null;
  return existsSync(full) ? full : null;
}

async function courseCardDto(
  course: Awaited<ReturnType<typeof prisma.course.findMany>>[number],
  user: { id: string; role: string; email: string }
) {
  const hasAccess = await userCanAccessCourse(user.id, user.role, user.email, course);
  const purchasable =
    course.visibility === "PUBLIC_SALE" && course.priceCents != null && course.priceCents > 0;
  return {
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
    contentReady: await courseContentReady(course),
    coverUrl: course.coverUrl
  };
}

export async function registerCoursesRoutes(app: FastifyInstance) {
  app.get("/courses", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;

    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
    });

    const cards = [];
    for (const course of courses) {
      const card = await courseCardDto(course, user);
      if (!card.hasAccess) continue;
      cards.push(card);
    }
    return { courses: cards };
  });

  app.get("/courses/store", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;

    const courses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        visibility: "PUBLIC_SALE",
        priceCents: { gt: 0 }
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
    });

    const cards = [];
    for (const course of courses) {
      cards.push(await courseCardDto(course, user));
    }
    return { courses: cards };
  });

  app.get("/courses/:slug", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;

    const params = z.object({ slug: z.string().min(1) }).parse(request.params);
    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });
    if (!(await userCanAccessCourse(user.id, user.role, user.email, course))) {
      return reply.code(403).send({ message: "Você não tem acesso a este curso." });
    }

    const payload = await resolveStudyPayload(course, user.id);
    if (!payload) {
      return reply.code(501).send({
        message: "Conteúdo do curso ainda não configurado.",
        hint: "No admin, publique módulos/aulas (contentKey portal) ou use contentKey fl para a trilha FL."
      });
    }

    const { source: _source, ...study } = payload;
    const progressSummary = await getCourseProgressSummary(course, user.id);
    let certificate: ReturnType<typeof certificateToDto> | null = null;
    if (progressSummary.isComplete) {
      await recordRepetitionIfComplete(course, user.id);
      const ensured = await ensureCourseCertificate(course, user.id);
      if (ensured.issued && ensured.certificate) {
        certificate = certificateToDto(ensured.certificate, course, { name: user.name }, env.WEB_ORIGIN);
      }
    }
    const repetitions = await getRepetitionDto(course, user.id);

    return {
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        visibility: course.visibility,
        priceCents: course.priceCents,
        purchasable: course.visibility === "PUBLIC_SALE" && course.priceCents != null,
        coverUrl: course.coverUrl
      },
      progress: {
        completed: progressSummary.completed,
        total: progressSummary.total,
        percent: progressSummary.percent,
        isComplete: progressSummary.isComplete
      },
      repetitions,
      certificate,
      ...study
    };
  });

  app.get("/courses/:slug/certificate", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;

    const params = z.object({ slug: z.string().min(1) }).parse(request.params);
    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });
    if (!(await userCanAccessCourse(user.id, user.role, user.email, course))) {
      return reply.code(403).send({ message: "Sem acesso." });
    }

    const ensured = await ensureCourseCertificate(course, user.id);
    if (!ensured.issued || !ensured.certificate) {
      return reply.code(403).send({
        message: "Conclua 100% das aulas para emitir o certificado.",
        progress: {
          completed: ensured.summary.completed,
          total: ensured.summary.total,
          percent: ensured.summary.percent
        }
      });
    }

    return {
      certificate: certificateToDto(ensured.certificate, course, { name: user.name }, env.WEB_ORIGIN)
    };
  });

  app.get("/courses/:slug/progress", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;

    const params = z.object({ slug: z.string().min(1) }).parse(request.params);
    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });
    if (!(await userCanAccessCourse(user.id, user.role, user.email, course))) {
      return reply.code(403).send({ message: "Sem acesso." });
    }

    const rows = await prisma.lessonProgress.findMany({
      where: { userId: user.id, courseId: course.id },
      select: { lessonSlug: true, completedAt: true }
    });
    return { completedSlugs: rows.map((r) => r.lessonSlug) };
  });

  const progressBody = z.object({
    lessonSlug: z.string().min(1),
    completed: z.boolean()
  });

  app.put("/courses/:slug/progress", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;

    const params = z.object({ slug: z.string().min(1) }).parse(request.params);
    const body = progressBody.parse(request.body);
    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });
    if (!(await userCanAccessCourse(user.id, user.role, user.email, course))) {
      return reply.code(403).send({ message: "Sem acesso." });
    }

    if (body.completed) {
      await prisma.lessonProgress.upsert({
        where: {
          userId_courseId_lessonSlug: {
            userId: user.id,
            courseId: course.id,
            lessonSlug: body.lessonSlug
          }
        },
        create: {
          userId: user.id,
          courseId: course.id,
          lessonSlug: body.lessonSlug
        },
        update: { completedAt: new Date() }
      });
    } else {
      await prisma.lessonProgress.deleteMany({
        where: { userId: user.id, courseId: course.id, lessonSlug: body.lessonSlug }
      });
    }

    const progressSummary = await getCourseProgressSummary(course, user.id);
    let certificate: ReturnType<typeof certificateToDto> | null = null;
    let repetitionJustCompleted: number | null = null;
    if (progressSummary.isComplete) {
      const rep = await recordRepetitionIfComplete(course, user.id);
      if (rep.recorded) repetitionJustCompleted = rep.cycleNumber;
      const ensured = await ensureCourseCertificate(course, user.id);
      if (ensured.issued && ensured.certificate) {
        certificate = certificateToDto(ensured.certificate, course, { name: user.name }, env.WEB_ORIGIN);
      }
    }
    const repetitions = await getRepetitionDto(course, user.id);

    return {
      ok: true,
      progress: {
        completed: progressSummary.completed,
        total: progressSummary.total,
        percent: progressSummary.percent,
        isComplete: progressSummary.isComplete
      },
      repetitions,
      repetitionJustCompleted,
      certificate
    };
  });

  app.post("/courses/:slug/repetitions/start-next", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;

    const params = z.object({ slug: z.string().min(1) }).parse(request.params);
    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });
    if (!(await userCanAccessCourse(user.id, user.role, user.email, course))) {
      return reply.code(403).send({ message: "Sem acesso." });
    }

    try {
      const repetitions = await startNextRepetition(course, user.id);
      const rows = await prisma.lessonProgress.findMany({
        where: { userId: user.id, courseId: course.id },
        select: { lessonSlug: true }
      });
      return {
        ok: true,
        repetitions,
        completedSlugs: rows.map((r) => r.lessonSlug),
        progress: await getCourseProgressSummary(course, user.id)
      };
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
      return reply.code(statusCode).send({ message: (error as Error).message });
    }
  });

  app.post("/courses/:slug/checkout", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;

    const params = z.object({ slug: z.string().min(1) }).parse(request.params);
    const body = z
      .object({
        paymentMethod: z.enum(["PIX", "CARD", "BOLETO"])
      })
      .parse(request.body);

    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course || course.visibility !== "PUBLIC_SALE" || course.priceCents == null) {
      return reply.code(400).send({ message: "Este curso não está disponível para compra." });
    }

    const order = await prisma.courseOrder.create({
      data: {
        userId: user.id,
        courseId: course.id,
        amountCents: course.priceCents,
        paymentMethod: body.paymentMethod,
        status: "PENDING"
      }
    });

    return reply.code(501).send({
      message:
        "Checkout em implementação. Integração prevista com gateway (PIX, cartão e boleto). Pedido registrado para continuidade.",
      orderId: order.id,
      paymentMethod: body.paymentMethod,
      amountCents: course.priceCents
    });
  });

  app.get("/courses/:slug/media/*", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;

    const params = z.object({ slug: z.string().min(1) }).parse(request.params);
    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });
    if (!(await userCanAccessCourse(user.id, user.role, user.email, course))) {
      return reply.code(403).send({ message: "Sem acesso." });
    }

    const wildcard = (request.params as { "*": string })["*"] ?? "";
    const filePath = resolveMediaPath(wildcard);
    if (!filePath) {
      return reply.code(404).send({ message: "Arquivo de mídia não disponível no servidor." });
    }

    const ext = extname(filePath).toLowerCase();
    const types: Record<string, string> = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mkv": "video/x-matroska",
      ".pdf": "application/pdf"
    };
    reply.header("Content-Type", types[ext] ?? "application/octet-stream");
    return reply.send(createReadStream(filePath));
  });
}
