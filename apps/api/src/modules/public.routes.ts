import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  AGENCY_META,
  CONTRACT_DEFAULTS,
  PORTFOLIO_GITHUB,
  PORTFOLIO_PRODUCTION
} from "@ederson-agencia/shared";
import { fulfillAcademyPurchase, listPublicSaleCourses } from "../courses/academy-purchase.js";
import { prisma } from "../prisma.js";

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10),
  budgetHint: z.string().optional(),
  packageTier: z.enum(["essential", "professional", "advanced"]).optional()
});

export async function registerPublicRoutes(app: FastifyInstance) {
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
        packageTier: body.packageTier
      }
    });

    return reply.code(201).send({
      id: lead.id,
      message: "Recebemos sua solicitação. Entraremos em contato em breve."
    });
  });
}
