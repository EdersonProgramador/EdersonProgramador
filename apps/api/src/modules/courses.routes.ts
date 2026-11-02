import { createReadStream, existsSync } from "node:fs";
import { extname, resolve } from "node:path";
import type { FastifyInstance } from "fastify";
import { isAcademyInternalAdmin } from "@ederson-agencia/shared";
import type { AgencyRole } from "@ederson-agencia/shared";
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
import {
  getAllModuleRepetitionsDto,
  moduleNumberForLessonSlug,
  recordModuleRepetitionIfComplete,
  startNextModuleRepetition
} from "../courses/course-module-repetitions.js";
import {
  buildCourseContentReadyMap,
  catalogUserIsInternalAdmin,
  catalogVisibleInMineList,
  courseCardFields
} from "../courses/course-catalog-list.js";
import { getPortalLessonNote } from "../courses/portal-content.js";
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

export async function registerCoursesRoutes(app: FastifyInstance) {
  app.get("/courses", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;

    const [courses, enrollments] = await Promise.all([
      prisma.course.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
      }),
      prisma.courseEnrollment.findMany({
        where: { userId: user.id, status: "ACTIVE" },
        select: { courseId: true }
      })
    ]);

    const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
    const internalAdmin = catalogUserIsInternalAdmin(user);
    const contentReadyMap = await buildCourseContentReadyMap(courses);

    const cards = [];
    for (const course of courses) {
      if (!catalogVisibleInMineList(course, internalAdmin, enrolledCourseIds)) continue;

      const card = courseCardFields(
        course,
        user,
        internalAdmin,
        enrolledCourseIds,
        contentReadyMap.get(course.id) ?? false
      );
      if (!card.hasAccess) continue;
      cards.push(card);
    }
    return { courses: cards };
  });

  app.get("/courses/store", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;

    const [courses, enrollments] = await Promise.all([
      prisma.course.findMany({
        where: {
          status: "PUBLISHED",
          visibility: "PUBLIC_SALE",
          priceCents: { gt: 0 }
        },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
      }),
      prisma.courseEnrollment.findMany({
        where: { userId: user.id, status: "ACTIVE" },
        select: { courseId: true }
      })
    ]);

    const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
    const internalAdmin = catalogUserIsInternalAdmin(user);
    const contentReadyMap = await buildCourseContentReadyMap(courses);

    const cards = courses.map((course) =>
      courseCardFields(
        course,
        user,
        internalAdmin,
        enrolledCourseIds,
        contentReadyMap.get(course.id) ?? false,
        { storeList: true }
      )
    );
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
    const moduleRows = await prisma.courseModule.findMany({
      where: { courseId: course.id },
      orderBy: { sortOrder: "asc" },
      select: { id: true }
    });
    const moduleRepetitions = await getAllModuleRepetitionsDto(course, user.id);

    void (async () => {
      for (let i = 0; i < moduleRows.length; i++) {
        await recordModuleRepetitionIfComplete(course, user.id, i + 1);
      }
    })().catch((err) => {
      request.log.warn({ err, slug: course.slug }, "Sync de repetição por módulo (background)");
    });

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
      moduleRepetitions,
      certificate,
      ...study
    };
  });

  app.get("/courses/:slug/lessons/:lessonSlug", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;

    const params = z
      .object({ slug: z.string().min(1), lessonSlug: z.string().min(1).max(120) })
      .parse(request.params);
    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });
    if (!(await userCanAccessCourse(user.id, user.role, user.email, course))) {
      return reply.code(403).send({ message: "Sem acesso." });
    }

    const note = await getPortalLessonNote(course.id, params.lessonSlug);
    if (!note) return reply.code(404).send({ message: "Aula não encontrada." });
    return note;
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
    let moduleRepetitionJustCompleted: { moduleNumber: number; cycleNumber: number } | null = null;
    if (progressSummary.isComplete) {
      const rep = await recordRepetitionIfComplete(course, user.id);
      if (rep.recorded) repetitionJustCompleted = rep.cycleNumber;
      const ensured = await ensureCourseCertificate(course, user.id);
      if (ensured.issued && ensured.certificate) {
        certificate = certificateToDto(ensured.certificate, course, { name: user.name }, env.WEB_ORIGIN);
      }
    }
    const moduleNumber = await moduleNumberForLessonSlug(course, user.id, body.lessonSlug);
    let moduleRepetitions = await getAllModuleRepetitionsDto(course, user.id);
    if (moduleNumber != null) {
      const modRep = await recordModuleRepetitionIfComplete(course, user.id, moduleNumber);
      moduleRepetitions = modRep.moduleRepetitions;
      if (modRep.recorded && modRep.cycleNumber != null) {
        moduleRepetitionJustCompleted = { moduleNumber, cycleNumber: modRep.cycleNumber };
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
      moduleRepetitions,
      moduleRepetitionJustCompleted,
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
        moduleRepetitions: await getAllModuleRepetitionsDto(course, user.id),
        completedSlugs: rows.map((r) => r.lessonSlug),
        progress: await getCourseProgressSummary(course, user.id)
      };
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
      return reply.code(statusCode).send({ message: (error as Error).message });
    }
  });

  app.post("/courses/:slug/modules/:moduleNumber/repetitions/start-next", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;

    const params = z
      .object({ slug: z.string().min(1), moduleNumber: z.coerce.number().int().positive() })
      .parse(request.params);
    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });
    if (!(await userCanAccessCourse(user.id, user.role, user.email, course))) {
      return reply.code(403).send({ message: "Sem acesso." });
    }

    try {
      const moduleRepetitions = await startNextModuleRepetition(course, user.id, params.moduleNumber);
      const rows = await prisma.lessonProgress.findMany({
        where: { userId: user.id, courseId: course.id },
        select: { lessonSlug: true }
      });
      return {
        ok: true,
        moduleRepetitions,
        completedSlugs: rows.map((r) => r.lessonSlug),
        repetitions: await getRepetitionDto(course, user.id),
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

    if (
      !isAcademyInternalAdmin({
        role: user.role as AgencyRole,
        email: user.email
      })
    ) {
      return reply.code(403).send({
        message: "Compras são feitas na vitrine pública (/cursos), não na área do aluno."
      });
    }

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
