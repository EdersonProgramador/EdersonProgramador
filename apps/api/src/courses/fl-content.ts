import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

function dataDir() {
  const candidates = [
    resolve(moduleDir, "../../../../packages/courses-fl/data"),
    resolve(process.cwd(), "packages/courses-fl/data"),
    resolve(process.cwd(), "../../packages/courses-fl/data")
  ];
  for (const dir of candidates) {
    if (existsSync(resolve(dir, "curriculum.json"))) return dir;
  }
  throw new Error("Pacote courses-fl/data não encontrado (curriculum.json).");
}

function readJson<T>(name: string): T {
  const raw = readFileSync(resolve(dataDir(), name), "utf8");
  return JSON.parse(raw) as T;
}

export type FlCurriculum = {
  version: number;
  courseTitle: string;
  mediaBase: string;
  documentBase: string;
  videoExtensions: string[];
  totalLessons: number;
  modules: { module: number; title: string }[];
  items: FlCurriculumItem[];
};

export type FlCurriculumItem = {
  order: number;
  type: "document" | "video";
  id: string;
  slug: string;
  title: string;
  module?: number | null;
  moduleTitle?: string;
  section?: number;
  sectionTitle?: string;
  indexInSection?: number;
  countInSection?: number;
  fileNum?: number;
  breadcrumb: string[];
  prev: string | null;
  next: string | null;
};

export type FlLessonNote = {
  html?: string;
  displayTitle?: string;
  attachments?: { name: string; url: string }[];
};

export type FlBonusItem = {
  slug: string;
  title: string;
  html?: string;
  attachments?: { name: string; url: string }[];
};

export type FlVideoManifest = {
  total: number;
  present: number;
  files: Record<string, string>;
};

export type FlTelegramConfig = {
  enabled: boolean;
  baseUrl: string;
  startMessageId: number;
  sumarioMessageId?: number;
  overrides?: Record<string, number>;
};

function readJsonOptional<T>(name: string, fallback: T): T {
  const path = resolve(dataDir(), name);
  if (!existsSync(path)) return fallback;
  return readJson<T>(name);
}

let cache: {
  curriculum: FlCurriculum;
  lessonNotes: Record<string, FlLessonNote>;
  bonusContent: FlBonusItem[];
  videoManifest: FlVideoManifest;
  telegram: FlTelegramConfig;
  telegramMessageMap: Record<string, number>;
} | null = null;

export function loadFlBundle() {
  if (cache) return cache;
  cache = {
    curriculum: readJson("curriculum.json"),
    lessonNotes: readJson("lesson-notes.json"),
    bonusContent: readJson("bonus-content.json"),
    videoManifest: readJson("video-manifest.json"),
    telegram: readJsonOptional("telegram-config.json", {
      enabled: true,
      baseUrl: "https://t.me/c/2196552504",
      startMessageId: 355,
      sumarioMessageId: 355,
      overrides: {}
    }),
    telegramMessageMap: readJsonOptional("telegram-message-map.json", {})
  };
  return cache;
}
