/**
 * Cria/atualiza aluno de teste para login na vitrine Academia.
 * Uso: DATABASE_URL="postgresql://..." npx tsx scripts/create-academy-test-user.ts
 */
import { prisma } from "../src/prisma.js";
import { ensureAcademyTestUser } from "../src/seed-academy-test-user.js";

const log = {
  info: (obj: unknown, msg?: string) => console.log(msg ?? "", obj)
} as Parameters<typeof ensureAcademyTestUser>[0];

async function main() {
  await ensureAcademyTestUser(log);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
