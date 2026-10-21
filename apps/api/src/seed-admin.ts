import { env } from "./env.js";
import { hashPassword } from "./auth.js";
import { prisma } from "./prisma.js";

export async function ensureSeedAdmin() {
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
