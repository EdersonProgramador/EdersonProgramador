import type { FastifyBaseLogger } from "fastify";
import { env } from "./env.js";
import { hashPassword } from "./auth.js";
import { prisma } from "./prisma.js";

export async function ensureSeedAdmin(log: FastifyBaseLogger) {
  const allowBootstrap =
    env.NODE_ENV === "development" || (env.NODE_ENV === "production" && env.ADMIN_BOOTSTRAP);

  if (!allowBootstrap) return;

  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    log.warn(
      "ADMIN_BOOTSTRAP ativo, mas ADMIN_EMAIL/ADMIN_PASSWORD ausentes ou inválidos (senha ≥ 12 no Render) — nenhum admin criado."
    );
    return;
  }

  const email = env.ADMIN_EMAIL.toLowerCase();
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role === "ADMIN") {
      await prisma.user.update({
        where: { email },
        data: { passwordHash, name: env.ADMIN_NAME }
      });
      log.info({ email }, "Admin existente: senha sincronizada com ADMIN_PASSWORD do ambiente.");
    }
    return;
  }

  await prisma.user.create({
    data: {
      name: env.ADMIN_NAME,
      email,
      passwordHash,
      role: "ADMIN",
      github: "https://github.com/EdersonProgramador"
    }
  });
  log.info({ email }, "Usuário admin criado (bootstrap).");
}
