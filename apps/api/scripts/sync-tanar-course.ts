/**
 * Sincroniza a trilha Tanar no banco local (ou DATABASE_URL do .env).
 * Uso: npm run sync:tanar
 */
import { PrismaClient } from "@prisma/client";
import { ensureTanarCourse } from "../src/courses/import-tanar-course.js";

const prisma = new PrismaClient();
const log = {
  info: (obj: object, msg: string) => console.log(msg, obj),
  warn: (obj: object, msg: string) => console.warn(msg, obj)
};

try {
  await ensureTanarCourse(prisma, log as never);
  console.log("Tanar sincronizado com sucesso.");
} finally {
  await prisma.$disconnect();
}
