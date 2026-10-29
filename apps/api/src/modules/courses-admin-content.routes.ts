import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { assertAgencySession } from "../auth-access.js";
import { getAuthUser, requireRole } from "../auth.js";
import { PORTAL_CONTENT_KEY } from "../courses/content-key.js";
import { ensurePortalStarterContent } from "../courses/portal-starter.js";
import { prisma } from "../prisma.js";

const slugField = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: minúsculas, números e hífens.");

const moduleBody = z.object({
  title: z.string().min(1).max(200),
  sortOrder: z.number().int().optional()
});

const lessonBody = z.object({
  slug: slugField,
  title: z.string().min(1).max(300),
  lessonKey: z.string().max(40).optional().nullable(),
  sortOrder: z.number().int().optional(),
  lessonType: z.enum(["article", "video", "document"]).default("article"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  bodyHtml: z.string().max(500_000).optional().nullable(),
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  documentUrl: z.string().url().optional().nullable().or(z.literal("")),
  telegramRef: z.string().max(120).optional().nullable()
});

const lessonPatch = lessonBody.partial().omit({ slug: true });

async function getCourseOr404(id: string) {
  return prisma.course.findUnique({ where: { id } });
}

export async function registerCoursesAdminContentRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    if (!request.url.startsWith("/admin/courses")) return;
    const user = await getAuthUser(request);
    if (!user) return reply.code(401).send({ message: "Faça login na Agência." });
    try {
      assertAgencySession(user);
      requireRole(user, ["ADMIN"]);
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode ?? 403;
      return reply.code(statusCode).send({
        message: (error as Error).message || "Acesso restrito ao administrador."
      });
    }
  });

  app.get("/admin/courses/:id/content", async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const course = await getCourseOr404(id);
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });

    const modules = await prisma.courseModule.findMany({
      where: { courseId: id },
      orderBy: { sortOrder: "asc" },
      include: { lessons: { orderBy: { sortOrder: "asc" } } }
    });

    const published = modules.reduce(
      (acc, m) => acc + m.lessons.filter((l) => l.status === "PUBLISHED").length,
      0
    );

    return {
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        contentKey: course.contentKey,
        status: course.status
      },
      stats: { modules: modules.length, lessons: modules.reduce((a, m) => a + m.lessons.length, 0), published },
      modules
    };
  });

  app.post("/admin/courses/:id/content/starter", async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const course = await getCourseOr404(id);
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });

    await prisma.course.update({
      where: { id },
      data: { contentKey: PORTAL_CONTENT_KEY }
    });
    const created = await ensurePortalStarterContent(prisma, id, course.title);
    return { ok: true, created };
  });

  app.post("/admin/courses/:id/content/publish-all", async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const course = await getCourseOr404(id);
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });

    const result = await prisma.courseLesson.updateMany({
      where: { module: { courseId: id }, status: "DRAFT" },
      data: { status: "PUBLISHED" }
    });
    return { ok: true, published: result.count };
  });

  app.post("/admin/courses/:id/modules", async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const body = moduleBody.parse(request.body);
    const course = await getCourseOr404(id);
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });

    const sortOrder =
      body.sortOrder ??
      ((await prisma.courseModule.aggregate({ where: { courseId: id }, _max: { sortOrder: true } }))._max
        .sortOrder ?? -1) + 1;

    const module = await prisma.courseModule.create({
      data: { courseId: id, title: body.title.trim(), sortOrder }
    });
    return reply.code(201).send({ module });
  });

  app.patch("/admin/courses/:id/modules/:moduleId", async (request, reply) => {
    const params = z.object({ id: z.string().min(1), moduleId: z.string().min(1) }).parse(request.params);
    const body = moduleBody.partial().parse(request.body);

    const module = await prisma.courseModule.findFirst({
      where: { id: params.moduleId, courseId: params.id }
    });
    if (!module) return reply.code(404).send({ message: "Módulo não encontrado." });

    const updated = await prisma.courseModule.update({
      where: { id: module.id },
      data: {
        title: body.title?.trim(),
        sortOrder: body.sortOrder
      }
    });
    return { module: updated };
  });

  app.delete("/admin/courses/:id/modules/:moduleId", async (request, reply) => {
    const params = z.object({ id: z.string().min(1), moduleId: z.string().min(1) }).parse(request.params);
    const module = await prisma.courseModule.findFirst({
      where: { id: params.moduleId, courseId: params.id }
    });
    if (!module) return reply.code(404).send({ message: "Módulo não encontrado." });
    await prisma.courseModule.delete({ where: { id: module.id } });
    return { ok: true };
  });

  app.post("/admin/courses/:id/modules/:moduleId/lessons", async (request, reply) => {
    const params = z.object({ id: z.string().min(1), moduleId: z.string().min(1) }).parse(request.params);
    const body = lessonBody.parse(request.body);

    const module = await prisma.courseModule.findFirst({
      where: { id: params.moduleId, courseId: params.id }
    });
    if (!module) return reply.code(404).send({ message: "Módulo não encontrado." });

    const sortOrder =
      body.sortOrder ??
      ((await prisma.courseLesson.aggregate({ where: { moduleId: module.id }, _max: { sortOrder: true } }))._max
        .sortOrder ?? -1) + 1;

    const lesson = await prisma.courseLesson.create({
      data: {
        moduleId: module.id,
        slug: body.slug,
        title: body.title.trim(),
        lessonKey: body.lessonKey?.trim() || null,
        sortOrder,
        lessonType: body.lessonType,
        status: body.status,
        bodyHtml: body.bodyHtml ?? null,
        videoUrl: body.videoUrl?.trim() || null,
        documentUrl: body.documentUrl?.trim() || null,
        telegramRef: body.telegramRef?.trim() || null
      }
    });

    await prisma.course.update({ where: { id: params.id }, data: { contentKey: PORTAL_CONTENT_KEY } });
    return reply.code(201).send({ lesson });
  });

  app.patch("/admin/courses/:id/lessons/:lessonId", async (request, reply) => {
    const params = z.object({ id: z.string().min(1), lessonId: z.string().min(1) }).parse(request.params);
    const body = lessonPatch.parse(request.body);

    const lesson = await prisma.courseLesson.findFirst({
      where: { id: params.lessonId, module: { courseId: params.id } }
    });
    if (!lesson) return reply.code(404).send({ message: "Aula não encontrada." });

    const updated = await prisma.courseLesson.update({
      where: { id: lesson.id },
      data: {
        title: body.title?.trim(),
        lessonKey: body.lessonKey === undefined ? undefined : body.lessonKey?.trim() || null,
        sortOrder: body.sortOrder,
        lessonType: body.lessonType,
        status: body.status,
        bodyHtml: body.bodyHtml === undefined ? undefined : body.bodyHtml,
        videoUrl: body.videoUrl === undefined ? undefined : body.videoUrl?.trim() || null,
        documentUrl: body.documentUrl === undefined ? undefined : body.documentUrl?.trim() || null,
        telegramRef: body.telegramRef === undefined ? undefined : body.telegramRef?.trim() || null
      }
    });
    return { lesson: updated };
  });

  app.delete("/admin/courses/:id/lessons/:lessonId", async (request, reply) => {
    const params = z.object({ id: z.string().min(1), lessonId: z.string().min(1) }).parse(request.params);
    const lesson = await prisma.courseLesson.findFirst({
      where: { id: params.lessonId, module: { courseId: params.id } }
    });
    if (!lesson) return reply.code(404).send({ message: "Aula não encontrada." });
    await prisma.courseLesson.delete({ where: { id: lesson.id } });
    return { ok: true };
  });
}
