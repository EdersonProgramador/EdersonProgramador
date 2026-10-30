import {
  TANAR_KETUVIM_TRACK,
  TANAR_NEVIIM_TRACK,
  tanarBibleLibraryLinkHtml,
  tanarMishleChapterLessonHtml,
  tanarTehillimDayLessonHtml,
  tanarTorahBlockLessonHtml,
  tanarTrackBookLessonHtml,
  type TanarBibleTrackLesson
} from "@ederson-agencia/shared";

/** Trilha Tanar — módulo → submódulo (sectionTitle) → aula (checklist). */

export type TanarLesson = {
  slug: string;
  title: string;
  lessonType?: "article" | "video" | "document";
  bodyHtml?: string;
  videoId?: string;
  documentUrl?: string;
  sectionTitle: string;
  sectionSortOrder: number;
};

export type TanarModule = {
  title: string;
  lessons: TanarLesson[];
};

export type TanarCatalog = {
  slug: string;
  title: string;
  summary: string;
  coverUrl?: string;
  sortOrder: number;
  catalogVersion: number;
  modules: TanarModule[];
  libraryBooks: {
    slug: string;
    title: string;
    author?: string;
    summary?: string;
    coverUrl?: string;
    pdfUrl: string;
  }[];
};

const CHABAD_SHEMA =
  "https://www.chabad.org.br/biblioteca/artigos/shema/home.html";

function article(
  sectionTitle: string,
  sectionSortOrder: number,
  slug: string,
  title: string,
  bodyHtml: string
): TanarLesson {
  return {
    slug,
    title,
    sectionTitle,
    sectionSortOrder,
    lessonType: "article",
    bodyHtml
  };
}

/** Escritos → submódulo Salmos (Daily Tehillim): Day 1 … Day 30. */
const SALMOS_SECTION = "Salmos";

