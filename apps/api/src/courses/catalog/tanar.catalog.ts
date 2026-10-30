/** Trilha Tanar — Oração hebraica, Ketuvim, Torá e Profetas. */

export type TanarLesson = {
  slug: string;
  title: string;
  lessonType?: "article" | "video" | "document";
  bodyHtml?: string;
  videoId?: string;
  documentUrl?: string;
  sectionTitle?: string;
  sectionSortOrder?: number;
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

const tehillimChecklist = `<p><a href="https://www.chabad.org/multimedia/music_cdo/aid/4486801/jewish/Daily-Tehillim-Audio.htm" target="_blank" rel="noopener noreferrer">Daily Tehillim Audio (Chabad)</a></p>
<ul>
<li>✓ Day 1 — capítulos 1–9</li>
<li>✓ Day 2 — capítulos 10–17</li>
<li>✓ Day 3 — capítulos 18–22</li>
<li>✓ Day 4 — capítulos 23–28</li>
<li>✓ Day 5 — capítulos 29–34</li>
<li>✓ Day 6 — capítulos 35–38</li>
<li>✓ Day 7 — capítulos 39–43</li>
<li>✓ Day 8 — capítulos 44–48</li>
<li>✓ Day 9 — capítulos 49–54</li>
<li>✓ Day 10 — capítulos 55–59</li>
<li>✓ Day 11 — capítulos 60–65</li>
<li>✓ Day 12 — capítulos 66–68</li>
<li>✓ Day 13 — capítulos 69–71</li>
<li>✓ Day 14 — capítulos 72–76</li>
<li>✓ Day 15 — capítulos 77–78</li>
<li>✓ Day 16 — capítulos 79–82</li>
<li>✓ Day 17 — capítulos 83–87</li>
<li>✓ Day 18 — capítulos 88–89</li>
<li>✓ Day 19 — capítulos 90–96</li>
<li>✓ Day 20 — capítulos 97–103</li>
<li>✓ Day 21 — capítulos 104–105</li>
<li>✓ Day 22 — capítulos 106–107</li>
<li>✓ Day 23 — capítulos 108–112</li>
<li>✓ Day 24 — capítulos 113–118</li>
<li>☐ Day 25 — capítulo 119, versos 1–96</li>
<li>☐ Day 26 — capítulo 119, versos 97–176</li>
<li>☐ Day 27 — capítulos 120–134</li>
<li>☐ Day 28 — capítulos 135–139</li>
<li>☐ Day 29 — capítulos 140–144</li>
<li>☐ Day 30 — capítulos 145–150</li>
</ul>`;

const mishleChecklist = `<ul>
<li>✓ Mishlé 1</li>
<li>✓ Mishlé 2</li>
<li>✓ Mishlé 3</li>
<li>✓ Mishlé 4</li>
<li>✓ Mishlé 5</li>
<li>✓ Mishlé 6</li>
<li>✓ Mishlé 7</li>
<li>✓ Mishlé 8</li>
<li>✓ Mishlé 9</li>
<li>✓ Mishlé 10</li>
<li>✓ Mishlé 11</li>
<li>✓ Mishlé 12 — <em>A diligência na Bíblia é o esforço constante, o cuidado, o zelo e a dedicação em fazer algo com excelência.</em></li>
<li>✓ Mishlé 13</li>
<li>✓ Mishlé 14</li>
<li>✓ Mishlé 15</li>
<li>✓ Mishlé 16</li>
<li>✓ Mishlé 17</li>
<li>✓ Mishlé 18</li>
<li>✓ Mishlé 19</li>
<li>✓ Mishlé 20</li>
<li>✓ Mishlé 21</li>
<li>✓ Mishlé 22</li>
<li>✓ Mishlé 23</li>
<li>☐ Mishlé 24</li>
<li>☐ Mishlé 25</li>
<li>☐ Mishlé 26</li>
<li>☐ Mishlé 27</li>
<li>☐ Mishlé 28</li>
<li>☐ Mishlé 29</li>
<li>☐ Mishlé 30</li>
</ul>`;

function torahBlock(book: string, slug: string, title: string, sectionOrder: number, chapters: string) {
  return {
    slug,
    title,
    sectionTitle: book,
    sectionSortOrder: sectionOrder,
    lessonType: "article" as const,
    bodyHtml: `<p>Leitura na <strong>Bíblia Hebraica</strong> (Biblioteca do curso). Marque a aula como concluída ao terminar o bloco.</p>
<ul><li>☐ ${chapters}</li></ul>`
  };
}

export const TANAR_CATALOG: TanarCatalog = {
  slug: "tanar",
  title: "Tanar — Trilha de estudos hebraicos",
  summary:
    "Oração hebraica (Shema), Escritos (Tehillim e Mishlé), Torá (Chumash) e Profetas — trilha na Academia com Bíblia Hebraica na biblioteca.",
  coverUrl: "https://i.ytimg.com/vi/ZC5IuSkEHEM/hqdefault.jpg",
  sortOrder: 3,
  catalogVersion: 2,
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
        bodyHtml: `<p>Quatro módulos: <strong>Oração Hebraica</strong>, <strong>Escritos</strong>, <strong>Torá</strong> e <strong>Profetas</strong>.</p>
<p>Use a <strong>Biblioteca digital</strong> para o PDF <em>Bíblia Hebraica — David Gorodovits</em>. Marque cada aula ao concluir a leitura ou prática.</p>`
      }
    ]
  },
  modules: [
    {
      title: "Módulo 1 — Oração Hebraica",
      lessons: [
        {
          slug: "shema-intro",
          title: "Ao acordar e ao deitar — Shema Israel",
          lessonType: "article",
          bodyHtml: `<p><strong>Bênçãos e Orações para Dormir e Acordar</strong></p>
<p>Compilação: Rav Yusef Mikhael Eliyah · Tradução: Sha'ul Bentsion</p>`
        },
        {
          slug: "shema-noite",
          title: "Noite — ao se deitar para dormir",
          lessonType: "article",
          bodyHtml: `<p>Bendito és Tu Adonay nosso Elohim, Rei do Universo, que faz os laços do sono caírem sobre meus olhos, e que ilumina a pupila do meu olho. Que seja da Tua vontade, oh Adonay meu Elohim, que Tu me resgates da inclinação ao mal e da ocorrência do mal, e que pesadelos ou maus pensamentos não me confundam. Que minha cama seja íntegra perante Ti; e faz-me levantar dela para a vida e para a paz. Ilumina os meus olhos, para que eu não durma o sono da morte. Bendito és Tu, Adonay, que ilumina a todo o mundo.</p>
<p>Ouve, oh Israel, Adonay nosso Elohim, Adonay é UM.</p>
<p>Amarás, pois, YHWH teu Elohim, de todo o teu coração, de toda a tua alma e de toda a tua força. Estas palavras que, hoje, te ordeno estarão no teu coração; tu as ensinarás a teus filhos, e delas falarás assentado em tua casa, e andando pelo caminho, e ao deitar-te, e ao levantar-te. Também as atarás como sinal na tua mão, e te serão por frontal entre os olhos. E as escreverás nos umbrais de tua casa e nas tuas portas.</p>`
        },
        {
          slug: "shema-manha",
          title: "Manhã — ao acordar e bênçãos",
          lessonType: "article",
          bodyHtml: `<p><strong>Ao acordar, ainda na cama:</strong> Meu Elohim, a alma que me concedeste dentro de mim é pura — Tu a criaste. Tu a formaste; e Tu a sopraste dentro de mim. Tu a preservaste dentro de mim, e Tu a tomarás de mim no futuro; e no futuro Tu a retornarás a mim para o tempo vindouro. Em todos os momentos em que minha alma está dentro de mim, sou grato perante Ti, oh Adonay meu Elohim, mestre de todas as obras. Bendito és Tu Adonay, que retorna a alma ao que resta dos mortos.</p>
<ul>
<li><strong>Ao se sentar à cama:</strong> Bendito és Tu Adonay nosso Elohim, Rei do Universo, que <strong>soltas os cativos</strong>.</li>
<li><strong>Ao colocar os pés no chão:</strong> …que <strong>separas a terra das águas</strong>.</li>
<li><strong>Ao se levantar:</strong> …que <strong>endireitas os curvados</strong>.</li>
<li><strong>Ao esfregar os olhos:</strong> …que <strong>concedes visão aos cegos</strong>.</li>
<li><strong>Ao ouvir o galo cantar (se aplicável):</strong> …que <strong>concedes compreensão ao galo para discernir entre dia e noite</strong>.</li>
</ul>`
        },
        {
          slug: "shema-minimo",
          title: "Recitação mínima e estudo",
          lessonType: "article",
          bodyHtml: `<p><strong>Importante:</strong> à noite, com muito sono, recite ao menos: <em>«Ouve, oh Israel, Adonay nosso Elohim, Adonay é UM.»</em></p>
<p><a href="https://www.chabad.org.br/biblioteca/artigos/shema/home.html" target="_blank" rel="noopener noreferrer">Shemá Israel — Chabad Brasil</a></p>
<p><strong>Shemá Israel</strong> (שְׁמַע יִשְׂרָאֵל — «Ouça Israel») abre a profissão de fé central do monoteísmo judaico (Devarim 6:4-9): <em>Shemá Yisrael Ad-nai Elochêinu Ad-nai Echad</em>.</p>
<p>Originalmente um único verso (Sukkot 42a, Berachot 13b). Hoje a recitação inclui Devarim 6:4-9, 11:13-21 e Bamidbar 15:37-41 — base de <strong>Arvit</strong> (noite) e <strong>Shacharit</strong> (manhã).</p>`
        },
        {
          slug: "shema-texto-integral",
          title: "Texto integral do Shemá",
          lessonType: "article",
          bodyHtml: `<p><strong>Ouve ó Israel, Ad-nai nosso D-us é Um.</strong><br/>(Em voz baixa:) Bendito é o Eterno e que seja bendito para sempre.</p>
<p><strong>Ve'Ahavta:</strong> Amarás o Eterno, Teu D-us, com todo o teu coração, com toda a tua alma e com todas as tuas forças. Estas coisas que eu te ordeno no dia de hoje estarão sobre o teu coração. As ensinarás diligentemente aos teus filhos e falarás delas quando estejas sentado em tua casa e quando andes no caminho, ao deitar e ao levantar. As atarás por sinal sobre a tua mão e serão <strong>tefilin</strong> entre os teus olhos. E as escreverás sobre os marcos (<strong>mezuzá</strong>) da tua casa e sobre os seus portões.</p>
<p><strong>Veaia im Shamoa:</strong> E sucederá que se obedecerem aos mandamentos… (Devarim 11) — chuvas a tempo, grão, mosto e azeite; cuidado com ídolos estranhos.</p>
<p>Ponham estas Minhas palavras nos vossos corações e nas vossas almas; atem-nas por sinal… As escreverás sobre os marcos da tua casa e sobre os teus portões, a fim de que se multipliquem os dias dos teus filhos sobre a terra…</p>
<p><strong>Vaiomer Ad-nai:</strong> Franjas (<strong>tzitzit</strong>) nos cantos das roupas, cordão azul, lembrança dos mandamentos, santidade. «Eu Sou o Eterno, vosso D-us, que vos saquei da terra do Egito…»</p>`
        }
      ]
    },
    {
      title: "Módulo 2 — Escritos",
      lessons: [
        {
          slug: "ketuvim-tehillim",
          title: "Salmos — Tehillim (áudio diário)",
          sectionTitle: "Salmos",
          sectionSortOrder: 1,
          lessonType: "article",
          bodyHtml: tehillimChecklist
        },
        {
          slug: "ketuvim-mishle",
          title: "Provérbios — Mishlé",
          sectionTitle: "Provérbios",
          sectionSortOrder: 2,
          lessonType: "article",
          bodyHtml: mishleChecklist
        }
      ]
    },
    {
      title: "Módulo 3 — Torá",
      lessons: [
        torahBlock("Bereshit — Gênesis", "torah-bereshit-1-9", "Capítulos 1 a 9", 1, "Capítulos 1 a 9"),
        torahBlock("Bereshit — Gênesis", "torah-bereshit-10-19", "Capítulos 10 a 19", 1, "Capítulos 10 a 19"),
        torahBlock("Bereshit — Gênesis", "torah-bereshit-20-29", "Capítulos 20 a 29", 1, "Capítulos 20 a 29"),
        torahBlock("Bereshit — Gênesis", "torah-bereshit-30-39", "Capítulos 30 a 39", 1, "Capítulos 30 a 39"),
        torahBlock("Bereshit — Gênesis", "torah-bereshit-40-50", "Capítulos 40 a 50", 1, "Capítulos 40 a 50"),
        torahBlock("Shemot — Êxodo", "torah-shemot-1-9", "Capítulos 1 a 9", 2, "Capítulos 1 a 9"),
        torahBlock("Shemot — Êxodo", "torah-shemot-10-19", "Capítulos 10 a 19", 2, "Capítulos 10 a 19"),
        torahBlock("Shemot — Êxodo", "torah-shemot-20-29", "Capítulos 20 a 29", 2, "Capítulos 20 a 29"),
        torahBlock("Shemot — Êxodo", "torah-shemot-30-40", "Capítulos 30 a 40", 2, "Capítulos 30 a 40"),
        torahBlock("Vayikra — Levítico", "torah-vaikra-1-9", "Capítulos 1 a 9", 3, "Capítulos 1 a 9"),
        torahBlock("Vayikra — Levítico", "torah-vaikra-10-19", "Capítulos 10 a 19", 3, "Capítulos 10 a 19"),
        torahBlock("Vayikra — Levítico", "torah-vaikra-20-27", "Capítulos 20 a 27", 3, "Capítulos 20 a 27"),
        torahBlock("Bamidbar — Números", "torah-bamidbar-1-9", "Capítulos 1 a 9", 4, "Capítulos 1 a 9"),
        torahBlock("Bamidbar — Números", "torah-bamidbar-10-19", "Capítulos 10 a 19", 4, "Capítulos 10 a 19"),
        torahBlock("Bamidbar — Números", "torah-bamidbar-20-29", "Capítulos 20 a 29", 4, "Capítulos 20 a 29"),
        torahBlock("Bamidbar — Números", "torah-bamidbar-30-36", "Capítulos 30 a 36", 4, "Capítulos 30 a 36"),
        torahBlock("Devarim — Deuteronômio", "torah-devarim-1-9", "Capítulos 1 a 9", 5, "Capítulos 1 a 9"),
        torahBlock("Devarim — Deuteronômio", "torah-devarim-10-19", "Capítulos 10 a 19", 5, "Capítulos 10 a 19"),
        torahBlock("Devarim — Deuteronômio", "torah-devarim-20-29", "Capítulos 20 a 29", 5, "Capítulos 20 a 29"),
        torahBlock("Devarim — Deuteronômio", "torah-devarim-30-34", "Capítulos 30 a 34", 5, "Capítulos 30 a 34")
      ]
    },
    {
      title: "Módulo 4 — Profetas",
      lessons: [
        {
          slug: "neviim-intro",
          title: "Neviim — trilha em montagem",
          lessonType: "article",
          bodyHtml: `<p>Leitura dos Profetas (Neviim) após a Torá. Os blocos por livro serão publicados aqui conforme a trilha avançar.</p>
<p>Consulte a <strong>Bíblia Hebraica</strong> na biblioteca do curso para a leitura paralela.</p>`
        }
      ]
    }
  ]
};
