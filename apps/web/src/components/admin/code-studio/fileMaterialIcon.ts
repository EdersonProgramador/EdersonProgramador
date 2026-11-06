/**
 * Ícones Material Icons Round (ligaduras) + chave de cor estilo "Material Icon Theme".
 * Não é o pacote VS Code — só aproxima ícone/cor por tipo de pasta/arquivo.
 */

export type MaterialIconSlot = {
  icon: string;
  /** Cor via data-mi-key em dev-code-studio.css */
  key: string;
};

const FOLDER_DEFAULT: MaterialIconSlot = { icon: "folder", key: "folder-default" };
const FOLDER_OPEN_DEFAULT: MaterialIconSlot = { icon: "folder_open", key: "folder-default" };

/** Nome da pasta (segmento), em minúsculas. */
const FOLDER_BY_NAME: Record<string, Omit<MaterialIconSlot, "icon"> & { openIcon: string; closedIcon: string }> = {
  src: { closedIcon: "folder", openIcon: "folder_open", key: "folder-src" },
  source: { closedIcon: "folder", openIcon: "folder_open", key: "folder-src" },
  components: { closedIcon: "folder", openIcon: "folder_open", key: "folder-components" },
  component: { closedIcon: "folder", openIcon: "folder_open", key: "folder-components" },
  ui: { closedIcon: "folder", openIcon: "folder_open", key: "folder-components" },
  hooks: { closedIcon: "folder", openIcon: "folder_open", key: "folder-hooks" },
  utils: { closedIcon: "folder", openIcon: "folder_open", key: "folder-utils" },
  util: { closedIcon: "folder", openIcon: "folder_open", key: "folder-utils" },
  lib: { closedIcon: "folder", openIcon: "folder_open", key: "folder-utils" },
  library: { closedIcon: "folder", openIcon: "folder_open", key: "folder-utils" },
  helpers: { closedIcon: "folder", openIcon: "folder_open", key: "folder-utils" },
  assets: { closedIcon: "folder", openIcon: "folder_open", key: "folder-assets" },
  images: { closedIcon: "folder", openIcon: "folder_open", key: "folder-assets" },
  image: { closedIcon: "folder", openIcon: "folder_open", key: "folder-assets" },
  img: { closedIcon: "folder", openIcon: "folder_open", key: "folder-assets" },
  public: { closedIcon: "folder", openIcon: "folder_open", key: "folder-assets" },
  static: { closedIcon: "folder", openIcon: "folder_open", key: "folder-assets" },
  media: { closedIcon: "folder", openIcon: "folder_open", key: "folder-assets" },
  icons: { closedIcon: "folder", openIcon: "folder_open", key: "folder-assets" },
  styles: { closedIcon: "folder", openIcon: "folder_open", key: "folder-styles" },
  style: { closedIcon: "folder", openIcon: "folder_open", key: "folder-styles" },
  themes: { closedIcon: "folder", openIcon: "folder_open", key: "folder-styles" },
  css: { closedIcon: "folder", openIcon: "folder_open", key: "folder-styles" },
  scss: { closedIcon: "folder", openIcon: "folder_open", key: "folder-styles" },
  sass: { closedIcon: "folder", openIcon: "folder_open", key: "folder-styles" },
  pages: { closedIcon: "folder", openIcon: "folder_open", key: "folder-pages" },
  app: { closedIcon: "folder", openIcon: "folder_open", key: "folder-pages" },
  routes: { closedIcon: "folder", openIcon: "folder_open", key: "folder-pages" },
  views: { closedIcon: "folder", openIcon: "folder_open", key: "folder-pages" },
  layouts: { closedIcon: "folder", openIcon: "folder_open", key: "folder-pages" },
  api: { closedIcon: "folder", openIcon: "folder_open", key: "folder-api" },
  server: { closedIcon: "folder", openIcon: "folder_open", key: "folder-api" },
  backend: { closedIcon: "folder", openIcon: "folder_open", key: "folder-api" },
  services: { closedIcon: "folder", openIcon: "folder_open", key: "folder-api" },
  test: { closedIcon: "folder", openIcon: "folder_open", key: "folder-test" },
  tests: { closedIcon: "folder", openIcon: "folder_open", key: "folder-test" },
  e2e: { closedIcon: "folder", openIcon: "folder_open", key: "folder-test" },
  spec: { closedIcon: "folder", openIcon: "folder_open", key: "folder-test" },
  __tests__: { closedIcon: "folder", openIcon: "folder_open", key: "folder-test" },
  docs: { closedIcon: "folder", openIcon: "folder_open", key: "folder-docs" },
  doc: { closedIcon: "folder", openIcon: "folder_open", key: "folder-docs" },
  documentation: { closedIcon: "folder", openIcon: "folder_open", key: "folder-docs" },
  config: { closedIcon: "folder", openIcon: "folder_open", key: "folder-config" },
  configuration: { closedIcon: "folder", openIcon: "folder_open", key: "folder-config" },
  ".github": { closedIcon: "folder", openIcon: "folder_open", key: "folder-github" },
  github: { closedIcon: "folder", openIcon: "folder_open", key: "folder-github" },
  ".vscode": { closedIcon: "folder", openIcon: "folder_open", key: "folder-vscode" },
  vscode: { closedIcon: "folder", openIcon: "folder_open", key: "folder-vscode" },
  ".cursor": { closedIcon: "folder", openIcon: "folder_open", key: "folder-vscode" },
  node_modules: { closedIcon: "folder", openIcon: "folder_open", key: "folder-node" },
  dist: { closedIcon: "folder", openIcon: "folder_open", key: "folder-dist" },
  build: { closedIcon: "folder", openIcon: "folder_open", key: "folder-dist" },
  out: { closedIcon: "folder", openIcon: "folder_open", key: "folder-dist" },
  output: { closedIcon: "folder", openIcon: "folder_open", key: "folder-dist" },
  coverage: { closedIcon: "folder", openIcon: "folder_open", key: "folder-dist" },
  prisma: { closedIcon: "folder", openIcon: "folder_open", key: "folder-db" },
  database: { closedIcon: "folder", openIcon: "folder_open", key: "folder-db" },
  db: { closedIcon: "folder", openIcon: "folder_open", key: "folder-db" },
  scripts: { closedIcon: "folder", openIcon: "folder_open", key: "folder-scripts" },
  bin: { closedIcon: "folder", openIcon: "folder_open", key: "folder-scripts" },
  locales: { closedIcon: "folder", openIcon: "folder_open", key: "folder-i18n" },
  i18n: { closedIcon: "folder", openIcon: "folder_open", key: "folder-i18n" },
  lang: { closedIcon: "folder", openIcon: "folder_open", key: "folder-i18n" },
  messages: { closedIcon: "folder", openIcon: "folder_open", key: "folder-i18n" },
  packages: { closedIcon: "folder", openIcon: "folder_open", key: "folder-packages" },
  pkg: { closedIcon: "folder", openIcon: "folder_open", key: "folder-packages" },
  shared: { closedIcon: "folder", openIcon: "folder_open", key: "folder-shared" },
  common: { closedIcon: "folder", openIcon: "folder_open", key: "folder-shared" },
  types: { closedIcon: "folder", openIcon: "folder_open", key: "folder-types" },
  typings: { closedIcon: "folder", openIcon: "folder_open", key: "folder-types" },
  workspace: { closedIcon: "folder", openIcon: "folder_open", key: "folder-workspace" },
  workspaces: { closedIcon: "folder", openIcon: "folder_open", key: "folder-workspace" },
  ".git": { closedIcon: "folder", openIcon: "folder_open", key: "folder-git" }
};

