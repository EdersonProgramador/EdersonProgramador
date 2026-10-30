import {
  TANAR_KETUVIM_TRACK,
  TANAR_NEVIIM_TRACK,
  tanarBibleLibraryLinkHtml,
  tanarBibleLibraryPath,
  type TanarBibleTrackLesson
} from "./tanar-bible-outline.js";

const TEHILLIM_LINK =
  "https://www.chabad.org/multimedia/music_cdo/aid/4486801/jewish/Daily-Tehillim-Audio.htm";

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

type TorahBookMeta = {
  hebrew: string;
  summary: string;
};

export const TANAR_TORAH_BOOKS: Record<string, TorahBookMeta> = {
  bereshit: {
    hebrew: "בראשית",
    summary:
      "Bereshit abre o Tanach com a criação, a queda, o dilúvio, as patriarcas e a descendência de Israel — base da identidade e da aliança."
  },
  shemot: {
    hebrew: "שמות",
    summary:
      "Shemot relata a opressão no Egito, a libertação, a entrega da Torá no Sinai e a construção do Mishkan — o eixo da lei e do culto."
  },
  vaikra: {
    hebrew: "ויקרא",
    summary:
      "Vayikra concentra os sacrifícios, a pureza ritual e a santidade do povo — «Sede santos, porque Eu, YHWH, vosso Elohim, sou santo.»"
  },
  bamidbar: {
    hebrew: "במדבר",
    summary:
      "Bamidbar acompanha Israel no deserto: censo, jornada, rebeliões e preparação para entrar na terra prometida."
  },
  devarim: {
    hebrew: "דברים",
    summary:
      "Devarim reúne os discursos de Moisés antes da entrada na terra — repetição da Torá, exortação e aliança renovada."
  }
};

const TRACK_BOOK_COPY: Record<string, { hebrew?: string; division: string; summary: string }> = {
  "neviim-intro": {
    division: "Neviim",
    summary:
      "A seção Profetas (Neviim) na edição Gorodovits reúne os livros históricos e proféticos. Se ainda não leu, passe pelo prefácio e pelas considerações gerais da edição (links abaixo)."
  },
  "neviim-yehoshua": {
    hebrew: "יהושע",
    division: "Neviim — Históricos",
    summary: "Conquista e repartição da terra sob Yehoshua, continuidade da aliança após Moisés."
  },
  "neviim-shoftim": {
    hebrew: "שופטים",
    division: "Neviim — Históricos",
    summary: "Ciclo de apostasia, opressão, juízes levantados por YHWH e entrega parcial da terra."
  },
  "neviim-shemuel": {
    hebrew: "שמואל",
    division: "Neviim — Históricos",
    summary: "Shmuel, Shaul e o surgimento da monarquia davídica."
  },
  "neviim-melakhim": {
    hebrew: "מלכים",
    division: "Neviim — Históricos",
    summary: "Reinos divididos, profetas reais e queda de Yerushalayim."
  },
  "neviim-yeshayahu": {
    hebrew: "ישעיהו",
    division: "Neviim — Profetas maiores",
    summary: "Visões messiânicas, santidade de YHWH e advertências a Yehudah e às nações."
  },
  "neviim-yirmeyahu": {
    hebrew: "ירמיהו",
    division: "Neviim — Profetas maiores",
    summary: "Chamado profético, queda de Yerushalayim e promessa de nova aliança."
  },
  "neviim-yechezkel": {
    hebrew: "יחזקאל",
    division: "Neviim — Profetas maiores",
    summary: "Exílio, glória de YHWH, templo e restauração de Israel."
  },
  "neviim-hoshea": {
    hebrew: "הושע",
    division: "Neviim — Trei Asar",
    summary: "Metáfora do casamento e do retorno de Israel a YHWH."
  },
  "neviim-yoel": { hebrew: "יואל", division: "Neviim — Trei Asar", summary: "Dia de YHWH, chuvas e derramamento do espírito." },
  "neviim-amos": {
    hebrew: "עמוס",
    division: "Neviim — Trei Asar",
    summary: "Justiça social e juízo sobre Israel e nações vizinhas."
  },
  "neviim-ovadyah": { hebrew: "עובדיה", division: "Neviim — Trei Asar", summary: "Juízo sobre Edom." },
  "neviim-yonah": { hebrew: "יונה", division: "Neviim — Trei Asar", summary: "Missão a Ninevé e misericórdia divina." },
  "neviim-michah": { hebrew: "מיכה", division: "Neviim — Trei Asar", summary: "Justiça, Bet-Lehem e fim das guerras." },
  "neviim-nachum": { hebrew: "נחום", division: "Neviim — Trei Asar", summary: "Queda de Ninevé." },
  "neviim-chavakuk": { hebrew: "חבקוק", division: "Neviim — Trei Asar", summary: "Fé diante da violência e da opressão." },
  "neviim-tzefanyah": { hebrew: "צפניה", division: "Neviim — Trei Asar", summary: "Dia de YHWH e restante humilde." },
  "neviim-chaggai": { hebrew: "חגי", division: "Neviim — Trei Asar", summary: "Reconstrução do Beit HaMikdash após o exílio." },
  "neviim-zecharyah": { hebrew: "זכריה", division: "Neviim — Trei Asar", summary: "Visões apocalípticas e messianismo sacerdotal." },
  "neviim-malachi": { hebrew: "מלאכי", division: "Neviim — Trei Asar", summary: "Último profeta do Tanach; pureza do culto e Eliáhu." },
  "ketuvim-iyov": { hebrew: "איוב", division: "Ketuvim", summary: "Sofrimento do justo, sabedoria e soberania de YHWH." },
  "ketuvim-shir": {
    hebrew: "שיר השירים",
    division: "Ketuvim",
    summary: "Poema de amor — leitura literal e midráshica na tradição."
  },
  "ketuvim-rut": { hebrew: "רuth", division: "Ketuvim", summary: "Lealdade, redenção e linhagem davídica." },
  "ketuvim-echa": { hebrew: "איכה", division: "Ketuvim", summary: "Lamentações sobre a destruição de Yerushalayim." },
  "ketuvim-kohelet": { hebrew: "קהלת", division: "Ketuvim", summary: "Vanidade, tempo e temor a Elohim." },
  "ketuvim-ester": { hebrew: "אסתר", division: "Ketuvim", summary: "Purim — providência oculta na Pérsia." },
  "ketuvim-daniel": { hebrew: "דניאל", division: "Ketuvim", summary: "Fidelidade no exílio e visões das monarquias." },
  "ketuvim-ezra": {
    hebrew: "עזרא · נחמיה",
    division: "Ketuvim",
    summary: "Retorno da Babilônia, reconstrução e reforma da comunidade."
  },
  "ketuvim-divrei": {
    hebrew: "דברי הימים",
    division: "Ketuvim",
    summary: "Retrospectiva sacerdotal da história de Israel, do Adam aos reis."
  }
};

