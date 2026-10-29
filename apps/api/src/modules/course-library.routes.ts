import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { assertAcademyInternalAdmin, assertAcademySession, requireAcademyUser } from "../auth-access.js";
import { getAuthUser, requireRole } from "../auth.js";
import { userCanAccessCourse } from "../courses/access.js";
import { prisma } from "../prisma.js";

const slugField = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: minúsculas, números e hífens.");

const bookBody = z.object({
  slug: slugField,
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).optional().nullable(),
  author: z.string().max(200).optional().nullable(),
  summary: z.string().max(4000).optional().nullable(),
  coverUrl: z.string().url().optional().nullable().or(z.literal("")),
  pdfUrl: z.string().url().min(8),
  pageCount: z.number().int().min(1).max(20_000).optional().nullable(),
  sortOrder: z.number().int().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT")
});

const bookPatch = bookBody.partial().omit({ slug: true });

async function courseForUser(slug: string, user: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>) {
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) return { ok: false as const, status: 404 as const, message: "Curso não encontrado." };
  if (!(await userCanAccessCourse(user.id, user.role, user.email, course))) {
    return { ok: false as const, status: 403 as const, message: "Sem acesso." };
  }
  return { ok: true as const, course };
}

function bookDto(
  book: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    author: string | null;
    summary: string | null;
    coverUrl: string | null;
    pageCount: number | null;
    sortOrder: number;
    status: string;
  },
  extra?: { lastPage?: number; pdfStreamPath?: string }
) {
  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    subtitle: book.subtitle,
    author: book.author,
    summary: book.summary,
    coverUrl: book.coverUrl,
    pageCount: book.pageCount,
    sortOrder: book.sortOrder,
    status: book.status,
    lastPage: extra?.lastPage,
    pdfStreamPath: extra?.pdfStreamPath
  };
}

