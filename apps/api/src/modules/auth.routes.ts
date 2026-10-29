import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { homePathAfterLogin } from "@ederson-agencia/shared";
import { assertEligibleForAcademyLogin } from "../auth-access.js";
import { getAuthUser, hashPassword, toAuthUser, verifyPassword } from "../auth.js";
import { prisma } from "../prisma.js";

const authContextSchema = z.enum(["agency", "academy"]);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  context: authContextSchema.default("agency")
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["CLIENT", "FREELANCER"]).default("CLIENT"),
  company: z.string().optional(),
  github: z.string().url().optional().or(z.literal("")),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Aceite os termos para continuar." })
  }),
  context: authContextSchema.default("agency")
});

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const email = body.email.trim().toLowerCase();
    const context = body.context;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== "ACTIVE") {
      return reply.code(401).send({ message: "E-mail ou senha inválidos." });
    }

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) {
      return reply.code(401).send({ message: "E-mail ou senha inválidos." });
    }

    if (context === "academy") {
      try {
        await assertEligibleForAcademyLogin(
          user.id,
          user.role as "ADMIN" | "CLIENT" | "FREELANCER",
          user.company,
          user.email
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode ?? 403;
        return reply.code(statusCode).send({ message: (error as Error).message });
      }
    }

    const authUser = toAuthUser(user, context);
    const token = await reply.jwtSign(authUser);

    return {
      token,
      user: authUser,
      authContext: context,
      homePath: homePathAfterLogin(authUser.role, context)
    };
  });

  app.post("/auth/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);
    if (body.context !== "agency") {
      return reply.code(403).send({
        message: "Cadastro aberto apenas pela Agência. Para cursos, solicite matrícula ao administrador."
      });
    }

    const email = body.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(409).send({ message: "Já existe uma conta com este e-mail." });
    }

    const user = await prisma.user.create({
      data: {
        name: body.name.trim(),
        email,
        passwordHash: await hashPassword(body.password),
        role: body.role,
        company: body.company?.trim() || null,
        github: body.github?.trim() || null
      }
    });

    const authUser = toAuthUser(user, "agency");
    const token = await reply.jwtSign(authUser);

    return reply.code(201).send({
      token,
      user: authUser,
      authContext: "agency" as const,
      homePath: homePathAfterLogin(authUser.role, "agency")
    });
  });

  app.get("/auth/me", async (request, reply) => {
    const user = await getAuthUser(request);
    if (!user) {
      return reply.code(401).send({ message: "Sessão expirada." });
    }
    return {
      user,
      authContext: user.authContext,
      homePath: homePathAfterLogin(user.role, user.authContext ?? "agency")
    };
  });
}
