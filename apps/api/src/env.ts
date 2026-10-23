import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { z } from "zod";

const nodeEnv = (process.env.NODE_ENV ?? "development") as "development" | "test" | "production";

// Em produção (Render), use só variáveis do painel — não sobrescreva com .env local do build.
if (nodeEnv !== "production") {
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
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    API_PORT: z.preprocess((value) => value ?? process.env.PORT, z.coerce.number().default(3333)),
    DATABASE_URL: z.preprocess(
      (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
      nodeEnv === "production"
        ? z.string().min(1, "DATABASE_URL é obrigatória em produção.")
        : z.string().default("postgresql://postgres:postgres@localhost:5432/ederson_agencia?schema=public")
    ),
    WEB_ORIGIN: z.string().default("http://localhost:5174"),
    JWT_SECRET: z.preprocess((value) => {
      if (typeof value === "string" && value.trim()) return value.trim();
      if (nodeEnv === "production") return undefined;
      return "dev-only-jwt-secret-min-16-chars";
    }, z.string().min(16)),
    ADMIN_EMAIL: z.preprocess((value) => {
      if (typeof value !== "string") return undefined;
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) return undefined;
      return z.string().email().safeParse(trimmed).success ? trimmed : undefined;
    }, z.string().email().optional()),
    ADMIN_PASSWORD: z.preprocess((value) => {
      if (typeof value !== "string") return undefined;
      const trimmed = value.trim();
      if (trimmed.length < 6) return undefined;
      return trimmed;
    }, z.string().min(6).optional()),
    ADMIN_NAME: z.string().default("Ederson Programador"),
    ADMIN_BOOTSTRAP: z
      .preprocess((value) => value === "true" || value === "1", z.boolean())
      .default(false),
    SEED_DEMO_USERS: z
      .preprocess((value) => value === "true" || value === "1", z.boolean())
      .default(false),
    FL_MEDIA_ROOT: z.preprocess(
      (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
      z.string().optional()
    )
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

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Configuração de ambiente inválida:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".") || "(root)"}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
