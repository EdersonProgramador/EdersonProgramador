import type { Course } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAcademyUser } from "../auth-access.js";
import { getAuthUser } from "../auth.js";
import { userCanAccessCourse } from "../courses/access.js";
import {
  compileCourseDocument,
  compileModuleDocument,
  getCurriculumItems,
  groupItemsByModule
} from "../courses/fichamento.js";
import { prisma } from "../prisma.js";

const docBody = z.object({
  docJson: z.string().max(800_000).optional().nullable(),
  docHtml: z.string().max(800_000).optional().nullable()
});

type CourseContextResult =
  | { ok: true; course: Course }
  | { ok: false; status: 403 | 404; message: string };

export async function registerFichamentoRoutes(app: FastifyInstance) {
  async function courseContext(
    slug: string,
    user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>
  ): Promise<CourseContextResult> {
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) return { ok: false as const, status: 404 as const, message: "Curso não encontrado." };
    if (!(await userCanAccessCourse(user.id, user.role, course))) {
      return { ok: false as const, status: 403 as const, message: "Sem acesso." };
    }
    return { ok: true as const, course };
  }

  app.get("/courses/:slug/fichamento", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;
    const { slug } = z.object({ slug: z.string().min(1) }).parse(request.params);
    const ctx = await courseContext(slug, user);
    if (!ctx.ok) return reply.code(ctx.status).send({ message: ctx.message });
    const { course } = ctx;

    const [lessonRows, moduleRows, courseRow, items] = await Promise.all([
      prisma.studyLessonNote.findMany({ where: { userId: user.id, courseId: course.id } }),
      prisma.studyModuleFichamento.findMany({ where: { userId: user.id, courseId: course.id } }),
      prisma.studyCourseFichamento.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: course.id } }
      }),
      getCurriculumItems(course)
    ]);

    const modules = groupItemsByModule(items).map(([moduleNumber, g]) => ({
      moduleNumber,
      title: g.title,
      lessonSlugs: g.lessons.map((l) => l.slug)
    }));

    return {
      lessons: Object.fromEntries(
        lessonRows.map((r) => [
          r.lessonSlug,
          { docJson: r.docJson, docHtml: r.docHtml, updatedAt: r.updatedAt.toISOString() }
        ])
      ),
      modules: Object.fromEntries(
        moduleRows.map((r) => [
          r.moduleNumber,
          {
            moduleTitle: r.moduleTitle,
            docJson: r.docJson,
            docHtml: r.docHtml,
            compiledAt: r.compiledAt?.toISOString() ?? null,
            updatedAt: r.updatedAt.toISOString()
          }
        ])
      ),
      course: courseRow
        ? {
            docJson: courseRow.docJson,
            docHtml: courseRow.docHtml,
            compiledAt: courseRow.compiledAt?.toISOString() ?? null,
            updatedAt: courseRow.updatedAt.toISOString()
          }
        : null,
      outline: modules
    };
  });

  app.put("/courses/:slug/fichamento/lessons/:lessonSlug", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;
    const params = z
      .object({ slug: z.string().min(1), lessonSlug: z.string().min(1).max(120) })
      .parse(request.params);
    const body = docBody.parse(request.body);
    const ctx = await courseContext(params.slug, user);
    if (!ctx.ok) return reply.code(ctx.status).send({ message: ctx.message });
    const { course } = ctx;

    const row = await prisma.studyLessonNote.upsert({
      where: {
        userId_courseId_lessonSlug: {
          userId: user.id,
          courseId: course.id,
          lessonSlug: params.lessonSlug
        }
      },
      create: {
        userId: user.id,
        courseId: course.id,
        lessonSlug: params.lessonSlug,
        docJson: body.docJson ?? null,
        docHtml: body.docHtml ?? null
      },
      update: {
        docJson: body.docJson ?? null,
        docHtml: body.docHtml ?? null
      }
    });

    return {
      ok: true,
      updatedAt: row.updatedAt.toISOString()
    };
  });

  app.post("/courses/:slug/fichamento/modules/:moduleNumber/compile", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;
    const params = z
      .object({ slug: z.string().min(1), moduleNumber: z.coerce.number().int().min(0) })
      .parse(request.params);
    const ctx = await courseContext(params.slug, user);
    if (!ctx.ok) return reply.code(ctx.status).send({ message: ctx.message });
    const { course } = ctx;

    const compiled = await compileModuleDocument(course, user.id, params.moduleNumber);
    if (!compiled) return reply.code(404).send({ message: "Módulo não encontrado." });

    const row = await prisma.studyModuleFichamento.upsert({
      where: {
        userId_courseId_moduleNumber: {
          userId: user.id,
          courseId: course.id,
          moduleNumber: params.moduleNumber
        }
      },
      create: {
        userId: user.id,
        courseId: course.id,
        moduleNumber: params.moduleNumber,
        moduleTitle: compiled.moduleTitle,
        docHtml: compiled.docHtml,
        docJson: null,
        compiledAt: new Date()
      },
      update: {
        moduleTitle: compiled.moduleTitle,
        docHtml: compiled.docHtml,
        docJson: null,
        compiledAt: new Date()
      }
    });

    return {
      moduleNumber: params.moduleNumber,
      moduleTitle: row.moduleTitle,
      docHtml: row.docHtml,
      docJson: row.docJson,
      compiledAt: row.compiledAt?.toISOString() ?? null
    };
  });

  app.put("/courses/:slug/fichamento/modules/:moduleNumber", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;
    const params = z
      .object({ slug: z.string().min(1), moduleNumber: z.coerce.number().int().min(0) })
      .parse(request.params);
    const body = docBody.parse(request.body);
    const ctx = await courseContext(params.slug, user);
    if (!ctx.ok) return reply.code(ctx.status).send({ message: ctx.message });
    const { course } = ctx;

    const row = await prisma.studyModuleFichamento.upsert({
      where: {
        userId_courseId_moduleNumber: {
          userId: user.id,
          courseId: course.id,
          moduleNumber: params.moduleNumber
        }
      },
      create: {
        userId: user.id,
        courseId: course.id,
        moduleNumber: params.moduleNumber,
        docJson: body.docJson ?? null,
        docHtml: body.docHtml ?? null
      },
      update: {
        docJson: body.docJson ?? null,
        docHtml: body.docHtml ?? null
      }
    });

    return { ok: true, updatedAt: row.updatedAt.toISOString() };
  });

  app.post("/courses/:slug/fichamento/course/compile", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;
    const { slug } = z.object({ slug: z.string().min(1) }).parse(request.params);
    const ctx = await courseContext(slug, user);
    if (!ctx.ok) return reply.code(ctx.status).send({ message: ctx.message });
    const { course } = ctx;

    const compiled = await compileCourseDocument(course, user.id);
    const row = await prisma.studyCourseFichamento.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      create: {
        userId: user.id,
        courseId: course.id,
        docHtml: compiled.docHtml,
        docJson: null,
        compiledAt: new Date()
      },
      update: {
        docHtml: compiled.docHtml,
        docJson: null,
        compiledAt: new Date()
      }
    });

    return {
      docHtml: row.docHtml,
      docJson: row.docJson,
      compiledAt: row.compiledAt?.toISOString() ?? null,
      moduleCount: compiled.moduleCount
    };
  });

  app.put("/courses/:slug/fichamento/course", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;
    const { slug } = z.object({ slug: z.string().min(1) }).parse(request.params);
    const body = docBody.parse(request.body);
    const ctx = await courseContext(slug, user);
    if (!ctx.ok) return reply.code(ctx.status).send({ message: ctx.message });
    const { course } = ctx;

    const row = await prisma.studyCourseFichamento.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      create: {
        userId: user.id,
        courseId: course.id,
        docJson: body.docJson ?? null,
        docHtml: body.docHtml ?? null
      },
      update: {
        docJson: body.docJson ?? null,
        docHtml: body.docHtml ?? null
      }
    });

    return { ok: true, updatedAt: row.updatedAt.toISOString() };
  });
}
