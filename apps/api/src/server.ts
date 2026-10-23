import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { ZodError } from "zod";
import { env } from "./env.js";
import { registerAgencyRoutes } from "./modules/agency.routes.js";
import { registerAuthRoutes } from "./modules/auth.routes.js";
import { registerCoursesRoutes } from "./modules/courses.routes.js";
import { registerPublicRoutes } from "./modules/public.routes.js";
import { ensureSeedCourses } from "./seed-courses.js";
import { prisma } from "./prisma.js";
import { ensureSeedAdmin } from "./seed-admin.js";

const app = Fastify({
  logger: true,
  trustProxy: true
});

const allowedOrigins = env.WEB_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

await app.register(cors, {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    if (env.NODE_ENV !== "production" && /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origem não permitida pelo CORS"), false);
  },
  credentials: true
});

await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });
await app.register(jwt, { secret: env.JWT_SECRET });

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return reply.code(400).send({ message: first?.message ?? "Dados inválidos." });
  }
  const statusCode = "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : 500;
  if (statusCode >= 500) app.log.error(error);
  return reply.code(statusCode).send({ message: error.message || "Erro interno." });
});

app.get("/health", async () => {
  let adminUsers = 0;
  try {
    adminUsers = await prisma.user.count({ where: { role: "ADMIN" } });
  } catch {
    /* banco indisponível no health check */
  }
  return {
    status: "ok",
    service: "ederson-agencia-api",
    adminUsers,
    adminBootstrap: env.ADMIN_BOOTSTRAP,
    adminEnvReady: Boolean(env.ADMIN_EMAIL && env.ADMIN_PASSWORD)
  };
});

await registerPublicRoutes(app);
await registerAuthRoutes(app);
await registerAgencyRoutes(app);
await registerCoursesRoutes(app);

try {
  await ensureSeedAdmin(app.log);
} catch (err) {
  app.log.warn({ err }, "Bootstrap do admin não concluído (verifique ADMIN_EMAIL, ADMIN_PASSWORD e o banco)");
}

try {
  await ensureSeedCourses(app.log);
} catch (err) {
  app.log.warn({ err }, "Seed de cursos não concluído");
}

const port = env.API_PORT;
const host = "0.0.0.0";
await app.listen({ port, host });
app.log.info(`API em http://${host}:${port}`);