const TRACK_BY_SLUG = new Map<string, TanarBibleTrackLesson>(
  [...TANAR_NEVIIM_TRACK, ...TANAR_KETUVIM_TRACK].map((t) => [t.slug, t])
);

const TORAH_BLOCK_LABELS: Record<string, string> = {
  "1-9": "Capítulos 1 a 9",
  "10-19": "Capítulos 10 a 19",
  "20-29": "Capítulos 20 a 29",
  "30-39": "Capítulos 30 a 39",
  "40-50": "Capítulos 40 a 50",
  "30-40": "Capítulos 30 a 40",
  "20-27": "Capítulos 20 a 27",
  "30-36": "Capítulos 30 a 36",
  "30-34": "Capítulos 30 a 34"
};

const TORAH_BOOK_TITLES: Record<string, string> = {
  bereshit: "Gênesis — Bereshit",
  shemot: "Êxodo — Shemot",
  vaikra: "Levítico — Vayikra",
  bamidbar: "Números — Bamidbar",
  devarim: "Deuteronômio — Devarim"
};

const TORAH_START_PAGES: Record<string, number> = {
  bereshit: 15,
  shemot: 74,
  vaikra: 127,
  bamidbar: 166,
  devarim: 220
};

function proseHeading(title: string, hebrew?: string) {
  return hebrew
    ? `<p class="tanar-lesson-lead"><strong>${title}</strong> <span lang="he" dir="rtl">${hebrew}</span></p>`
    : `<p class="tanar-lesson-lead"><strong>${title}</strong></p>`;
}

export function tanarTorahBlockLessonHtml(
  bookKey: string,
  bookTitle: string,
  startPage: number,
  blockLabel: string
): string {
  const meta = TANAR_TORAH_BOOKS[bookKey];
  const summary = meta?.summary ?? "Leitura na Torá conforme a edição Gorodovits.";
  const hebrew = meta?.hebrew;
  return `${proseHeading(bookTitle, hebrew)}
<p><em>Torá</em> · ${summary}</p>
<p><strong>Leitura desta aula:</strong> ${blockLabel}.</p>
<p>Na Bíblia Hebraica (Gorodovits), abra o livro no sumário e leia o bloco em hebraico com tradução paralela. O número <strong>p. ${startPage}</strong> na sidebar indica onde o livro começa nesta edição.</p>
${tanarBibleLibraryLinkHtml(startPage, `Abrir ${bookTitle} na biblioteca`)}
<p class="tanar-lesson-tip">Use o sumário do leitor (ícone à esquerda) para navegar entre livros do Tanach.</p>
<p>Marque a aula quando concluir este bloco.</p>`;
}

export function tanarTrackBookLessonHtml(spec: TanarBibleTrackLesson): string {
  const copy = TRACK_BOOK_COPY[spec.slug] ?? {
    division: "Tanach",
    summary: `Leitura de ${spec.title} na edição Gorodovits, conforme sumário do PDF.`
  };
  let extra = spec.extraHtml ?? "";
  if (spec.slug === "neviim-intro") {
    extra += tanarEditionFrontMatterHtml();
  }
  return `${proseHeading(spec.title, copy.hebrew)}
<p><em>${copy.division}</em></p>
<p>${copy.summary}</p>
<p>Leia na Bíblia Hebraica a partir da página abaixo — texto hebraico e tradução em português lado a lado.</p>
${tanarBibleLibraryLinkHtml(spec.page)}
${extra}
<p>Marque a aula ao terminar a leitura prevista para este livro.</p>`;
}

