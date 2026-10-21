import { env } from "./env.js";
import { hashPassword } from "./auth.js";
import { prisma } from "./prisma.js";

export async function ensureSeedAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;

  const allowBootstrap =
    env.NODE_ENV === "development" || (env.NODE_ENV === "production" && env.ADMIN_BOOTSTRAP);

  if (!allowBootstrap) return;

  const email = env.ADMIN_EMAIL.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  await prisma.user.create({
    data: {
      name: env.ADMIN_NAME,
      email,
      passwordHash: await hashPassword(env.ADMIN_PASSWORD),
      role: "ADMIN",
      github: "https://github.com/EdersonProgramador"
    }
  });
}
