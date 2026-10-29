/**
 * Cria/atualiza aluno de teste para login na vitrine Academia.
 * Uso: DATABASE_URL="postgresql://..." npx tsx scripts/create-academy-test-user.ts
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/auth.js";

const ACADEMY_STORE_CUSTOMER_MARKER = "__academy_store__";

const EMAIL = "aluno@gmail.com";
const PASSWORD = "123465";
const NAME = "Aluno Teste";

async function main() {
  const prisma = new PrismaClient();
  const email = EMAIL.toLowerCase();
  const passwordHash = await hashPassword(PASSWORD);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      name: NAME,
      email,
      passwordHash,
      role: "CLIENT",
      status: "ACTIVE",
      company: ACADEMY_STORE_CUSTOMER_MARKER
    },
    update: {
      name: NAME,
      passwordHash,
      status: "ACTIVE",
      company: ACADEMY_STORE_CUSTOMER_MARKER
    }
  });

  console.log(JSON.stringify({ ok: true, id: user.id, email: user.email, company: user.company }, null, 2));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