export async function registerCourseLibraryRoutes(app: FastifyInstance) {
  app.get("/courses/:slug/library", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;
    const { slug } = z.object({ slug: z.string().min(1) }).parse(request.params);
    const ctx = await courseForUser(slug, user);
    if (!ctx.ok) return reply.code(ctx.status).send({ message: ctx.message });
    const { course } = ctx;

    const books = await prisma.courseLibraryBook.findMany({
      where: { courseId: course.id, status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
    });

    const readings = await prisma.courseLibraryReading.findMany({
      where: { userId: user.id, courseId: course.id, bookId: { in: books.map((b) => b.id) } }
    });
    const lastByBook = new Map(readings.map((r) => [r.bookId, r.lastPage]));

    return {
      books: books.map((b) =>
        bookDto(b, {
          lastPage: lastByBook.get(b.id),
          pdfStreamPath: `/courses/${slug}/library/${b.slug}/pdf`
        })
      )
    };
  });

  app.get("/courses/:slug/library/:bookSlug", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;
    const params = z.object({ slug: z.string().min(1), bookSlug: z.string().min(1) }).parse(request.params);
    const ctx = await courseForUser(params.slug, user);
    if (!ctx.ok) return reply.code(ctx.status).send({ message: ctx.message });
    const { course } = ctx;

    const book = await prisma.courseLibraryBook.findFirst({
      where: { courseId: course.id, slug: params.bookSlug, status: "PUBLISHED" }
    });
    if (!book) return reply.code(404).send({ message: "Livro não encontrado." });

    const reading = await prisma.courseLibraryReading.findUnique({
      where: { userId_bookId: { userId: user.id, bookId: book.id } }
    });

    return {
      book: bookDto(book, {
        lastPage: reading?.lastPage ?? 1,
        pdfStreamPath: `/courses/${params.slug}/library/${book.slug}/pdf`
      })
    };
  });

  app.put("/courses/:slug/library/:bookSlug/progress", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;
    const params = z.object({ slug: z.string().min(1), bookSlug: z.string().min(1) }).parse(request.params);
    const body = z.object({ lastPage: z.number().int().min(1).max(20_000) }).parse(request.body);
    const ctx = await courseForUser(params.slug, user);
    if (!ctx.ok) return reply.code(ctx.status).send({ message: ctx.message });
    const { course } = ctx;

    const book = await prisma.courseLibraryBook.findFirst({
      where: { courseId: course.id, slug: params.bookSlug, status: "PUBLISHED" }
    });
    if (!book) return reply.code(404).send({ message: "Livro não encontrado." });

    await prisma.courseLibraryReading.upsert({
      where: { userId_bookId: { userId: user.id, bookId: book.id } },
      create: {
        userId: user.id,
        courseId: course.id,
        bookId: book.id,
        lastPage: body.lastPage
      },
      update: { lastPage: body.lastPage }
    });

    return { ok: true, lastPage: body.lastPage };
  });

  app.get("/courses/:slug/library/:bookSlug/pdf", async (request, reply) => {
    const user = await requireAcademyUser(request, reply);
    if (!user) return;
    const params = z.object({ slug: z.string().min(1), bookSlug: z.string().min(1) }).parse(request.params);
    const ctx = await courseForUser(params.slug, user);
    if (!ctx.ok) return reply.code(ctx.status).send({ message: ctx.message });
    const { course } = ctx;

    const book = await prisma.courseLibraryBook.findFirst({
      where: { courseId: course.id, slug: params.bookSlug, status: "PUBLISHED" }
    });
    if (!book) return reply.code(404).send({ message: "Livro não encontrado." });

    let upstream: Response;
    try {
      upstream = await fetch(book.pdfUrl, {
        headers: { "User-Agent": "EdersonAgenciaLibrary/1.0" }
      });
    } catch {
      return reply.code(502).send({ message: "Não foi possível obter o PDF." });
    }
    if (!upstream.ok) {
      return reply.code(502).send({ message: "Arquivo PDF indisponível na origem." });
    }

    const contentType = upstream.headers.get("content-type") ?? "application/pdf";
    reply.header("Content-Type", contentType.includes("pdf") ? contentType : "application/pdf");
    reply.header("Content-Disposition", `inline; filename="${book.slug}.pdf"`);
    reply.header("Cache-Control", "private, max-age=300");

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return reply.send(buffer);
  });

  app.addHook("preHandler", async (request, reply) => {
    if (!request.url.startsWith("/admin/courses/") || !request.url.includes("/library")) return;
    const user = await getAuthUser(request);
    if (!user) return reply.code(401).send({ message: "Faça login na Academia." });
    try {
      assertAcademySession(user);
      requireRole(user, ["ADMIN"]);
      assertAcademyInternalAdmin(user);
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode ?? 403;
      return reply.code(statusCode).send({
        message: (error as Error).message || "Acesso restrito ao administrador."
      });
    }
  });

  app.get("/admin/courses/:id/library", async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });

    const books = await prisma.courseLibraryBook.findMany({
      where: { courseId: id },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }]
    });

    return { books: books.map((b) => bookDto(b)) };
  });

  app.post("/admin/courses/:id/library", async (request, reply) => {
    const { id } = z.object({ id: z.string().min(1) }).parse(request.params);
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return reply.code(404).send({ message: "Curso não encontrado." });
    const body = bookBody.parse(request.body);

    const row = await prisma.courseLibraryBook.create({
      data: {
        courseId: id,
        slug: body.slug,
        title: body.title,
        subtitle: body.subtitle ?? null,
        author: body.author ?? null,
        summary: body.summary ?? null,
        coverUrl: body.coverUrl || null,
        pdfUrl: body.pdfUrl,
        pageCount: body.pageCount ?? null,
        sortOrder: body.sortOrder ?? 0,
        status: body.status
      }
    });

    return { book: bookDto(row) };
  });

  app.patch("/admin/courses/:id/library/:bookId", async (request, reply) => {
    const params = z.object({ id: z.string().min(1), bookId: z.string().min(1) }).parse(request.params);
    const body = bookPatch.parse(request.body);
    const existing = await prisma.courseLibraryBook.findFirst({
      where: { id: params.bookId, courseId: params.id }
    });
    if (!existing) return reply.code(404).send({ message: "Livro não encontrado." });

    const row = await prisma.courseLibraryBook.update({
      where: { id: params.bookId },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.subtitle !== undefined ? { subtitle: body.subtitle } : {}),
        ...(body.author !== undefined ? { author: body.author } : {}),
        ...(body.summary !== undefined ? { summary: body.summary } : {}),
        ...(body.coverUrl !== undefined ? { coverUrl: body.coverUrl === "" ? null : body.coverUrl } : {}),
        ...(body.pdfUrl !== undefined ? { pdfUrl: body.pdfUrl } : {}),
        ...(body.pageCount !== undefined ? { pageCount: body.pageCount } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
        ...(body.status !== undefined ? { status: body.status } : {})
      }
    });

    return { book: bookDto(row) };
  });

  app.delete("/admin/courses/:id/library/:bookId", async (request, reply) => {
    const params = z.object({ id: z.string().min(1), bookId: z.string().min(1) }).parse(request.params);
    const existing = await prisma.courseLibraryBook.findFirst({
      where: { id: params.bookId, courseId: params.id }
    });
    if (!existing) return reply.code(404).send({ message: "Livro não encontrado." });
    await prisma.courseLibraryBook.delete({ where: { id: params.bookId } });
    return { ok: true };
  });
}
