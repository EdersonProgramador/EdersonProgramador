/**
 * Sincroniza o curso Cabalas — Rabino Dudu no banco (DATABASE_URL do .env).
 * Uso: npm run sync:cabalas-rabino-dudu --workspace=@ederson-agencia/api
 */
import { PrismaClient } from "@prisma/client";
import { ensureCabalasRabinoDuduCourse } from "../src/courses/import-cabalas-rabino-dudu-course.js";

const prisma = new PrismaClient();
const log = {
  info: (obj: object, msg: string) => console.log(msg, obj),
  warn: (obj: object, msg: string) => console.warn(msg, obj)
};

try {
  await ensureCabalasRabinoDuduCourse(prisma, log as never);
  console.log("Curso Cabalas Rabino Dudu sincronizado com sucesso.");
} finally {
  await prisma.$disconnect();
}
