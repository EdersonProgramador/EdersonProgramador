import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const webDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(webDir, "../..");
const sharedEntry = resolve(repoRoot, "packages/shared/src/index.ts");

export default defineConfig({
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
    proxy: {
      "/auth": { target: "http://127.0.0.1:3333", changeOrigin: true },
      "/public": { target: "http://127.0.0.1:3333", changeOrigin: true },
      "/agency": { target: "http://127.0.0.1:3333", changeOrigin: true },
      "/health": { target: "http://127.0.0.1:3333", changeOrigin: true }
    }
  }
});
