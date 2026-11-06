/** Nome do ícone Material Icons Round (ligadura por classe .material-icons-round). */

const BY_EXT: Record<string, string> = {
  ts: "code",
  tsx: "code",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  json: "data_object",
  jsonc: "data_object",
  html: "html",
  htm: "html",
  vue: "view_quilt",
  svelte: "layers",
  css: "palette",
  scss: "palette",
  sass: "palette",
  less: "palette",
  md: "description",
  mdx: "article",
  yml: "settings",
  yaml: "settings",
  toml: "tune",
  xml: "code",
  svg: "image",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  ico: "image",
  wgsl: "memory",
  sql: "storage",
  prisma: "storage",
  py: "data_object",
  pyw: "data_object",
  rb: "diamond",
  rs: "construction",
  go: "bolt",
  php: "php",
  swift: "bolt",
  kt: "android",
  kts: "android",
  java: "coffee",
  scala: "grid_view",
  dart: "flutter_dash",
  lua: "sports_esports",
  sh: "terminal",
  bash: "terminal",
  zsh: "terminal",
  ps1: "terminal",
  bat: "terminal",
  cmd: "terminal",
  dockerfile: "docker",
  tf: "cloud",
  hcl: "cloud",
  cpp: "code",
  cxx: "code",
  cc: "code",
  hpp: "code",
  h: "code",
  c: "code",
  cs: "code",
  fs: "code",
  fsx: "code",
  vb: "code",
  fsproj: "code",
  pl: "data_object",
  pm: "data_object",
  r: "analytics",
  ex: "science",
  exs: "science",
  erl: "hub",
  hs: "functions",
  clj: "forest",
  cljs: "forest",
  edn: "forest",
  gql: "hub",
  graphql: "hub",
  proto: "schema",
  tex: "functions",
  rst: "article",
  ini: "settings",
  cfg: "settings",
  conf: "settings",
  env: "lock",
  gitignore: "block",
  gitattributes: "integration_instructions",
  lock: "lock_clock"
};

export function materialFolderIconOpen(expanded: boolean): string {
  return expanded ? "folder_open" : "folder";
}

export function materialFileIcon(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower === "dockerfile" || lower.startsWith("dockerfile.")) return "docker";
  if (lower === "makefile") return "build";
  if (lower === "cmakelists.txt") return "build";

  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot + 1) : "";
  if (ext && BY_EXT[ext]) return BY_EXT[ext];

  if (lower.startsWith(".env")) return "lock";
  return "description";
}
