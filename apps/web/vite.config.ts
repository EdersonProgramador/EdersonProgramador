import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";

const webDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(webDir, "../..");
const sharedEntry = resolve(repoRoot, "packages/shared/src/index.ts");

const API_PROXY_PATHS = ["/auth", "/public", "/agency", "/admin", "/courses", "/health", "/uploads"] as const;
const REMOTE_DEV_API = "https://ederson-agencia-api.onrender.com";
/** Origin permitido no WEB_ORIGIN do Render (evita 500 por CORS no dev). */
const REMOTE_DEV_PROXY_ORIGIN = "https://www.edersonprogramador.com.br";

function isLocalApiTarget(target: string): boolean {
  return /^https?:\/\/(127\.0\.0\.1|localhost):3333\/?$/i.test(target.trim());
}

/** Dev sem Postgres local: proxy sempre para Render, salvo opt-in explícito. */
function resolveDevApiTarget(env: Record<string, string>): string {
  const raw = env.VITE_DEV_API_TARGET?.trim();
  const allowLocal = env.VITE_DEV_API_USE_LOCAL === "true";
  if (raw && (allowLocal || !isLocalApiTarget(raw))) {
    return raw.replace(/\/$/, "");
  }
  if (raw && isLocalApiTarget(raw) && !allowLocal) {
    console.warn(
      `[vite] VITE_DEV_API_TARGET=${raw} ignorado (Postgres local). Proxy → ${REMOTE_DEV_API}. ` +
        "Use VITE_DEV_API_USE_LOCAL=true para API em :3333."
    );
  }
  return REMOTE_DEV_API;
}

function apiProxy(target: string) {
  const proxyHeaders =
    target.startsWith("https://") ? { Origin: REMOTE_DEV_PROXY_ORIGIN } : undefined;

  const entry: Record<
    string,
    {
      target: string;
      changeOrigin: boolean;
      secure: boolean;
      headers?: Record<string, string>;
      configure: (proxy: import("http-proxy").Server) => void;
    }
  > = {};
  for (const path of API_PROXY_PATHS) {
    entry[path] = {
      target,
      changeOrigin: true,
      secure: true,
      ...(proxyHeaders ? { headers: proxyHeaders } : {}),
      configure(proxy) {
        if (!proxyHeaders) return;
        proxy.on("proxyReq", (proxyReq, req) => {
          req.headers.origin = REMOTE_DEV_PROXY_ORIGIN;
          req.headers.referer = REMOTE_DEV_PROXY_ORIGIN;
          proxyReq.setHeader("Origin", REMOTE_DEV_PROXY_ORIGIN);
          proxyReq.setHeader("Referer", `${REMOTE_DEV_PROXY_ORIGIN}/`);
        });
      }
    };
  }
  return entry;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, "");
  const apiTarget = mode === "development" ? resolveDevApiTarget(env) : REMOTE_DEV_API;

  return {
    envDir: repoRoot,
    plugins: [react()],
    resolve: {
      alias: {
        "@ederson-agencia/shared": sharedEntry
      }
    },
    server: {
      port: 5174,
      strictPort: true,
      host: true,
      watch: {
        ignored: ["**/public/portfolio/**"]
      },
      proxy: apiProxy(apiTarget)
    }
  };
});
