import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { assertAcademySession } from "../auth-access.js";
import { getAuthUser, requireRole } from "../auth.js";
import { PORTAL_CONTENT_KEY } from "../courses/content-key.js";
import { ensurePortalStarterContent } from "../courses/portal-starter.js";
import { prisma } from "../prisma.js";

const courseBodySchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: letras minúsculas, números e hífens."),
  title: z.string().min(2).max(200),
  summary: z.string().max(2000).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  visibility: z.enum(["INTERNAL", "PUBLIC_SALE"]).default("INTERNAL"),
  priceCents: z.number().int().min(0).optional().nullable(),
  contentKey: z.enum(["fl", "portal"]).optional().nullable(),
  coverUrl: z.string().url().max(2000).optional().nullable().or(z.literal("")),
  sortOrder: z.number().int().default(0),
  repetitionGoalMax: z.number().int().min(1).max(999).optional().nullable()
});

const coursePatchSchema = courseBodySchema.partial().omit({ slug: true });

export async function registerCoursesAdminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    if (!request.url.startsWith("/admin/courses")) return;
    const user = await getAuthUser(request);
    if (!user) return reply.code(401).send({ message: "Faça login na Academia." });
    try {
      assertAcademySession(user);
      requireRole(user, ["ADMIN"]);
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode ?? 403;
      return reply.code(statusCode).send({
        message: (error as Error).message || "Acesso restrito ao administrador."
      });
    }
  });

  app.get("/admin/courses", async () => {
    const courses = await prisma.course.findMany({
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: {
        _count: { select: { enrollments: true, progress: true } }
      }
    });
    return {
      courses: courses.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        status: c.status,
        visibility: c.visibility,
        priceCents: c.priceCents,
        currency: c.currency,
        contentKey: c.contentKey,
        coverUrl: c.coverUrl,
        sortOrder: c.sortOrder,
        repetitionGoalMax: c.repetitionGoalMax,
        enrollments: c._count.enrollments,
        progressRows: c._count.progress
      }))
    };
  });

  app.post("/admin/courses", async (request, reply) => {
    const body = courseBodySchema.parse(request.body);
    if (body.visibility === "PUBLIC_SALE" && (body.priceCents == null || body.priceCents <= 0)) {
      return reply.code(400).send({ message: "Curso à venda exige priceCents > 0." });
    }

    const existing = await prisma.course.findUnique({ where: { slug: body.slug } });
    if (existing) return reply.code(409).send({ message: "Slug já em uso." });

    const contentKey = body.contentKey ?? PORTAL_CONTENT_KEY;
    const course = await prisma.course.create({
      data: {
        slug: body.slug,
        title: body.title,
        summary: body.summary ?? null,
        status: body.status,
        visibility: body.visibility,
        priceCents: body.visibility === "PUBLIC_SALE" ? body.priceCents : null,
        contentKey,
        coverUrl: body.coverUrl?.trim() || null,
        sortOrder: body.sortOrder,
        repetitionGoalMax: body.repetitionGoalMax ?? null
      }
    });
    if (contentKey === PORTAL_CONTENT_KEY) {
      await ensurePortalStarterContent(prisma, course.id, course.title);
    }
    return reply.code(201).send({ course });
  });

  app.patch("/admin/courses/:id", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const body = coursePatchSchema.parse(request.body);

    const current = await prisma.course.findUnique({ where: { id: params.id } });
    if (!current) return reply.code(404).send({ message: "Curso não encontrado." });

    const visibility = body.visibility ?? current.visibility;
    const priceCents = body.priceCents !== undefined ? body.priceCents : current.priceCents;
    if (visibility === "PUBLIC_SALE" && (priceCents == null || priceCents <= 0)) {
      return reply.code(400).send({ message: "Curso à venda exige priceCents > 0." });
    }

    const { coverUrl: coverUrlPatch, summary: summaryPatch, ...rest } = body;
    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...rest,
        summary: summaryPatch === undefined ? undefined : summaryPatch,
        coverUrl: coverUrlPatch === undefined ? undefined : coverUrlPatch?.trim() || null,
        priceCents: visibility === "PUBLIC_SALE" ? priceCents : null
      }
    });
    return { course };
  });

  app.post("/admin/courses/:id/enrollments", async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).parse(request.params);
    const body = z
      .object({
        email: z.string().email(),
        source: z.enum(["ADMIN_GRANT", "INTERNAL", "PURCHASE"]).default("ADMIN_GRANT")
      })
      .parse(request.body);

    const course = await prisma.course.findUnique({ where: { id: params.id } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });

    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user) {
      return reply.code(404).send({ message: "Usuário não encontrado. Peça cadastro no login." });
    }

    const enrollment = await prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      create: {
        userId: user.id,
        courseId: course.id,
        source: body.source,
        status: "ACTIVE"
      },
      update: { status: "ACTIVE", source: body.source }
    });

    return reply.code(201).send({ enrollment, user: { id: user.id, email: user.email, name: user.name } });
  });

  app.post("/admin/courses/orders/:orderId/mark-paid", async (request, reply) => {
    const params = z.object({ orderId: z.string().min(1) }).parse(request.params);
    const order = await prisma.courseOrder.findUnique({ where: { id: params.orderId } });
    if (!order) return reply.code(404).send({ message: "Pedido não encontrado." });

    await prisma.$transaction([
      prisma.courseOrder.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date() }
      }),
      prisma.courseEnrollment.upsert({
        where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
        create: {
          userId: order.userId,
          courseId: order.courseId,
          source: "PURCHASE",
          status: "ACTIVE",
          orderId: order.id
        },
        update: { status: "ACTIVE", source: "PURCHASE", orderId: order.id }
      })
    ]);

    return { ok: true };
  });
}
