/**
 * Sincroniza o curso ENEM (cronograma Felipe Araújo) no banco (DATABASE_URL do .env).
 * Uso: npm run sync:enem-cronograma --workspace=@ederson-agencia/api
 */
import { PrismaClient } from "@prisma/client";
import { ensureEnemCronogramaCourse } from "../src/courses/import-enem-cronograma-course.js";

const prisma = new PrismaClient();
const log = {
  info: (obj: object, msg: string) => console.log(msg, obj),
  warn: (obj: object, msg: string) => console.warn(msg, obj)
};

try {
  await ensureEnemCronogramaCourse(prisma, log as never);
  console.log("ENEM cronograma sincronizado com sucesso.");
} finally {
  await prisma.$disconnect();
}
