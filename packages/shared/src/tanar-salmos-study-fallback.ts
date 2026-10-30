import {
  TANAR_KETUVIM_EXTRA_EXPECTED,
  TANAR_KETUVIM_TRACK,
  TANAR_NEVIIM_TRACK,
  TANAR_PROFETAS_EXPECTED_LESSONS,
  type TanarBibleTrackLesson
} from "./tanar-bible-outline.js";
import {
  enrichTanarBibleLessonNotes,
  tanarMishleChapterLessonHtml,
  tanarTehillimDayLessonHtml,
  tanarTrackBookLessonHtml
} from "./tanar-lesson-prose.js";
import { TANAR_COURSE } from "./courses-copy.js";

const SALMOS_SECTION = "Salmos";
const PROVERBIOS_SECTION = "Provérbios";

export const TANAR_SALMOS_CATALOG_LESSONS = 30;
export const TANAR_MISHLE_CATALOG_LESSONS = 31;

const TEHILLIM_DAY_TITLES = [
  "Day 1 — capítulos 1–9",
  "Day 2 — capítulos 10–17",
  "Day 3 — capítulos 18–22",
  "Day 4 — capítulos 23–28",
  "Day 5 — capítulos 29–34",
  "Day 6 — capítulos 35–38",
  "Day 7 — capítulos 39–43",
  "Day 8 — capítulos 44–48",
  "Day 9 — capítulos 49–54",
  "Day 10 — capítulos 55–59",
  "Day 11 — capítulos 60–65",
  "Day 12 — capítulos 66–68",
  "Day 13 — capítulos 69–71",
  "Day 14 — capítulos 72–76",
  "Day 15 — capítulos 77–78",
  "Day 16 — capítulos 79–82",
  "Day 17 — capítulos 83–87",
  "Day 18 — capítulos 88–89",
  "Day 19 — capítulos 90–96",
  "Day 20 — capítulos 97–103",
  "Day 21 — capítulos 104–105",
  "Day 22 — capítulos 106–107",
  "Day 23 — capítulos 108–112",
  "Day 24 — capítulos 113–118",
  "Day 25 — capítulo 119, versos 1–96",
  "Day 26 — capítulo 119, versos 97–176",
  "Day 27 — capítulos 120–134",
  "Day 28 — capítulos 135–139",
  "Day 29 — capítulos 140–144",
  "Day 30 — capítulos 145–150"
] as const;

export type TanarStudyCurriculumItem = {
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
  breadcrumb: string[];
  prev: string | null;
  next: string | null;
};

type StudyPayload = {
  course: { slug: string; coverUrl?: string | null; title?: string; summary?: string | null };
  curriculum: {
    items: TanarStudyCurriculumItem[];
    modules?: { module: number; title: string }[];
    totalLessons?: number;
  };
  lessonNotes: Record<string, { html?: string; displayTitle?: string }>;
  progress?: { completed: number; total: number; percent: number; isComplete: boolean };
};

function normSection(title: string | undefined) {
  return title?.trim().toLowerCase() ?? "";
}

function isSalmosSection(title: string | undefined) {
  return normSection(title) === "salmos";
}

function isProverbiosSection(title: string | undefined) {
  const n = normSection(title);
  return n === "provérbios" || n.startsWith("provérbios");
}

function tehillimNoteHtml(day: number, title: string) {
  return tanarTehillimDayLessonHtml(day, title);
}

function mishleNoteHtml(n: number) {
  return tanarMishleChapterLessonHtml(n);
}

function trackNoteHtml(spec: TanarBibleTrackLesson) {
  return tanarTrackBookLessonHtml(spec);
}

function linkPrevNext(items: TanarStudyCurriculumItem[]) {
  for (let i = 0; i < items.length; i++) {
    items[i].prev = i > 0 ? items[i - 1].slug : null;
    items[i].next = i < items.length - 1 ? items[i + 1].slug : null;
    items[i].order = i;
  }
}

function rebuildProgress<T extends StudyPayload>(payload: T, merged: TanarStudyCurriculumItem[]): T {
  const completed = payload.progress?.completed ?? 0;
  const total = merged.length;
  const progress = payload.progress
    ? {
        ...payload.progress,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        isComplete: total > 0 && completed >= total
      }
    : payload.progress;
  return {
    ...payload,
    curriculum: { ...payload.curriculum, items: merged, totalLessons: total },
    progress
  } as T;
}

