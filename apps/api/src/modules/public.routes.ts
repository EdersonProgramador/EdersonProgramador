import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  AGENCY_META,
  CONTRACT_DEFAULTS,
  PORTFOLIO_GITHUB,
  PORTFOLIO_PRODUCTION
} from "@ederson-agencia/shared";
import { isAcademyStoreCustomer } from "../auth-access.js";
import { hashPassword, toAuthUser } from "../auth.js";
import { fulfillAcademyPurchase, listPublicSaleCourses } from "../courses/academy-purchase.js";
import { getPublicCourseProgram } from "../courses/course-program-public.js";
import { funnelConfigPublicDto, getAgencyFunnelConfigRow } from "../agency/funnel-config.js";
import { registerSeedLaunchClient } from "../agency/seed-launch-signup.js";
import { prisma } from "../prisma.js";
import { ensureAcademyTestUser } from "../seed-academy-test-user.js";
import { env } from "../env.js";

const ACADEMY_STORE_CUSTOMER_MARKER = "__academy_store__";

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10),
  budgetHint: z.string().optional(),
  packageTier: z.enum(["essential", "professional", "advanced"]).optional(),
  source: z.enum(["landing", "seed_launch", "portal"]).optional()
});

export async function registerPublicRoutes(app: FastifyInstance) {
  app.get("/public/agency-funnel", async () => {
    const row = await getAgencyFunnelConfigRow();
    return funnelConfigPublicDto(row);
  });

  app.get("/public/landing", async () => ({
    contract: CONTRACT_DEFAULTS,
    production: PORTFOLIO_PRODUCTION,
    github: PORTFOLIO_GITHUB,
    agency: AGENCY_META
  }));

  app.get("/public/certificates/:code", async (request, reply) => {
    const { code } = z.object({ code: z.string().min(8).max(32) }).parse(request.params);
    const row = await prisma.courseCertificate.findUnique({
      where: { verificationCode: code.toUpperCase() },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true, slug: true } }
      }
    });
    if (!row) return reply.code(404).send({ valid: false, message: "Certificado não encontrado." });

    return {
      valid: true,
      studentName: row.user.name,
      courseTitle: row.course.title,
      courseSlug: row.course.slug,
      verificationCode: row.verificationCode,
      issuedAt: row.issuedAt.toISOString(),
      completedAt: row.completedAt.toISOString(),
      lessonCount: row.lessonCount
    };
  });

  app.get("/public/academy/catalog", async () => {
    const courses = await listPublicSaleCourses();
    return { courses };
  });

  app.get("/public/academy/courses/:slug", async (request, reply) => {
    const { slug } = z.object({ slug: z.string().min(1).max(120) }).parse(request.params);
    const program = await getPublicCourseProgram(slug);
    if (!program) return reply.code(404).send({ message: "Curso indisponível." });
    return { course: program };
  });

  app.post("/public/academy/sync-test-aluno", async (request, reply) => {
    if (!env.ACADEMY_SYNC_TEST_ALUNO) {
      return reply.code(404).send({ message: "Not found" });
    }
    await ensureAcademyTestUser(request.log, env.ACADEMY_TEST_ALUNO_PASSWORD);
    return { ok: true, email: "aluno@gmail.com", message: "Conta de teste sincronizada." };
  });

  app.post("/public/academy/signup", async (request, reply) => {
    const body = z
      .object({
        name: z.string().min(2).max(120),
        email: z.string().email(),
        password: z.string().min(6).max(120),
        acceptTerms: z.literal(true, {
          errorMap: () => ({ message: "Aceite os termos para continuar." })
        })
      })
      .parse(request.body);

    const email = body.email.trim().toLowerCase();
    const passwordHash = await hashPassword(body.password);
    const existing = await prisma.user.findUnique({ where: { email } });

    let user;
    if (existing) {
      const fromStoreOrPurchase =
        isAcademyStoreCustomer(existing.company) ||
        !existing.company ||
        existing.company.startsWith("WhatsApp:");
      if (existing.role !== "CLIENT" || !fromStoreOrPurchase) {
        return reply.code(409).send({ message: "Já existe uma conta com este e-mail. Faça login." });
      }
      user = await prisma.user.update({
        where: { email },
        data: {
          name: body.name.trim(),
          passwordHash,
          status: "ACTIVE",
          company: ACADEMY_STORE_CUSTOMER_MARKER
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: body.name.trim(),
          email,
          passwordHash,
          role: "CLIENT",
          status: "ACTIVE",
          company: ACADEMY_STORE_CUSTOMER_MARKER
        }
      });
    }

    const authUser = toAuthUser(user, "academy");
    const token = await reply.jwtSign(authUser);

    return reply.code(201).send({
      token,
      user: authUser,
      authContext: "academy" as const
    });
  });

  app.post("/public/academy/lead", async (request, reply) => {
    const body = z
      .object({
        name: z.string().min(2).max(120),
        email: z.string().email(),
        phone: z.string().min(8).max(40),
        acceptMarketing: z.literal(true, {
          errorMap: () => ({ message: "Aceite o consentimento para continuar." })
        }),
        courseSlug: z.string().min(1).max(120).optional()
      })
      .parse(request.body);

    let courseTitle: string | null = null;
    if (body.courseSlug) {
      const row = await prisma.course.findUnique({
        where: { slug: body.courseSlug },
        select: { title: true, status: true, visibility: true }
      });
      if (row?.status === "PUBLISHED" && row.visibility === "PUBLIC_SALE") {
        courseTitle = row.title;
      }
    }

    const interest = courseTitle
      ? `Interesse no programa: ${courseTitle} (${body.courseSlug}).`
      : "Interesse geral na vitrine Academia.";

    await prisma.lead.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone.trim(),
        message: `[Academia /cursos] ${interest} Pediu proposta e entrada na lista.`,
        source: "academy_sales"
      }
    });

    return reply.code(201).send({
      message: "Recebemos seus dados. Em breve enviamos a proposta no e-mail informado."
    });
  });

  app.post("/public/academy/purchase", async (request, reply) => {
    const body = z
      .object({
        courseSlug: z.string().min(1).max(120),
        name: z.string().min(2).max(120),
        email: z.string().email(),
        phone: z.string().max(40).optional(),
        paymentMethod: z.enum(["PIX", "CARD"]),
        acceptTerms: z.literal(true, {
          errorMap: () => ({ message: "Aceite os termos para continuar." })
        })
      })
      .parse(request.body);

    const course = await prisma.course.findUnique({ where: { slug: body.courseSlug } });
    if (
      !course ||
      course.status !== "PUBLISHED" ||
      course.visibility !== "PUBLIC_SALE" ||
      course.priceCents == null ||
      course.priceCents <= 0
    ) {
      return reply.code(400).send({ message: "Curso indisponível para compra." });
    }

    const result = await fulfillAcademyPurchase({
      course,
      name: body.name,
      email: body.email,
      phone: body.phone,
      paymentMethod: body.paymentMethod,
      log: request.log
    });

    return reply.code(201).send({
      message: "Compra confirmada. Enviamos o acesso ao e-mail informado.",
      ...result
    });
  });

  app.post("/public/seed-launch/signup", async (request, reply) => {
    const body = z
      .object({
        name: z.string().min(2).max(120),
        email: z.string().email(),
        password: z.string().min(6).max(128),
        phone: z.string().min(8).max(40),
        company: z.string().max(200).optional(),
        challenge: z.string().max(2000).optional(),
        acceptTerms: z.literal(true, {
          errorMap: () => ({ message: "Aceite os termos para continuar." })
        })
      })
      .parse(request.body);

    const message = [
      "[Funil: Lançamento Semente — App do Zero ao Lançamento]",
      "[Cadastro na plataforma + lista da aula]",
      body.challenge?.trim() ? `\nDesafio informado:\n${body.challenge.trim()}` : "",
      `\n[LGPD: consentimento em ${new Date().toISOString()}]`
    ]
      .filter(Boolean)
      .join("");

    try {
      const { authUser, homePath } = await registerSeedLaunchClient({
        name: body.name,
        email: body.email,
        password: body.password,
        phone: body.phone,
        company: body.company,
        message
      });
      const token = await reply.jwtSign(authUser);
      return reply.code(201).send({
        token,
        user: authUser,
        authContext: "agency" as const,
        homePath,
        message:
          "Conta criada. Acesse a Área do cliente para assistir à live de apresentação e seguir o funil."
      });
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
      if (statusCode === 409) {
        return reply.code(409).send({ message: (error as Error).message });
      }
      throw error;
    }
  });

  app.post("/public/leads", async (request, reply) => {
    const body = leadSchema.parse(request.body);
    const lead = await prisma.lead.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim(),
        company: body.company?.trim(),
        message: body.message.trim(),
        budgetHint: body.budgetHint?.trim(),
        packageTier: body.packageTier,
        source: body.source ?? "landing"
      }
    });

    return reply.code(201).send({
      id: lead.id,
      message: "Recebemos sua solicitação. Entraremos em contato em breve."
    });
  });
}
