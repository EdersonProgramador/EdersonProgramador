import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { homePathAfterLogin } from "@ederson-agencia/shared";
import { assertEligibleForAcademyLogin, isAcademyStoreCustomer } from "../auth-access.js";
import { getAuthUser, hashPassword, toAuthUser, verifyPassword } from "../auth.js";
import { prisma } from "../prisma.js";
import { linkLeadToUser } from "../agency/client-funnel.js";
import { registerUploadRoutes } from "./uploads.routes.js";

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

const profilePatchSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    company: z.string().trim().max(200).optional().nullable(),
    github: z.string().trim().url().max(500).optional().nullable().or(z.literal("")),
    phone: z.string().trim().max(40).optional().nullable(),
    currentPassword: z.string().min(6).optional(),
    newPassword: z.string().min(6).max(128).optional()
  })
  .superRefine((body, ctx) => {
    if (body.newPassword && !body.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe a senha atual para definir uma nova senha.",
        path: ["currentPassword"]
      });
    }
  });

async function loadActiveUserForToken(tokenUser: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>) {
  const dbUser = await prisma.user.findUnique({ where: { id: tokenUser.id } });
  if (!dbUser || dbUser.status !== "ACTIVE") return null;
  const context = tokenUser.authContext ?? "agency";
  return { dbUser, authUser: toAuthUser(dbUser, context) };
}

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

    if (body.role === "CLIENT") {
      await linkLeadToUser(user.id, email);
    }

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
    const tokenUser = await getAuthUser(request);
    if (!tokenUser) {
      return reply.code(401).send({ message: "Sessão expirada." });
    }
    const loaded = await loadActiveUserForToken(tokenUser);
    if (!loaded) {
      return reply.code(401).send({ message: "Sessão expirada." });
    }
    const { authUser } = loaded;
    return {
      user: authUser,
      authContext: authUser.authContext,
      homePath: homePathAfterLogin(authUser.role, authUser.authContext ?? "agency")
    };
  });

  app.patch("/auth/profile", async (request, reply) => {
    const tokenUser = await getAuthUser(request);
    if (!tokenUser) {
      return reply.code(401).send({ message: "Faça login para editar seu perfil." });
    }

    const body = profilePatchSchema.parse(request.body);
    const loaded = await loadActiveUserForToken(tokenUser);
    if (!loaded) {
      return reply.code(401).send({ message: "Sessão expirada." });
    }

    const { dbUser } = loaded;
    const context = tokenUser.authContext ?? "agency";
    const data: {
      name?: string;
      company?: string | null;
      github?: string | null;
      phone?: string | null;
      passwordHash?: string;
    } = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.phone !== undefined) data.phone = body.phone?.trim() || null;
    if (body.github !== undefined) data.github = body.github?.trim() || null;

    if (body.company !== undefined && !isAcademyStoreCustomer(dbUser.company)) {
      data.company = body.company?.trim() || null;
    }

    if (body.newPassword) {
      const ok = await verifyPassword(body.currentPassword!, dbUser.passwordHash);
      if (!ok) {
        return reply.code(400).send({ message: "Senha atual incorreta." });
      }
      data.passwordHash = await hashPassword(body.newPassword);
    }

    if (Object.keys(data).length === 0) {
      return reply.code(400).send({ message: "Nenhum dado para atualizar." });
    }

    const updated = await prisma.user.update({
      where: { id: dbUser.id },
      data
    });

    const authUser = toAuthUser(updated, context);
    const token = await reply.jwtSign(authUser);

    return {
      token,
      user: authUser,
      authContext: context,
      homePath: homePathAfterLogin(authUser.role, context),
      message: "Perfil atualizado."
    };
  });

  await registerUploadRoutes(app);
}
