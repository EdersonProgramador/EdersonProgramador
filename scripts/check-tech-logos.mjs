import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const stackPath = path.join(root, "packages/shared/src/development-tech-stack.ts");
const slugPath = path.join(root, "packages/shared/src/development-tech-brand-slugs.ts");

const stack = fs.readFileSync(stackPath, "utf8");
const slugsFile = fs.readFileSync(slugPath, "utf8");

const categoryIds = new Set([
  "visao",
  "front-end",
  "back-end",
  "dados",
  "infra",
  "automacao",
  "pagamentos",
  "email"
]);

const ids = [...stack.matchAll(/\{ id: "([^"]+)"/g)]
  .map((m) => m[1])
  .filter((id) => !categoryIds.has(id));

const map = {};
for (const m of slugsFile.matchAll(/^\s*(?:"([^"]+)"|([a-zA-Z0-9_-]+)):\s*"([^"]+)"/gm)) {
  map[m[1] ?? m[2]] = m[3];
}

const missing = ids.filter((id) => !map[id]);
console.log("Options:", ids.length);
console.log("Missing mappings:", missing.join(", ") || "(none)");

const uniqueSlugs = [...new Set(Object.values(map))];
const bad = [];
const ok = [];

await Promise.all(
  uniqueSlugs.map(async (slug) => {
    const url = `https://cdn.simpleicons.org/${slug}`;
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (res.ok) ok.push(slug);
      else bad.push({ slug, status: res.status });
    } catch (e) {
      bad.push({ slug, status: String(e) });
    }
  })
);

bad.sort((a, b) => a.slug.localeCompare(b.slug));
console.log("\nBroken Simple Icons slugs (" + bad.length + "):");
for (const b of bad) {
  const opts = Object.entries(map)
    .filter(([, s]) => s === b.slug)
    .map(([k]) => k);
  console.log(`  ${b.slug} (${b.status}) -> ${opts.join(", ")}`);
}

const badSlugSet = new Set(bad.map((b) => b.slug));
const brokenOptions = Object.entries(map)
  .filter(([, s]) => badSlugSet.has(s))
  .map(([id]) => id);
console.log("\nOptions with broken CDN:", brokenOptions.join(", "));
