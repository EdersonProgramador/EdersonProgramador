import { createReadStream, existsSync } from "node:fs";
import { extname, resolve } from "node:path";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getAuthUser } from "../auth.js";
import { FL_CONTENT_KEY, resolveCourseContentKey } from "../courses/content-key.js";
import { loadFlBundle } from "../courses/fl-content.js";
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
    const user = await getAuthUser(request);
    if (!user) return reply.code(401).send({ message: "Faça login para acessar os cursos." });

    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
    });

    const cards = [];
    for (const course of courses) {
      const hasAccess = await userCanAccessCourse(user.id, user.role, course);
      const purchasable = course.visibility === "PUBLIC_SALE" && course.priceCents != null && course.priceCents > 0;
      if (!hasAccess && !purchasable) continue;

      const contentKey = resolveCourseContentKey(course.contentKey);
      cards.push({
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
        contentReady: contentKey === FL_CONTENT_KEY
      });
    }
    return { courses: cards };
  });

  app.get("/courses/:slug", async (request, reply) => {
    const user = await getAuthUser(request);
    if (!user) return reply.code(401).send({ message: "Não autenticado." });

    const params = z.object({ slug: z.string().min(1) }).parse(request.params);
    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });
    if (!(await userCanAccessCourse(user.id, user.role, course))) {
      return reply.code(403).send({ message: "Você não tem acesso a este curso." });
    }

    const contentKey = resolveCourseContentKey(course.contentKey);
    if (contentKey !== FL_CONTENT_KEY) {
      return reply.code(501).send({
        message: "Conteúdo do curso ainda não configurado.",
        hint: "No admin, defina contentKey como fl ou acesse a trilha publicada da Fórmula de Lançamento."
      });
    }

    const bundle = loadFlBundle();
    const progress = await prisma.lessonProgress.findMany({
      where: { userId: user.id, courseId: course.id },
      select: { lessonSlug: true, completedAt: true }
    });

    const mediaBaseUrl = `/courses/${course.slug}/media`;
    const videoManifest = { ...bundle.videoManifest };
    const files: Record<string, string> = {};
    for (const [id, rel] of Object.entries(bundle.videoManifest.files)) {
      files[id] = `${mediaBaseUrl}/${rel.replace(/^media\//, "")}`;
    }

    return {
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        visibility: course.visibility,
        priceCents: course.priceCents,
        purchasable: course.visibility === "PUBLIC_SALE" && course.priceCents != null
      },
      curriculum: {
        ...bundle.curriculum,
        courseTitle: course.title,
        mediaBase: `${mediaBaseUrl}/videos`,
        documentBase: `${mediaBaseUrl}/docs`
      },
      lessonNotes: bundle.lessonNotes,
      bonusContent: bundle.bonusContent,
      videoManifest: { ...videoManifest, files },
      telegram: bundle.telegram,
      telegramMessageMap: bundle.telegramMessageMap,
      completedSlugs: progress.map((p) => p.lessonSlug)
    };
  });

  app.get("/courses/:slug/progress", async (request, reply) => {
    const user = await getAuthUser(request);
    if (!user) return reply.code(401).send({ message: "Não autenticado." });

    const params = z.object({ slug: z.string().min(1) }).parse(request.params);
    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });
    if (!(await userCanAccessCourse(user.id, user.role, course))) {
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
    const user = await getAuthUser(request);
    if (!user) return reply.code(401).send({ message: "Não autenticado." });

    const params = z.object({ slug: z.string().min(1) }).parse(request.params);
    const body = progressBody.parse(request.body);
    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });
    if (!(await userCanAccessCourse(user.id, user.role, course))) {
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

    return { ok: true };
  });

  app.post("/courses/:slug/checkout", async (request, reply) => {
    const user = await getAuthUser(request);
    if (!user) return reply.code(401).send({ message: "Não autenticado." });

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
    const user = await getAuthUser(request);
    if (!user) return reply.code(401).send({ message: "Não autenticado." });

    const params = z.object({ slug: z.string().min(1) }).parse(request.params);
    const course = await prisma.course.findUnique({ where: { slug: params.slug } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });
    if (!(await userCanAccessCourse(user.id, user.role, course))) {
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
