/** Sumário da Bíblia Hebraica (Gorodovits) — páginas extraídas dos bookmarks do PDF. */

export const TANAR_BIBLIA_BOOK_SLUG = "biblia-hebraica-gorodovits";

export type TanarBibleOutlineEntry = {
  title: string;
  page: number;
  depth: number;
};

export const TANAR_BIBLIA_OUTLINE: TanarBibleOutlineEntry[] = [
  { depth: 0, title: "Rosto", page: 3 },
  { depth: 0, title: "Créditos", page: 4 },
  { depth: 0, title: "Prefácio", page: 6 },
  { depth: 0, title: "Considerações Gerais", page: 8 },
  { depth: 0, title: "Bibliografia", page: 11 },
  { depth: 0, title: "Torá", page: 14 },
  { depth: 1, title: "Gênesis - Bereshit", page: 15 },
  { depth: 1, title: "Êxodo - Shemot", page: 74 },
  { depth: 1, title: "Levítico - Vaicrá", page: 127 },
  { depth: 1, title: "Números - Bamidbar", page: 166 },
  { depth: 1, title: "Deuteronômio - Devarim", page: 220 },
  { depth: 0, title: "Profetas", page: 269 },
  { depth: 1, title: "Josué - Iehoshúa", page: 270 },
  { depth: 1, title: "Juízes - Shofetim", page: 301 },
  { depth: 1, title: "Samuel - Shemuel", page: 333 },
  { depth: 1, title: "Reis - Melahim", page: 412 },
  { depth: 1, title: "Isaías - Ieshaiáhu", page: 488 },
  { depth: 1, title: "Jeremias - Irmiáhu", page: 556 },
  { depth: 1, title: "Ezequiel - Iehezkel", page: 632 },
  { depth: 1, title: "Os Doze", page: 697 },
  { depth: 2, title: "Oseias - Hoshêa", page: 698 },
  { depth: 2, title: "Joel - Ioêl", page: 708 },
  { depth: 2, title: "Amós - Amós", page: 712 },
  { depth: 2, title: "Obadias - Ovadiá", page: 720 },
  { depth: 2, title: "Jonas - Ioná", page: 722 },
  { depth: 2, title: "Mihá [Miqueias] - Mihá", page: 725 },
  { depth: 2, title: "Nahum - Nahum", page: 731 },
  { depth: 2, title: "Habacuc - Havacuc", page: 734 },
  { depth: 2, title: "Tsefaniá [Sofonias] - Tsefaniá", page: 738 },
  { depth: 2, title: "Hagai [Ageu] - Hagai", page: 742 },
  { depth: 2, title: "Zacarias - Zehariá", page: 745 },
  { depth: 2, title: "Malaquias - Malahi", page: 757 },
  { depth: 0, title: "Escritos", page: 761 },
  { depth: 1, title: "Salmos", page: 762 },
  { depth: 1, title: "Provérbios - Mishlê", page: 840 },
  { depth: 1, title: "Jó - Ióv", page: 868 },
  { depth: 1, title: "Cântico dos Cânticos - Shir Hashirim", page: 902 },
  { depth: 1, title: "Rute - Rut", page: 908 },
  { depth: 1, title: "Lamentações - Echá", page: 912 },
  { depth: 1, title: "Eclesiastes - Cohélet", page: 922 },
  { depth: 1, title: "Ester - Ester", page: 932 },
  { depth: 1, title: "Daniel - Daniel", page: 942 },
  { depth: 1, title: "Ezrá – Nehemiá", page: 962 },
  { depth: 1, title: "Crônicas - Divrê Haiamim", page: 1000 }
];

