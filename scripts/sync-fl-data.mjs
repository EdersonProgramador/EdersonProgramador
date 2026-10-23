import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "packages/courses-fl/data");
const sources = [
  join(process.env.USERPROFILE ?? "", "Desktop/FL/data"),
  "C:/Users/EDERSON/Desktop/FL/data"
];

const source = sources.find((dir) => existsSync(join(dir, "curriculum.json")));
if (!source) {
  console.error("Não encontrei Desktop/FL/data com curriculum.json.");
  process.exit(1);
}

mkdirSync(target, { recursive: true });
for (const name of readdirSync(source).filter((f) => f.endsWith(".json"))) {
  copyFileSync(join(source, name), join(target, name));
  console.log("copied", name);
}

console.log("OK — JSON do FL sincronizado em packages/courses-fl/data");
