import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const iconsUrl = new URL("../packages/shared/dist/development-tech-brand-icons.js", import.meta.url);
await import(iconsUrl.href).then(async (m) => {
  const stack = fs.readFileSync(path.join(root, "packages/shared/src/development-tech-stack.ts"), "utf8");
  const categoryIds = new Set(["visao", "front-end", "back-end", "dados", "infra", "automacao", "pagamentos", "email"]);
  const ids = [...stack.matchAll(/\{ id: "([^"]+)"/g)].map((x) => x[1]).filter((id) => !categoryIds.has(id));

  const missing = [];
  for (const id of ids) {
    const urls = m.devTechBrandIconCandidates(id);
    if (!urls.length) {
      missing.push({ id, reason: "no candidates" });
      continue;
    }
    let ok = false;
    for (const url of urls) {
      if (url.startsWith("/dev-tech-icons/")) {
        const file = path.join(root, "apps/web/public", url.slice(1));
        if (fs.existsSync(file) && fs.statSync(file).size > 100) {
          ok = true;
          break;
        }
        continue;
      }
      try {
        const res = await fetch(url, { redirect: "follow" });
        if (res.ok) {
          ok = true;
          break;
        }
      } catch {
        /* next */
      }
    }
    if (!ok) missing.push({ id, reason: "all urls failed", urls });
  }

  console.log("Checked", ids.length, "technologies");
  if (!missing.length) {
    console.log("All logos resolve OK");
    return;
  }
  console.log("Still missing (" + missing.length + "):");
  for (const x of missing) console.log(" ", x.id, x.reason, x.urls?.join(" | ") ?? "");
});
