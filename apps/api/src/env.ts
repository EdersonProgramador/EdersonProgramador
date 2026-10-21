import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { z } from "zod";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const envCandidates = [
  resolve(moduleDir, "../../../../.env"),
  resolve(moduleDir, "../../../.env"),
  resolve(process.cwd(), "../../.env"),
  resolve(process.cwd(), ".env")
];

for (const envPath of [...new Set(envCandidates)]) {
  if (existsSync(envPath)) {
    config({ path: envPath, override: true });
  }
}

const nodeEnv = (process.env.NODE_ENV ?? "development") as "development" | "test" | "production";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    API_PORT: z.preprocess((value) => value ?? process.env.PORT, z.coerce.number().default(3333)),
    DATABASE_URL: z.string().default("file:./prisma/dev.db"),
    WEB_ORIGIN: z.string().default("http://localhost:5174"),
    JWT_SECRET: z.preprocess((value) => {
      if (typeof value === "string" && value.trim()) return value.trim();
      if (nodeEnv === "production") return undefined;
      return "dev-only-jwt-secret-min-16-chars";
    }, z.string().min(16)),
    ADMIN_EMAIL: z.preprocess(
      (value) => (typeof value === "string" && value.trim() ? value.trim().toLowerCase() : undefined),
      z.string().email().optional()
    ),
    ADMIN_PASSWORD: z.preprocess(
      (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
      z.string().min(12).optional()
    ),
    ADMIN_NAME: z.string().default("Ederson Programador"),
    ADMIN_BOOTSTRAP: z
      .preprocess((value) => value === "true" || value === "1", z.boolean())
      .default(false),
    SEED_DEMO_USERS: z
      .preprocess((value) => value === "true" || value === "1", z.boolean())
      .default(false)
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== "production") return;

    if (!data.JWT_SECRET || data.JWT_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message: "Em produção, JWT_SECRET deve ter pelo menos 32 caracteres."
      });
    }

    if (data.JWT_SECRET.startsWith("dev-only-")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message: "Em produção, use um JWT_SECRET exclusivo (não o valor de desenvolvimento)."
      });
    }
  });

export const env = envSchema.parse(process.env);