export function tanarTehillimDayLessonHtml(day: number, title: string): string {
  return `${proseHeading(`Salmos — ${title}`, "תהלים")}
<p><em>Escritos (Ketuvim)</em> · Trilha Daily Tehillim alinhada ao sumário do livro (início p. 762).</p>
<p><a href="${TEHILLIM_LINK}" target="_blank" rel="noopener noreferrer">Daily Tehillim Audio (Chabad)</a> — ouça o <strong>Day ${day}</strong> enquanto acompanha os capítulos na Bíblia Hebraica.</p>
<p><strong>Capítulos:</strong> ${title.replace(/^Day \d+ — /, "")}</p>
${tanarBibleLibraryLinkHtml(762, "Abrir Salmos na biblioteca")}
<p>Marque ao concluir a audição e a leitura do dia.</p>`;
}

export function tanarMishleChapterLessonHtml(chapter: number): string {
  let extra = "";
  if (chapter === 12) {
    extra =
      "<p><em>A diligência na Bíblia é o esforço constante, o cuidado, o zelo e a dedicação em fazer algo com excelência.</em></p>";
  }
  return `${proseHeading(`Mishlé ${chapter}`, "משלי")}
<p><em>Escritos — Provérbios</em> · Capítulo ${chapter} na edição Gorodovits (livro a partir da p. 840).</p>
<p>Leia o capítulo em hebraico com tradução paralela; anote vocábulos e temas de sabedoria prática.</p>
${tanarBibleLibraryLinkHtml(840, "Abrir Provérbios na biblioteca")}
${extra}
<p>Marque a aula ao terminar o capítulo.</p>`;
}

export function tanarEditionFrontMatterHtml(): string {
  return `<p>Material introdutório da edição:</p>
<ul>
<li><a href="${tanarBibleLibraryPath(6)}">Prefácio</a> (p. 6)</li>
<li><a href="${tanarBibleLibraryPath(8)}">Considerações gerais</a> (p. 8)</li>
<li><a href="${tanarBibleLibraryPath(11)}">Bibliografia</a> (p. 11)</li>
</ul>`;
}

/** HTML da aula derivado do livro Gorodovits; null se slug não for da trilha bíblica. */
export function tanarBibleLessonHtmlForSlug(slug: string, title?: string): string | null {
  const tehillim = slug.match(/^tehillim-day-(\d+)$/);
  if (tehillim) {
    const day = Number(tehillim[1]);
    const idx = day - 1;
    const dayTitle = TEHILLIM_DAY_TITLES[idx] ?? title ?? `Day ${day}`;
    return tanarTehillimDayLessonHtml(day, dayTitle);
  }

  const mishle = slug.match(/^mishle-(\d+)$/);
  if (mishle) return tanarMishleChapterLessonHtml(Number(mishle[1]));

  const torah = slug.match(/^(bereshit|shemot|vaikra|bamidbar|devarim)-(.+)$/);
  if (torah) {
    const bookKey = torah[1];
    const block = TORAH_BLOCK_LABELS[torah[2]] ?? torah[2];
    return tanarTorahBlockLessonHtml(
      bookKey,
      TORAH_BOOK_TITLES[bookKey] ?? bookKey,
      TORAH_START_PAGES[bookKey] ?? 15,
      block
    );
  }

  const track = TRACK_BY_SLUG.get(slug);
  if (track) return tanarTrackBookLessonHtml(track);

  return null;
}

/** Conteúdo legado (pré-prosa) ou vazio — pode ser substituído pelo fallback do front. */
export function needsTanarProseFallback(html: string | undefined): boolean {
  if (!html?.trim()) return true;
  const t = html;
  if (t.includes('class="tanar-lesson-lead"')) return false;
  if (/Biblioteca do curso/i.test(t)) return true;
  if (t.includes("Trilha alinhada ao sumário") && t.length < 720) return true;
  if (t.includes("Bloco:") && t.includes("Marque ao terminar") && t.length < 480) return true;
  if (t.includes("neviim-em-breve") || t.includes("Submódulos por livro")) return true;
  return false;
}

/** Preenche notas só quando a API ainda não entregou conteúdo definitivo (não sobrescreve admin/sync). */
export function enrichTanarBibleLessonNotes(
  lessonNotes: Record<string, { html?: string; displayTitle?: string }>,
  items: { slug: string; title: string }[]
): Record<string, { html?: string; displayTitle?: string }> {
  const next = { ...lessonNotes };
  for (const item of items) {
    const existing = next[item.slug];
    if (!needsTanarProseFallback(existing?.html)) continue;
    const html = tanarBibleLessonHtmlForSlug(item.slug, item.title);
    if (html) {
      next[item.slug] = { ...existing, html, displayTitle: existing?.displayTitle ?? item.title };
    }
  }
  return next;
}
