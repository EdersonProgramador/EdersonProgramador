/** Trilha Tanar — estudos hebraicos (Shema, Sidur, Tanach, Ketuvim). */

export type TanarLesson = {
  slug: string;
  title: string;
  lessonType?: "article" | "video" | "document";
  bodyHtml?: string;
  videoId?: string;
  documentUrl?: string;
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
  introModule?: TanarModule;
  modules: TanarModule[];
  libraryBooks: {
    slug: string;
    title: string;
    author?: string;
    summary?: string;
    pdfUrl: string;
  }[];
};

export const TANAR_CATALOG: TanarCatalog = {
  slug: "tanar",
  title: "Tanar — Trilha de estudos hebraicos",
  summary:
    "Shema ao acordar e ao deitar, Sidur, leitura da Torá e Profetas, Ketuvim (Tehillim e Mishlé) e referências da Bíblia Hebraica — trilha organizada na Academia.",
  coverUrl: "https://i.ytimg.com/vi/ZC5IuSkEHEM/hqdefault.jpg",
  sortOrder: 3,
  catalogVersion: 1,
  libraryBooks: [
    {
      slug: "biblia-hebraica-gorodovits",
      title: "Bíblia Hebraica",
      author: "David Gorodovits",
      summary: "Edição de referência para leitura paralela hebraico-português.",
      pdfUrl: "/course-materials/tanar/biblia-hebraica-gorodovits.pdf"
    }
  ],
  introModule: {
    title: "Orientações",
    lessons: [
      {
        slug: "visao-geral-tanar",
        title: "Como usar esta trilha",
        lessonType: "article",
        bodyHtml: `<p>A trilha <strong>Tanar</strong> organiza seus estudos em blocos: <strong>Shema</strong> (manhã e noite), <strong>Sidur</strong>, <strong>Torá</strong>, <strong>Profetas</strong> e <strong>Escritos</strong>, com links e materiais de apoio.</p>
<p>Abra a <strong>Biblioteca digital</strong> deste curso para o PDF <em>Bíblia Hebraica — David Gorodovits</em>.</p>
<p>Marque as aulas como concluídas conforme avança; use fichamento nas aulas quando quiser registrar insights.</p>`
      }
    ]
  },
  modules: [
    {
      title: "1 — Shema Israel (manhã e noite)",
      lessons: [
        {
          slug: "shema-compilacao",
          title: "Compilação e autores",
          lessonType: "article",
          bodyHtml: `<p><strong>Bênçãos e Orações para Dormir e Acordar</strong><br/>Compilação: Rav Yusef Mikhael Eliyah · Tradução: Sha'ul Bentsion</p>
<p>Referência: <a href="https://www.chabad.org.br/biblioteca/artigos/shema/home.html" target="_blank" rel="noopener noreferrer">Shemá Israel — Chabad Brasil</a></p>`
        },
        {
          slug: "shema-noite",
          title: "Noite — ao se deitar",
          lessonType: "article",
          bodyHtml: `<p><strong>Ao se deitar para dormir:</strong></p>
<p>Bendito és Tu Adonay nosso Elohim, Rei do Universo, que faz os laços do sono caírem sobre meus olhos, e que ilumina a pupila do meu olho. Que seja da Tua vontade, oh Adonay meu Elohim, que Tu me resgates da inclinação ao mal e da ocorrência do mal, e que pesadelos ou maus pensamentos não me confundam. Que minha cama seja íntegra perante Ti; e faz-me levantar dela para a vida e para a paz. Ilumina os meus olhos, para que eu não durma o sono da morte. Bendito és Tu, Adonay, que ilumina a todo o mundo.</p>
<p><strong>Shema:</strong> Ouve, oh Israel, Adonay nosso Elohim, Adonay é UM. Amarás, pois, YHWH teu Elohim, de todo o teu coração, de toda a tua alma e de toda a tua força. Estas palavras que, hoje, te ordeno estarão no teu coração; tu as ensinarás a teus filhos, e delas falarás assentado em tua casa, e andando pelo caminho, e ao deitar-te, e ao levantar-te. Também as atarás como sinal na tua mão, e te serão por frontal entre os olhos. E as escreverás nos umbrais de tua casa e nas tuas portas.</p>`
        },
        {
          slug: "shema-manha",
          title: "Manhã — ao acordar e bênçãos",
          lessonType: "article",
          bodyHtml: `<p><strong>Ao acordar, ainda na cama:</strong> Meu Elohim, a alma que me concedeste dentro de mim é pura — Tu a criaste. Tu a formaste; e Tu a sopraste dentro de mim. Tu a preservaste dentro de mim, e Tu a tomarás de mim no futuro; e no futuro Tu a retornarás a mim para o tempo vindouro. Em todos os momentos em que minha alma está dentro de mim, sou grato perante Ti, oh Adonay meu Elohim, mestre de todas as obras. Bendito és Tu Adonay, que retorna a alma ao que resta dos mortos.</p>
<ul>
<li><strong>Ao se sentar à cama:</strong> Bendito és Tu Adonay… que soltas os cativos.</li>
<li><strong>Ao colocar os pés no chão:</strong> …que separas a terra das águas.</li>
<li><strong>Ao se levantar:</strong> …que endireitas os curvados.</li>
<li><strong>Ao esfregar os olhos:</strong> …que concedes visão aos cegos.</li>
<li><strong>Ao ouvir o galo (se aplicável):</strong> …que concedes compreensão ao galo para discernir entre dia e noite.</li>
</ul>`
        },
        {
          slug: "shema-minimo-e-texto",
          title: "Recitação mínima e texto integral",
          lessonType: "article",
          bodyHtml: `<p><strong>Importante:</strong> à noite, com muito sono, recite ao menos: <em>«Ouve, oh Israel, Adonay nosso Elohim, Adonay é UM.»</em></p>
<p>O Shemá (Devarim 6:4-9) é a profissão de fé central do monoteísmo judaico. A recitação completa inclui também Devarim 11:13-21 e Bamidbar 15:37-41 — base da Arvit e Shacharit.</p>
<p><strong>Abertura:</strong> Ouve ó Israel, Ad-nai nosso D-us é Um. (Em voz baixa: Bendito é o Eterno…)</p>
<p><strong>Ve'Ahavta</strong> — amar a Hashem de todo coração, alma e força; ensinar aos filhos; ao deitar e ao levantar; tefilin e mezuzá.</p>
<p>Estude o artigo completo no link da aula «Compilação e autores».</p>`
        }
      ]
    },
    {
      title: "2 — Sidur: aprendendo a falar com Hashem",
      lessons: [
        {
          slug: "sidur-intro-video",
          title: "Introdução ao Sidur (vídeo)",
          lessonType: "video",
          videoId: "ZC5IuSkEHEM",
          bodyHtml: `<p>Vídeo de apoio: <a href="https://youtu.be/ZC5IuSkEHEM" target="_blank" rel="noopener noreferrer">Abrir no YouTube</a></p>
<p>Materiais citados na trilha: <em>Sidur Sefaradi</em> e <em>Manual de Bênçãos</em> — use seu exemplar físico ou PDF quando disponível.</p>`
        },
        {
          slug: "sidur-prece-matinal",
          title: "Prece matinal — mapa do Manual",
          lessonType: "article",
          bodyHtml: `<p><strong>Primeira leitura sugerida (Manual de Bênçãos):</strong></p>
<ul>
<li>Prece Matinal (p. 14–18)</li>
<li>Bênçãos da Refeição (p. 16)</li>
<li>Passagens Sagradas (p. 17)</li>
<li>Prece Antes de Dormir (p. 22)</li>
</ul>
<p><strong>Na prece matinal:</strong> Bircot Hasháchar · Bircot HaTorá · Talit / Tefilin · Shemá · Aliyá · Hagomel · Cadish · Shesh Zechirot · Tefilat Hadêrech.</p>`
        },
        {
          slug: "sidur-bencaos-diversas",
          title: "Bênçãos diversas e ciclo de vida",
          lessonType: "article",
          bodyHtml: `<p>Consulte no Manual: Asher Yatsar, Mezuzá, milagres, natureza, sábios, boas/más notícias, cemitério, tevilat kelim, chalá, micvé, fragrâncias.</p>
<p><strong>Berit Milá:</strong> oitavo dia (ajustar com rabino se Shabat/Yom Tov). Bênção do pai após milá: <em>Baruch Atá A-do-nai… lehachnissô bivritô shel Avraham Avínu.</em></p>
<p>Resposta: <em>Keshém shenichnas laberit, ken yicanês leTorá, ulchupá, ulmaassim tovim.</em></p>`
        },
        {
          slug: "sidur-alimentos-shabat",
          title: "Bênçãos sobre alimentos, Shabat e Yom Tov",
          lessonType: "article",
          bodyHtml: `<p>Seções do Manual: alimentos (Berachá meen shalosh, Borei nefashot), Shemá antes de dormir (p. 113), velas, Kidush Shabat/Rosh Hashaná, Havdalá, Kidush Levaná, dias sagrados.</p>`
        }
      ]
    },
    {
      title: "3 — Torá (Chumash)",
      lessons: [
        {
          slug: "torah-bereshit",
          title: "Bereshit (Gênesis) — capítulos 1–50",
          lessonType: "article",
          bodyHtml: `<p>Início da leitura: 05/10/2026 · Blocos: 1–9, 10–19, 20–29, 30–39, 40–50 ✓</p>`
        },
        {
          slug: "torah-shemot",
          title: "Shemot (Êxodo) — capítulos 1–40",
          lessonType: "article",
          bodyHtml: `<p>Blocos concluídos: 1–9, 10–19, 20–29, 30–40 ✓</p>`
        },
        {
          slug: "torah-vaikra",
          title: "Vayikra (Levítico) — capítulos 1–27",
          lessonType: "article",
          bodyHtml: `<p>Blocos concluídos: 1–9, 10–19, 20–27 ✓</p>`
        },
        {
          slug: "torah-bamidbar",
          title: "Bamidbar (Números) — capítulos 1–36",
          lessonType: "article",
          bodyHtml: `<p>Blocos concluídos: 1–9, 10–19, 20–29, 30–36 ✓</p>`
        },
        {
          slug: "torah-devarim",
          title: "Devarim (Deuteronômio) — Chazak",
          lessonType: "article",
          bodyHtml: `<p>Conclusão: 28/10/2026 às 23:44 · <strong>Chazak!</strong> Capítulos 1–34 ✓</p>`
        },
        {
          slug: "aulas-rabino-dudu",
          title: "Aulas — Rabino Dudu (YouTube)",
          lessonType: "article",
          bodyHtml: `<p><a href="https://www.youtube.com/playlist?list=PLEkKz2fY9GnSTH4gelE0OChAT8qQpy6P6" target="_blank" rel="noopener noreferrer">Playlist Judaismo</a></p>
<p><a href="https://www.youtube.com/@rabinodudu/streams" target="_blank" rel="noopener noreferrer">Canal @rabinodudu — lives</a></p>`
        }
      ]
    },
    {
      title: "4 — Profetas (Neviim)",
      lessons: [
        {
          slug: "neviim-josue",
          title: "Yehoshua (Josué) — trilha 1–30",
          lessonType: "article",
          bodyHtml: `<p>Progresso sugerido: capítulos 1–5, 6–10, 11–15, 16–20, 21–25, 26–30.</p>`
        }
      ]
    },
    {
      title: "5 — Escritos (Ketuvim)",
      lessons: [
        {
          slug: "ketuvim-tehillim",
          title: "Tehillim — leitura diária em áudio",
          lessonType: "article",
          bodyHtml: `<p><a href="https://www.chabad.org/multimedia/music_cdo/aid/4486801/jewish/Daily-Tehillim-Audio.htm" target="_blank" rel="noopener noreferrer">Daily Tehillim Audio (Chabad)</a></p>
<p>Dias 1–24 concluídos · em andamento: Dia 25 (Tehillim 119:1–96), depois 26–30.</p>`
        },
        {
          slug: "ketuvim-mishle",
          title: "Mishlé (Provérbios) — capítulos 1–31",
          lessonType: "article",
          bodyHtml: `<p>Concluídos: Mishlé 1–23 · Próximos: 24–31.</p>
<p>Nota (Mishlé 12): <em>diligência</em> — esforço constante, zelo e dedicação com excelência.</p>`
        }
      ]
    },
    {
      title: "6 — Judaismo de Alef a Tav",
      lessons: [
        {
          slug: "alef-tev-intro",
          title: "Como estudar e nomenclatura Tanach",
          lessonType: "article",
          bodyHtml: `<p>Trilha «Judaismo de Alef a Tav»: Introdução, nomenclatura dos livros do Tanach, glossário.</p>`
        },
        {
          slug: "alef-tev-letras",
          title: "Letras Alef até Tav — checklist",
          lessonType: "article",
          bodyHtml: `<p>Estude na ordem: Alef (fé), Bet (pacto), Guimel, Dalet, Hei, Vav, Zain, Chet, Tet, Yud, Kaf (comer como oração), Lamed, Mem, Nun, Samech, Ain, Pei, Tzadik, Kuf, Resh, Shin, Tav.</p>
<p>Cada capítulo aprofunda um tema da vida judaica prática e da Torá oral.</p>`
        }
      ]
    }
  ]
};