/** Extensão → ícone + paleta (inspirado em Material Icon Theme). */
const BY_EXT: Record<string, MaterialIconSlot> = {
  ts: { icon: "integration_instructions", key: "ext-ts" },
  tsx: { icon: "widgets", key: "ext-tsx" },
  js: { icon: "javascript", key: "ext-js" },
  jsx: { icon: "widgets", key: "ext-jsx" },
  mjs: { icon: "javascript", key: "ext-js" },
  cjs: { icon: "javascript", key: "ext-js" },
  json: { icon: "data_object", key: "ext-json" },
  jsonc: { icon: "data_object", key: "ext-jsonc" },
  html: { icon: "html", key: "ext-html" },
  htm: { icon: "html", key: "ext-html" },
  vue: { icon: "view_quilt", key: "ext-vue" },
  svelte: { icon: "layers", key: "ext-svelte" },
  css: { icon: "palette", key: "ext-css" },
  scss: { icon: "palette", key: "ext-scss" },
  sass: { icon: "palette", key: "ext-sass" },
  less: { icon: "palette", key: "ext-less" },
  styl: { icon: "palette", key: "ext-css" },
  md: { icon: "article", key: "ext-md" },
  mdx: { icon: "article", key: "ext-mdx" },
  yml: { icon: "settings", key: "ext-yaml" },
  yaml: { icon: "settings", key: "ext-yaml" },
  toml: { icon: "tune", key: "ext-toml" },
  xml: { icon: "code", key: "ext-xml" },
  svg: { icon: "image", key: "ext-svg" },
  png: { icon: "image", key: "ext-image" },
  jpg: { icon: "image", key: "ext-image" },
  jpeg: { icon: "image", key: "ext-image" },
  gif: { icon: "image", key: "ext-image" },
  webp: { icon: "image", key: "ext-image" },
  ico: { icon: "image", key: "ext-image" },
  avif: { icon: "image", key: "ext-image" },
  bmp: { icon: "image", key: "ext-image" },
  wgsl: { icon: "memory", key: "ext-wgsl" },
  glsl: { icon: "memory", key: "ext-glsl" },
  vert: { icon: "memory", key: "ext-glsl" },
  frag: { icon: "memory", key: "ext-glsl" },
  sql: { icon: "storage", key: "ext-sql" },
  prisma: { icon: "storage", key: "ext-prisma" },
  py: { icon: "code", key: "ext-python" },
  pyw: { icon: "code", key: "ext-python" },
  rb: { icon: "diamond", key: "ext-ruby" },
  rs: { icon: "construction", key: "ext-rust" },
  go: { icon: "bolt", key: "ext-go" },
  php: { icon: "php", key: "ext-php" },
  swift: { icon: "bolt", key: "ext-swift" },
  kt: { icon: "android", key: "ext-kotlin" },
  kts: { icon: "android", key: "ext-kotlin" },
  java: { icon: "coffee", key: "ext-java" },
  scala: { icon: "grid_view", key: "ext-scala" },
  dart: { icon: "flutter_dash", key: "ext-dart" },
  lua: { icon: "sports_esports", key: "ext-lua" },
  sh: { icon: "terminal", key: "ext-shell" },
  bash: { icon: "terminal", key: "ext-shell" },
  zsh: { icon: "terminal", key: "ext-shell" },
  fish: { icon: "terminal", key: "ext-shell" },
  ps1: { icon: "terminal", key: "ext-shell" },
  bat: { icon: "terminal", key: "ext-shell" },
  cmd: { icon: "terminal", key: "ext-shell" },
  dockerfile: { icon: "docker", key: "ext-docker" },
  tf: { icon: "cloud", key: "ext-tf" },
  hcl: { icon: "cloud", key: "ext-tf" },
  cpp: { icon: "code", key: "ext-cpp" },
  cxx: { icon: "code", key: "ext-cpp" },
  cc: { icon: "code", key: "ext-cpp" },
  hpp: { icon: "code", key: "ext-cpp" },
  h: { icon: "code", key: "ext-h" },
  c: { icon: "code", key: "ext-c" },
  cs: { icon: "code", key: "ext-csharp" },
  fs: { icon: "code", key: "ext-fsharp" },
  fsx: { icon: "code", key: "ext-fsharp" },
  vb: { icon: "code", key: "ext-vb" },
  fsproj: { icon: "code", key: "ext-xml" },
  csproj: { icon: "code", key: "ext-xml" },
  pl: { icon: "data_object", key: "ext-perl" },
  pm: { icon: "data_object", key: "ext-perl" },
  r: { icon: "analytics", key: "ext-r" },
  ex: { icon: "science", key: "ext-elixir" },
  exs: { icon: "science", key: "ext-elixir" },
  erl: { icon: "hub", key: "ext-erlang" },
  hs: { icon: "functions", key: "ext-haskell" },
  clj: { icon: "forest", key: "ext-clojure" },
  cljs: { icon: "forest", key: "ext-clojure" },
  edn: { icon: "forest", key: "ext-clojure" },
  gql: { icon: "hub", key: "ext-graphql" },
  graphql: { icon: "hub", key: "ext-graphql" },
  proto: { icon: "schema", key: "ext-proto" },
  tex: { icon: "functions", key: "ext-tex" },
  rst: { icon: "article", key: "ext-rst" },
  ini: { icon: "settings", key: "ext-settings" },
  cfg: { icon: "settings", key: "ext-settings" },
  conf: { icon: "settings", key: "ext-settings" },
  env: { icon: "lock", key: "ext-env" },
  gitignore: { icon: "block", key: "ext-git" },
  gitattributes: { icon: "integration_instructions", key: "ext-git" },
  lock: { icon: "lock_clock", key: "ext-lock" },
  log: { icon: "description", key: "ext-log" },
  lockb: { icon: "lock_clock", key: "ext-lock" },
  wasm: { icon: "memory", key: "ext-wasm" },
  woff2: { icon: "text_fields", key: "ext-font" },
  woff: { icon: "text_fields", key: "ext-font" },
  ttf: { icon: "text_fields", key: "ext-font" },
  otf: { icon: "text_fields", key: "ext-font" },
  eot: { icon: "text_fields", key: "ext-font" },
  pdf: { icon: "picture_as_pdf", key: "ext-pdf" },
  zip: { icon: "folder_zip", key: "ext-zip" },
  tar: { icon: "folder_zip", key: "ext-zip" },
  gz: { icon: "folder_zip", key: "ext-zip" },
  mp4: { icon: "movie", key: "ext-video" },
  webm: { icon: "movie", key: "ext-video" },
  mov: { icon: "movie", key: "ext-video" },
  mp3: { icon: "audio_file", key: "ext-audio" },
  wav: { icon: "audio_file", key: "ext-audio" },
  ogg: { icon: "audio_file", key: "ext-audio" }
};

