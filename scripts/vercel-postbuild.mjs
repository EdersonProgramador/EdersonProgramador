import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

/** Vercel às vezes espera ./dist na raiz do repo; espelha apps/web/dist. */
if (!process.env.VERCEL) {
  process.exit(0);
}

const webDist = resolve("apps/web/dist");
const rootDist = resolve("dist");

if (!existsSync(webDist)) {
  console.error("vercel-postbuild: apps/web/dist não encontrado.");
  process.exit(1);
}

rmSync(rootDist, { recursive: true, force: true });
cpSync(webDist, rootDist, { recursive: true });
console.log("vercel-postbuild: dist publicado em ./dist (cópia de apps/web/dist).");