const tehillimDayTitles = [
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

const tehillimLessons: TanarLesson[] = tehillimDayTitles.map((title, index) => {
  const day = index + 1;
  return article(
    SALMOS_SECTION,
    1,
    `tehillim-day-${String(day).padStart(2, "0")}`,
    title,
    tanarTehillimDayLessonHtml(day, title)
  );
});

const mishleLessons: TanarLesson[] = Array.from({ length: 31 }, (_, i) => {
  const n = i + 1;
  return article("Provérbios", 2, `mishle-${n}`, `Mishlé ${n}`, tanarMishleChapterLessonHtml(n));
});

function trackLesson(spec: TanarBibleTrackLesson): TanarLesson {
  return article(
    spec.sectionTitle,
    spec.sectionSortOrder,
    spec.slug,
    spec.title,
    tanarTrackBookLessonHtml(spec)
  );
}

function torahLessons(
  sectionTitle: string,
  sectionSortOrder: number,
  bookSlug: string,
  startPage: number,
  blocks: { slug: string; label: string }[]
): TanarLesson[] {
  return blocks.map((b) =>
    article(
      sectionTitle,
      sectionSortOrder,
      `${bookSlug}-${b.slug}`,
      b.label,
      tanarTorahBlockLessonHtml(bookSlug, sectionTitle, startPage, b.label)
    )
  );
}

const moduloOracao: TanarModule = {
  title: "Oração Hebraica",
  lessons: [
    article(
      "Shema Israel — ao acordar e ao deitar",
      1,
      "shema-compilacao",
      "Compilação e autores",
      `<p><strong>Bênçãos e Orações para Dormir e Acordar</strong></p>
<p>Compilação: Rav Yusef Mikhael Eliyah · Tradução: Sha'ul Bentsion</p>`
    ),
    article(
      "Noite — ao se deitar",
      2,
      "shema-noite-deitar",
      "Ao se deitar para dormir",
      `<p>Bendito és Tu Adonay nosso Elohim, Rei do Universo, que faz os laços do sono caírem sobre meus olhos, e que ilumina a pupila do meu olho. Que seja da Tua vontade, oh Adonay meu Elohim, que Tu me resgates da inclinação ao mal e da ocorrência do mal, e que pesadelos ou maus pensamentos não me confundam. Que minha cama seja íntegra perante Ti; e faz-me levantar dela para a vida e para a paz. Ilumina os meus olhos, para que eu não durma o sono da morte. Bendito és Tu, Adonay, que ilumina a todo o mundo.</p>
<p>Ouve, oh Israel, Adonay nosso Elohim, Adonay é UM.</p>
<p>Amarás, pois, YHWH teu Elohim, de todo o teu coração, de toda a tua alma e de toda a tua força. Estas palavras que, hoje, te ordeno estarão no teu coração; tu as ensinarás a teus filhos, e delas falarás assentado em tua casa, e andando pelo caminho, e ao deitar-te, e ao levantar-te. Também as atarás como sinal na tua mão, e te serão por frontal entre os olhos. E as escreverás nos umbrais de tua casa e nas tuas portas.</p>`
    ),
    article(
      "Manhã — ao acordar",
      3,
      "shema-manha-alma",
      "Ao acordar, ainda na cama",
      `<p>Meu Elohim, a alma que me concedeste dentro de mim é pura — Tu a criaste. Tu a formaste; e Tu a sopraste dentro de mim. Tu a preservaste dentro de mim, e Tu a tomarás de mim no futuro; e no futuro Tu a retornarás a mim para o tempo vindouro. Em todos os momentos em que minha alma está dentro de mim, sou grato perante Ti, oh Adonay meu Elohim, mestre de todas as obras. Bendito és Tu Adonay, que retorna a alma ao que resta dos mortos.</p>`
    ),
    article(
      "Manhã — ao acordar",
      3,
      "shema-manha-sentar",
      "Ao se sentar à cama",
      `<p>Bendito és Tu Adonay nosso Elohim, Rei do Universo, que <strong>soltas os cativos</strong>.</p>`
    ),
    article(
      "Manhã — ao acordar",
      3,
      "shema-manha-pes",
      "Ao colocar os pés no chão",
      `<p>Bendito és Tu Adonay nosso Elohim, Rei do Universo, que <strong>separas a terra das águas</strong>.</p>`
    ),
    article(
      "Manhã — ao acordar",
      3,
      "shema-manha-levantar",
      "Ao se levantar",
      `<p>Bendito és Tu Adonay nosso Elohim, Rei do Universo, que <strong>endireitas os curvados</strong>.</p>`
    ),
    article(
      "Manhã — ao acordar",
      3,
      "shema-manha-olhos",
      "Ao esfregar os olhos",
      `<p>Bendito és Tu Adonay nosso Elohim, Rei do Universo, que <strong>concedes visão aos cegos</strong>.</p>`
    ),
    article(
      "Manhã — ao acordar",
      3,
      "shema-manha-galo",
      "Ao ouvir o galo cantar (se aplicável)",
      `<p>Bendito és Tu Adonay nosso Elohim, Rei do Universo, que <strong>concedes compreensão ao galo para discernir entre dia e noite</strong>.</p>`
    ),
    article(
      "Estudo do Shemá",
      4,
      "shema-minimo",
      "Recitação mínima (importante)",
      `<p>À noite, com muito sono, recite ao menos: <em>«Ouve, oh Israel, Adonay nosso Elohim, Adonay é UM.»</em></p>
<p><a href="${CHABAD_SHEMA}" target="_blank" rel="noopener noreferrer">Shemá Israel — Chabad Brasil</a></p>`
    ),
    article(
      "Estudo do Shemá",
      4,
      "shema-estudo-contexto",
      "O que é o Shemá Israel",
      `<p><strong>Shemá Israel</strong> (שְׁמַע יִשְׂרָאֵל) abre Devarim 6:4-9 — <em>Shemá Yisrael Ad-nai Elochêinu Ad-nai Echad</em>.</p>
<p>Originalmente um verso (Sukkot 42a, Berachot 13b). Hoje inclui Devarim 6:4-9, 11:13-21 e Bamidbar 15:37-41 — <strong>Arvit</strong> e <strong>Shacharit</strong>.</p>
${tanarBibleLibraryLinkHtml(220, "Ler Devarim na Bíblia Hebraica")}`
    ),
    article(
      "Estudo do Shemá",
      4,
      "shema-texto-veahavta",
      "Texto integral — abertura e Ve'Ahavta",
      `<p><strong>Ouve ó Israel, Ad-nai nosso D-us é Um.</strong> (Em voz baixa:) Bendito é o Eterno…</p>
<p><strong>Ve'Ahavta:</strong> Amarás o Eterno… ao deitar e ao levantar. <strong>Tefilin</strong> e <strong>mezuzá</strong>.</p>
${tanarBibleLibraryLinkHtml(220, "Texto em Devarim 6 — Bíblia Hebraica")}`
    ),
    article(
      "Estudo do Shemá",
      4,
      "shema-texto-continuacao",
      "Texto integral — Veaia, tzitzit e conclusão",
      `<p><strong>Veaia im Shamoa</strong> (Devarim 11) — obediência, chuvas, cuidado com ídolos.</p>
<p>Palavras no coração; tefilin; ensinar aos filhos; mezuzá.</p>
<p><strong>Vaiomer Ad-nai:</strong> <strong>Tzitzit</strong> (Bamidbar 15:37-41), cordão azul, santidade. «Eu Sou o Eterno, vosso D-us, que vos saquei da terra do Egito…»</p>
${tanarBibleLibraryLinkHtml(166, "Bamidbar na Bíblia Hebraica")}
${tanarBibleLibraryLinkHtml(220, "Devarim na Bíblia Hebraica")}`
    )
  ]
};

const ketuvimLessons: TanarLesson[] = TANAR_KETUVIM_TRACK.map(trackLesson);

const moduloEscritos: TanarModule = {
  title: "Escritos",
  lessons: [...tehillimLessons, ...mishleLessons, ...ketuvimLessons]
};

const moduloTora: TanarModule = {
  title: "Torá",
  lessons: [
    ...torahLessons("Gênesis — Bereshit", 1, "bereshit", 15, [
      { slug: "1-9", label: "Capítulos 1 a 9" },
      { slug: "10-19", label: "Capítulos 10 a 19" },
      { slug: "20-29", label: "Capítulos 20 a 29" },
      { slug: "30-39", label: "Capítulos 30 a 39" },
      { slug: "40-50", label: "Capítulos 40 a 50" }
    ]),
    ...torahLessons("Êxodo — Shemot", 2, "shemot", 74, [
      { slug: "1-9", label: "Capítulos 1 a 9" },
      { slug: "10-19", label: "Capítulos 10 a 19" },
      { slug: "20-29", label: "Capítulos 20 a 29" },
      { slug: "30-40", label: "Capítulos 30 a 40" }
    ]),
    ...torahLessons("Levítico — Vayikra", 3, "vaikra", 127, [
      { slug: "1-9", label: "Capítulos 1 a 9" },
      { slug: "10-19", label: "Capítulos 10 a 19" },
      { slug: "20-27", label: "Capítulos 20 a 27" }
    ]),
    ...torahLessons("Números — Bamidbar", 4, "bamidbar", 166, [
      { slug: "1-9", label: "Capítulos 1 a 9" },
      { slug: "10-19", label: "Capítulos 10 a 19" },
      { slug: "20-29", label: "Capítulos 20 a 29" },
      { slug: "30-36", label: "Capítulos 30 a 36" }
    ]),
    ...torahLessons("Deuteronômio — Devarim", 5, "devarim", 220, [
      { slug: "1-9", label: "Capítulos 1 a 9" },
      { slug: "10-19", label: "Capítulos 10 a 19" },
      { slug: "20-29", label: "Capítulos 20 a 29" },
      { slug: "30-34", label: "Capítulos 30 a 34" }
    ])
  ]
};

const moduloProfetas: TanarModule = {
  title: "Profetas",
  lessons: TANAR_NEVIIM_TRACK.map(trackLesson)
};

export const TANAR_CATALOG: TanarCatalog = {
  slug: "tanar",
  title: "Tanar — Trilha de estudos hebraicos",
  summary:
    "Oração hebraica, Escritos, Torá e Profetas — módulos, submódulos e aulas-checklist na Academia.",
  coverUrl: "/course-covers/tanar-tanakh.jpg",
  sortOrder: 3,
  catalogVersion: 14,
  libraryBooks: [
    {
      slug: "biblia-hebraica-gorodovits",
      title: "Bíblia Hebraica",
      author: "David Gorodovits",
      summary: "Edição de referência para leitura paralela hebraico-português na trilha Tanar.",
      coverUrl: "/course-covers/tanar-tanakh.jpg",
      pdfUrl: "/course-materials/tanar/biblia-hebraica-gorodovits.pdf"
    }
  ],
  modules: [moduloOracao, moduloEscritos, moduloTora, moduloProfetas]
};
