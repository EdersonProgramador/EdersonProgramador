import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { homePathForRole } from "@ederson-agencia/shared";
import { getAuthUser, hashPassword, toAuthUser, verifyPassword } from "../auth.js";
import { prisma } from "../prisma.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
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
  })
});

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const email = body.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== "ACTIVE") {
      return reply.code(401).send({ message: "E-mail ou senha inválidos." });
    }

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) {
      return reply.code(401).send({ message: "E-mail ou senha inválidos." });
    }

    const authUser = toAuthUser(user);
    const token = await reply.jwtSign(authUser);

    return {
      token,
      user: authUser,
      homePath: homePathForRole(authUser.role)
    };
  });

  app.post("/auth/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);
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

    const authUser = toAuthUser(user);
    const token = await reply.jwtSign(authUser);

    return reply.code(201).send({
      token,
      user: authUser,
      homePath: homePathForRole(authUser.role)
    });
  });

  app.get("/auth/me", async (request, reply) => {
    const user = await getAuthUser(request);
    if (!user) {
      return reply.code(401).send({ message: "Sessão expirada." });
    }
    return { user, homePath: homePathForRole(user.role) };
  });
}
