import { env } from "./env.js";

/** Domínios do front em produção — sempre permitidos mesmo se WEB_ORIGIN no Render estiver desatualizado. */
const PRODUCTION_SITE_ORIGINS = [
  "https://www.edersonprogramador.com.br",
  "https://edersonprogramador.com.br"
] as const;

export function resolveAllowedOrigins(): Set<string> {
  const origins = new Set(
    env.WEB_ORIGIN.split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  );
  if (env.NODE_ENV === "production") {
    for (const o of PRODUCTION_SITE_ORIGINS) origins.add(o);
  }
  return origins;
}

export function isAllowedCorsOrigin(origin: string | undefined, allowed: Set<string>): origin is string {
  if (!origin) return false;
  return allowed.has(origin);
}
