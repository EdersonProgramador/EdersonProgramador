import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const defsRoot = path.join(repoRoot, "node_modules/monaco-editor/esm/vs/languages/definitions");
const outFile = path.join(repoRoot, "packages/shared/src/monaco-extension-language-map.generated.ts");

const map = new Map();

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name === "register.js") {
      const c = fs.readFileSync(p, "utf8");
      const blocks = c.split("registerLanguage").slice(1);
      for (const b of blocks) {
        const idm = b.match(/id:\s*"([^"]+)"/);
        if (!idm) continue;
        const id = idm[1];
        const extMatches = b.matchAll(/"\.([a-z0-9]+)"/gi);
        for (const em of extMatches) map.set(em[1].toLowerCase(), id);
      }
    }
  }
}

walk(defsRoot);

/** JSON é suportado pelo Monaco mas costuma vir de outro bundle; garantimos o id */
map.set("json", "json");
map.set("jsonc", "json");

/** Extensões sem registro próprio no Monaco */
map.set("vue", "html");
map.set("svelte", "html");
map.set("prisma", "sql");
map.set("jinja", "html");
map.set("j2", "html");

const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
const lines = sorted.map(([ext, id]) => `  "${ext}": "${id}"`);
const body = `/**
 * Gerado por scripts/gen-monaco-ext-map.mjs — mapeia extensão → id de linguagem do Monaco.
 * Não edite manualmente; rode: node scripts/gen-monaco-ext-map.mjs
 */
export const MONACO_LANGUAGE_BY_EXTENSION: Readonly<Record<string, string>> = {\n${lines.join(",\n")}\n};\n`;

fs.writeFileSync(outFile, body, "utf8");
console.log(`Wrote ${sorted.length} mappings → ${path.relative(repoRoot, outFile)}`);