function patchEscritosSection<T extends StudyPayload>(
  payload: T,
  matchSection: (title: string | undefined) => boolean,
  expectedCount: number,
  buildBlock: (
    moduleNum: number,
    moduleTitle: string,
    sectionNum: number,
    sectionTitle: string
  ) => { items: TanarStudyCurriculumItem[]; notes: Record<string, { html?: string; displayTitle?: string }> }
): T {
  const items = payload.curriculum.items;
  const sectionItems = items.filter((i) => matchSection(i.sectionTitle));
  if (sectionItems.length >= expectedCount) return payload;

  const anchor =
    sectionItems[0] ?? items.find((i) => i.moduleTitle?.toLowerCase().includes("escritos"));
  if (!anchor?.module) return payload;

  const moduleNum = anchor.module;
  const moduleTitle = anchor.moduleTitle ?? "Escritos";
  const sectionNum = anchor.section ?? 1;
  const sectionTitle = matchSection(anchor.sectionTitle)
    ? anchor.sectionTitle?.trim() || PROVERBIOS_SECTION
    : PROVERBIOS_SECTION;

  const insertAt = sectionItems.length
    ? Math.min(...sectionItems.map((i) => i.order))
    : items.findIndex((i) => i.module === moduleNum && !matchSection(i.sectionTitle));
  if (insertAt < 0) return payload;

  const { items: newBlock, notes } = buildBlock(
    moduleNum,
    moduleTitle,
    sectionNum,
    matchSection(sectionTitle) ? sectionTitle : PROVERBIOS_SECTION
  );

  const without = items.filter((i) => !matchSection(i.sectionTitle));
  const merged = [
    ...without.filter((i) => i.order < insertAt),
    ...newBlock,
    ...without.filter((i) => i.order >= insertAt)
  ];
  linkPrevNext(merged);

  const lessonNotes = { ...payload.lessonNotes, ...notes };
  for (const leg of sectionItems) delete lessonNotes[leg.slug];

  const next = rebuildProgress(payload, merged);
  return { ...next, lessonNotes };
}

function buildSalmosBlock(
  moduleNum: number,
  moduleTitle: string,
  sectionNum: number,
  sectionTitle: string
) {
  const items = TEHILLIM_DAY_TITLES.map((title, index) => {
    const day = index + 1;
    const slug = `tehillim-day-${String(day).padStart(2, "0")}`;
    return {
      order: 0,
      type: "document" as const,
      id: slug.toUpperCase(),
      slug,
      title,
      module: moduleNum,
      moduleTitle,
      section: sectionNum,
      sectionTitle: SALMOS_SECTION,
      indexInSection: day,
      countInSection: TANAR_SALMOS_CATALOG_LESSONS,
      breadcrumb: [moduleTitle, SALMOS_SECTION, title],
      prev: null,
      next: null
    };
  });
  const notes: Record<string, { html?: string; displayTitle?: string }> = {};
  for (let i = 0; i < TEHILLIM_DAY_TITLES.length; i++) {
    const day = i + 1;
    const title = TEHILLIM_DAY_TITLES[i];
    const slug = `tehillim-day-${String(day).padStart(2, "0")}`;
    notes[slug] = { html: tehillimNoteHtml(day, title), displayTitle: title };
  }
  return { items, notes };
}

function buildMishleBlock(
  moduleNum: number,
  moduleTitle: string,
  sectionNum: number,
  sectionTitle: string
) {
  const items: TanarStudyCurriculumItem[] = [];
  const notes: Record<string, { html?: string; displayTitle?: string }> = {};
  for (let n = 1; n <= TANAR_MISHLE_CATALOG_LESSONS; n++) {
    const slug = `mishle-${n}`;
    const title = `Mishlé ${n}`;
    items.push({
      order: 0,
      type: "document",
      id: slug.toUpperCase(),
      slug,
      title,
      module: moduleNum,
      moduleTitle,
      section: sectionNum,
      sectionTitle: PROVERBIOS_SECTION,
      indexInSection: n,
      countInSection: TANAR_MISHLE_CATALOG_LESSONS,
      breadcrumb: [moduleTitle, PROVERBIOS_SECTION, title],
      prev: null,
      next: null
    });
    notes[slug] = { html: mishleNoteHtml(n), displayTitle: title };
  }
  return { items, notes };
}

function isProfetasModule(title: string | undefined) {
  return title?.toLowerCase().includes("profetas") ?? false;
}

function buildBibleTrackBlock(
  track: TanarBibleTrackLesson[],
  moduleNum: number,
  moduleTitle: string
) {
  const items: TanarStudyCurriculumItem[] = track.map((spec, index) => ({
    order: 0,
    type: "document" as const,
    id: spec.slug.toUpperCase(),
    slug: spec.slug,
    title: spec.title,
    module: moduleNum,
    moduleTitle,
    section: spec.sectionSortOrder,
    sectionTitle: spec.sectionTitle,
    indexInSection: index + 1,
    countInSection: track.length,
    breadcrumb: [moduleTitle, spec.sectionTitle, spec.title],
    prev: null,
    next: null
  }));
  const notes: Record<string, { html?: string; displayTitle?: string }> = {};
  for (const spec of track) {
    notes[spec.slug] = { html: trackNoteHtml(spec), displayTitle: spec.title };
  }
  return { items, notes };
}