/** Arquivo especial pelo nome completo (minúsculas). */
const BY_FULL_NAME: Record<string, MaterialIconSlot> = {
  "dockerfile": { icon: "docker", key: "ext-docker" },
  "makefile": { icon: "build", key: "ext-make" },
  "cmakelists.txt": { icon: "build", key: "ext-cmake" },
  "package.json": { icon: "package", key: "file-package-json" },
  "package-lock.json": { icon: "lock", key: "file-package-lock" },
  "pnpm-lock.yaml": { icon: "lock", key: "file-pnpm-lock" },
  "yarn.lock": { icon: "lock", key: "file-yarn-lock" },
  "bun.lockb": { icon: "lock", key: "file-bun-lock" },
  "tsconfig.json": { icon: "settings", key: "file-tsconfig" },
  "jsconfig.json": { icon: "settings", key: "file-jsconfig" },
  "vite.config.ts": { icon: "rocket_launch", key: "file-vite" },
  "vite.config.js": { icon: "rocket_launch", key: "file-vite" },
  "vite.config.mjs": { icon: "rocket_launch", key: "file-vite" },
  "tailwind.config.ts": { icon: "palette", key: "file-tailwind" },
  "tailwind.config.js": { icon: "palette", key: "file-tailwind" },
  "postcss.config.js": { icon: "palette", key: "file-postcss" },
  "postcss.config.cjs": { icon: "palette", key: "file-postcss" },
  "postcss.config.mjs": { icon: "palette", key: "file-postcss" },
  "next.config.js": { icon: "web", key: "file-next" },
  "next.config.mjs": { icon: "web", key: "file-next" },
  "next.config.ts": { icon: "web", key: "file-next" },
  "vercel.json": { icon: "cloud", key: "file-vercel" },
  "netlify.toml": { icon: "cloud", key: "file-netlify" },
  "docker-compose.yml": { icon: "docker", key: "ext-docker" },
  "docker-compose.yaml": { icon: "docker", key: "ext-docker" },
  ".env": { icon: "lock", key: "ext-env" },
  ".env.local": { icon: "lock", key: "ext-env" },
  ".env.development": { icon: "lock", key: "ext-env" },
  ".env.production": { icon: "lock", key: "ext-env" },
  "readme.md": { icon: "menu_book", key: "ext-readme" },
  "license": { icon: "gavel", key: "file-license" },
  "license.md": { icon: "gavel", key: "file-license" }
};

