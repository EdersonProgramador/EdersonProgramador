import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const slugPath = path.join(root, "packages/shared/src/development-tech-brand-slugs.ts");
const slugsFile = fs.readFileSync(slugPath, "utf8");

const map = {};
for (const m of slugsFile.matchAll(/^\s*(?:"([^"]+)"|([a-zA-Z0-9_-]+)):\s*"([^"]+)"/gm)) {
  map[m[1] ?? m[2]] = m[3];
}

async function ok(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    return res.ok;
  } catch {
    return false;
  }
}

async function resolveSlug(slug) {
  if (await ok(`https://cdn.simpleicons.org/${slug}`)) return { type: "cdn", slug };
  for (const ver of ["11.14.0", "9.21.0"]) {
    const url = `https://cdn.jsdelivr.net/npm/simple-icons@${ver}/icons/${slug}.svg`;
    if (await ok(url)) return { type: "jsdelivr", slug, ver };
  }
  return null;
}

const needCustom = [];
const fixes = {};

for (const [id, slug] of Object.entries(map)) {
  const hit = await resolveSlug(slug);
  if (!hit) needCustom.push({ id, slug });
  else if (hit.type === "jsdelivr") fixes[id] = { slug, ...hit };
}

console.log("Need custom URL (" + needCustom.length + "):");
for (const x of needCustom) console.log(`  ${x.id} (${x.slug})`);

console.log("\nUse jsdelivr fallback (" + Object.keys(fixes).length + "):");
for (const [id, v] of Object.entries(fixes)) console.log(`  ${id}: ${v.slug} @ ${v.ver}`);