function patchModuleTrack<T extends StudyPayload>(
  payload: T,
  matchModule: (moduleTitle: string | undefined) => boolean,
  expectedCount: number,
  track: TanarBibleTrackLesson[],
  replaceSlugs: (slug: string) => boolean
): T {
  const items = payload.curriculum.items;
  const moduleItems = items.filter((i) => matchModule(i.moduleTitle));
  if (moduleItems.length >= expectedCount) return payload;

  const anchor = moduleItems[0] ?? items.find((i) => matchModule(i.moduleTitle));
  if (!anchor?.module) return payload;

  const moduleNum = anchor.module;
  const moduleTitle = anchor.moduleTitle ?? "Profetas";
  const insertAt = moduleItems.length
    ? Math.min(...moduleItems.map((i) => i.order))
    : items.findIndex((i) => i.module === moduleNum);

  if (insertAt < 0) return payload;

  const { items: newBlock, notes } = buildBibleTrackBlock(track, moduleNum, moduleTitle);
  const without = items.filter((i) => !(i.module === moduleNum && matchModule(i.moduleTitle)));
  const merged = [
    ...without.filter((i) => i.order < insertAt),
    ...newBlock,
    ...without.filter((i) => i.order >= insertAt)
  ];
  linkPrevNext(merged);

  const lessonNotes = { ...payload.lessonNotes, ...notes };
  for (const leg of moduleItems) {
    if (replaceSlugs(leg.slug)) delete lessonNotes[leg.slug];
  }

  const next = rebuildProgress(payload, merged);
  return { ...next, lessonNotes };
}

function patchKetuvimEscritos<T extends StudyPayload>(payload: T): T {
  const items = payload.curriculum.items;
  const ketuvimCount = items.filter((i) => i.slug.startsWith("ketuvim-")).length;
  if (ketuvimCount >= TANAR_KETUVIM_EXTRA_EXPECTED) return payload;

  const anchor = items.find((i) => i.moduleTitle?.toLowerCase().includes("escritos"));
  if (!anchor?.module) return payload;

  const moduleNum = anchor.module;
  const moduleTitle = anchor.moduleTitle ?? "Escritos";
  const insertAt = items.reduce((max, i, idx) => (i.module === moduleNum ? idx : max), -1);
  if (insertAt < 0) return payload;

  const { items: newBlock, notes } = buildBibleTrackBlock(TANAR_KETUVIM_TRACK, moduleNum, moduleTitle);
  const withoutKetuvim = items.filter((i) => !i.slug.startsWith("ketuvim-"));
  const merged = [...withoutKetuvim, ...newBlock];
  linkPrevNext(merged);

  const lessonNotes = { ...payload.lessonNotes, ...notes };
  const next = rebuildProgress(payload, merged);
  return { ...next, lessonNotes };
}

/** Expande trilha Tanar (Salmos, Profetas, Ketuvim, links da Bíblia) quando a API está desatualizada. */
export function applyTanarStudyFallback<T extends StudyPayload>(payload: T): T {
  if (payload.course.slug !== TANAR_COURSE.slug) return payload;
  let p = patchEscritosSection(payload, isSalmosSection, TANAR_SALMOS_CATALOG_LESSONS, buildSalmosBlock);
  p = patchEscritosSection(p, isProverbiosSection, TANAR_MISHLE_CATALOG_LESSONS, buildMishleBlock);
  p = patchKetuvimEscritos(p);
  p = patchModuleTrack(
    p,
    isProfetasModule,
    TANAR_PROFETAS_EXPECTED_LESSONS,
    TANAR_NEVIIM_TRACK,
    (slug) => slug.startsWith("neviim-") || slug === "neviim-em-breve"
  );
  if (TANAR_COURSE.coverUrl) {
    p = { ...p, course: { ...p.course, coverUrl: TANAR_COURSE.coverUrl } };
  }
  return {
    ...p,
    lessonNotes: enrichTanarBibleLessonNotes(p.lessonNotes, p.curriculum.items)
  };
}

/** @deprecated Use applyTanarStudyFallback */
export function applyTanarSalmosStudyFallback<T extends StudyPayload>(payload: T): T {
  return applyTanarStudyFallback(payload);
}
