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

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.preprocess((value) => value ?? process.env.PORT, z.coerce.number().default(3333)),
  DATABASE_URL: z.string().default("file:./prisma/dev.db"),
  WEB_ORIGIN: z.string().default("http://localhost:5174"),
  JWT_SECRET: z.string().min(16).default("change-me-in-local-development"),
  ADMIN_EMAIL: z.string().email().default("admin@ederson.dev"),
  ADMIN_PASSWORD: z.string().min(6).default("admin123456"),
  ADMIN_NAME: z.string().default("Ederson Programador")
});

export const env = envSchema.parse(process.env);
