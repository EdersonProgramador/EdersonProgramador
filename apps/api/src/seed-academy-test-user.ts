import type { FastifyBaseLogger } from "fastify";
import { hashPassword } from "./auth.js";
import { prisma } from "./prisma.js";

export const ACADEMY_STORE_CUSTOMER_MARKER = "__academy_store__";

const TEST_EMAIL = "aluno@gmail.com";
const TEST_NAME = "Aluno Teste";
const DEFAULT_TEST_PASSWORD = "123465";

export async function ensureAcademyTestUser(
  log: FastifyBaseLogger,
  password: string = DEFAULT_TEST_PASSWORD
): Promise<void> {
  const email = TEST_EMAIL.toLowerCase();
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      name: TEST_NAME,
      email,
      passwordHash,
      role: "CLIENT",
      status: "ACTIVE",
      company: ACADEMY_STORE_CUSTOMER_MARKER
    },
    update: {
      name: TEST_NAME,
      passwordHash,
      status: "ACTIVE",
      company: ACADEMY_STORE_CUSTOMER_MARKER
    }
  });

  log.info({ userId: user.id, email: user.email }, "Conta de teste Academia sincronizada");
}