function normalizeFullFileKey(name: string): string {
  return name.trim().toLowerCase().replace(/\\/g, "/");
}

/**
 * Ícone + cor para pasta (nome do nó no explorador).
 */
export function materialFolderSlot(folderName: string, expanded: boolean): MaterialIconSlot {
  const seg = folderName.trim().toLowerCase();
  const mapped = FOLDER_BY_NAME[seg];
  if (mapped) {
    return {
      icon: expanded ? mapped.openIcon : mapped.closedIcon,
      key: mapped.key
    };
  }
  return expanded ? FOLDER_OPEN_DEFAULT : FOLDER_DEFAULT;
}

/**
 * Ícone + cor para arquivo.
 */
export function materialFileSlot(fileName: string): MaterialIconSlot {
  const lower = normalizeFullFileKey(fileBaseOnly(fileName));

  if (lower === "dockerfile" || lower.startsWith("dockerfile.")) {
    return { icon: "docker", key: "ext-docker" };
  }
  const exact = BY_FULL_NAME[lower];
  if (exact) return { ...exact };

  if (lower.startsWith(".env")) {
    return { icon: "lock", key: "ext-env" };
  }
  if (lower === "makefile") {
    return { icon: "build", key: "ext-make" };
  }
  if (lower === "cmakelists.txt") {
    return { icon: "build", key: "ext-cmake" };
  }

  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot + 1) : "";
  if (ext && BY_EXT[ext]) {
    return { ...BY_EXT[ext] };
  }

  return { icon: "insert_drive_file", key: "file-default" };
}

function fileBaseOnly(pathOrName: string): string {
  const n = pathOrName.replace(/\\/g, "/");
  const i = n.lastIndexOf("/");
  return i >= 0 ? n.slice(i + 1) : n;
}
