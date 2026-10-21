import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";
import { ZodError } from "zod";
import { env } from "./env.js";
import { registerAgencyRoutes } from "./modules/agency.routes.js";
import { registerAuthRoutes } from "./modules/auth.routes.js";
import { registerPublicRoutes } from "./modules/public.routes.js";
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

app.get("/health", async () => ({ status: "ok", service: "ederson-agencia-api" }));

await registerPublicRoutes(app);
await registerAuthRoutes(app);
await registerAgencyRoutes(app);

await ensureSeedAdmin();

const port = env.API_PORT;
const host = "0.0.0.0";
await app.listen({ port, host });
app.log.info(`API em http://${host}:${port}`);