/** Normaliza título do PDF para bater com sectionTitle do catálogo. */
export function normalizeTanarBibleSectionKey(title: string): string {
  return title
    .trim()
    .replace(/\s*-\s*/g, " — ")
    .replace(/Vayikra/i, "Vayikra")
    .replace(/Vaicrá/i, "Vayikra")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

const SECTION_PAGE_MAP: Record<string, number> = (() => {
  const map: Record<string, number> = {};
  for (const e of TANAR_BIBLIA_OUTLINE) {
    if (e.depth === 0) continue;
    map[normalizeTanarBibleSectionKey(e.title)] = e.page;
  }
  map[normalizeTanarBibleSectionKey("Gênesis — Bereshit")] = 15;
  map[normalizeTanarBibleSectionKey("Levítico — Vayikra")] = 127;
  map[normalizeTanarBibleSectionKey("Provérbios")] = 840;
  map[normalizeTanarBibleSectionKey("Salmos")] = 762;
  return map;
})();

export function tanarBiblePageForSection(sectionTitle: string | undefined): number | null {
  if (!sectionTitle?.trim()) return null;
  const key = normalizeTanarBibleSectionKey(sectionTitle);
  if (SECTION_PAGE_MAP[key] != null) return SECTION_PAGE_MAP[key];
  for (const [k, page] of Object.entries(SECTION_PAGE_MAP)) {
    if (key.includes(k) || k.includes(key)) return page;
  }
  return null;
}

/** Caminho relativo ao curso (`cursos/tanar/…`). */
export function tanarBibleLibraryPath(page?: number): string {
  const base = `biblioteca/${TANAR_BIBLIA_BOOK_SLUG}`;
  return page != null && page > 0 ? `${base}/p/${page}` : base;
}

export function tanarBibleLibraryLinkHtml(page: number, label = "Abrir na Bíblia Hebraica"): string {
  return `<p><a href="${tanarBibleLibraryPath(page)}"><strong>${label}</strong></a> — início na página <strong>${page}</strong> da edição Gorodovits.</p>`;
}

export function tanarBibleReadingIntro(bookLabel: string, page: number, extraHtml = ""): string {
  return `<p>Trilha alinhada ao sumário do livro: <strong>${bookLabel}</strong>.</p>
${tanarBibleLibraryLinkHtml(page)}${extraHtml}`;
}

export type TanarBibleTrackLesson = {
  sectionTitle: string;
  sectionSortOrder: number;
  slug: string;
  title: string;
  page: number;
  extraHtml?: string;
};

export const TANAR_NEVIIM_TRACK: TanarBibleTrackLesson[] = [
  {
    sectionTitle: "Neviim",
    sectionSortOrder: 1,
    slug: "neviim-intro",
    title: "Introdução — Profetas (Neviim)",
    page: 269,
    extraHtml: ""
  },
  { sectionTitle: "Josué — Yehoshua", sectionSortOrder: 2, slug: "neviim-yehoshua", title: "Josué — Yehoshua", page: 270 },
  { sectionTitle: "Juízes — Shoftim", sectionSortOrder: 3, slug: "neviim-shoftim", title: "Juízes — Shoftim", page: 301 },
  { sectionTitle: "Samuel — Shemuel", sectionSortOrder: 4, slug: "neviim-shemuel", title: "Samuel — Shemuel", page: 333 },
  { sectionTitle: "Reis — Melakhim", sectionSortOrder: 5, slug: "neviim-melakhim", title: "Reis — Melakhim", page: 412 },
  { sectionTitle: "Isaías — Yeshayahu", sectionSortOrder: 6, slug: "neviim-yeshayahu", title: "Isaías — Yeshayahu", page: 488 },
  { sectionTitle: "Jeremias — Yirmeyahu", sectionSortOrder: 7, slug: "neviim-yirmeyahu", title: "Jeremias — Yirmeyahu", page: 556 },
  { sectionTitle: "Ezequiel — Yechezkel", sectionSortOrder: 8, slug: "neviim-yechezkel", title: "Ezequiel — Yechezkel", page: 632 },
  { sectionTitle: "Os Doze — Hoshea", sectionSortOrder: 9, slug: "neviim-hoshea", title: "Oseias — Hoshea", page: 698 },
  { sectionTitle: "Os Doze — Yoel", sectionSortOrder: 9, slug: "neviim-yoel", title: "Joel — Yoel", page: 708 },
  { sectionTitle: "Os Doze — Amos", sectionSortOrder: 9, slug: "neviim-amos", title: "Amós — Amos", page: 712 },
  { sectionTitle: "Os Doze — Ovadyah", sectionSortOrder: 9, slug: "neviim-ovadyah", title: "Obadias — Ovadyah", page: 720 },
  { sectionTitle: "Os Doze — Yonah", sectionSortOrder: 9, slug: "neviim-yonah", title: "Jonas — Yonah", page: 722 },
  { sectionTitle: "Os Doze — Michah", sectionSortOrder: 9, slug: "neviim-michah", title: "Miqueias — Michah", page: 725 },
  { sectionTitle: "Os Doze — Nachum", sectionSortOrder: 9, slug: "neviim-nachum", title: "Naum — Nachum", page: 731 },
  { sectionTitle: "Os Doze — Chavakuk", sectionSortOrder: 9, slug: "neviim-chavakuk", title: "Habacuque — Chavakuk", page: 734 },
  { sectionTitle: "Os Doze — Tzefanyah", sectionSortOrder: 9, slug: "neviim-tzefanyah", title: "Sofonias — Tzefanyah", page: 738 },
  { sectionTitle: "Os Doze — Chaggai", sectionSortOrder: 9, slug: "neviim-chaggai", title: "Ageu — Chaggai", page: 742 },
  { sectionTitle: "Os Doze — Zecharyah", sectionSortOrder: 9, slug: "neviim-zecharyah", title: "Zacarias — Zecharyah", page: 745 },
  { sectionTitle: "Os Doze — Malachi", sectionSortOrder: 9, slug: "neviim-malachi", title: "Malaquias — Malachi", page: 757 }
];

export const TANAR_KETUVIM_TRACK: TanarBibleTrackLesson[] = [
  { sectionTitle: "Jó — Iyov", sectionSortOrder: 3, slug: "ketuvim-iyov", title: "Jó — Iyov", page: 868 },
  { sectionTitle: "Cântico — Shir Hashirim", sectionSortOrder: 3, slug: "ketuvim-shir", title: "Cântico dos Cânticos", page: 902 },
  { sectionTitle: "Rute — Rut", sectionSortOrder: 3, slug: "ketuvim-rut", title: "Rute — Rut", page: 908 },
  { sectionTitle: "Lamentações — Echá", sectionSortOrder: 3, slug: "ketuvim-echa", title: "Lamentações — Echá", page: 912 },
  { sectionTitle: "Eclesiastes — Kohelet", sectionSortOrder: 3, slug: "ketuvim-kohelet", title: "Eclesiastes — Kohelet", page: 922 },
  { sectionTitle: "Ester — Ester", sectionSortOrder: 3, slug: "ketuvim-ester", title: "Ester — Ester", page: 932 },
  { sectionTitle: "Daniel — Daniel", sectionSortOrder: 3, slug: "ketuvim-daniel", title: "Daniel — Daniel", page: 942 },
  { sectionTitle: "Ezrá e Neemias", sectionSortOrder: 3, slug: "ketuvim-ezra", title: "Ezrá – Nehemiá", page: 962 },
  { sectionTitle: "Crônicas — Divrei Hayamim", sectionSortOrder: 3, slug: "ketuvim-divrei", title: "Crônicas — Divrei Hayamim", page: 1000 }
];

export const TANAR_PROFETAS_EXPECTED_LESSONS = TANAR_NEVIIM_TRACK.length;
export const TANAR_KETUVIM_EXTRA_EXPECTED = TANAR_KETUVIM_TRACK.length;

const SLUG_START_PAGE: Record<string, number> = Object.fromEntries(
  [...TANAR_NEVIIM_TRACK, ...TANAR_KETUVIM_TRACK].map((t) => [t.slug, t.page])
);

export function tanarBiblePageForLesson(slug: string, sectionTitle?: string): number | null {
  if (SLUG_START_PAGE[slug] != null) return SLUG_START_PAGE[slug];
  return tanarBiblePageForSection(sectionTitle);
}
