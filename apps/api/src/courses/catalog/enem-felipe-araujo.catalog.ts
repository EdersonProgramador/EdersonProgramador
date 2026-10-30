/** Cronograma ENEM — Felipe Araújo (PDF 452378109). Trilha completa para admin/academia. */

export type EnemCronogramaLesson = {
  slug: string;
  title: string;
  lessonType?: "article";
  bodyHtml?: string;
  sectionTitle: string;
  sectionSortOrder: number;
};

export type EnemCronogramaModule = {
  title: string;
  lessons: EnemCronogramaLesson[];
};

export type EnemCronogramaCatalog = {
  slug: string;
  title: string;
  summary: string;
  coverUrl?: string;
  sortOrder: number;
  catalogVersion: number;
  modules: EnemCronogramaModule[];
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(title: string) {
  return title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 52);
}

function cronogramaLesson(
  moduleKey: string,
  index: number,
  sectionTitle: string,
  sectionSortOrder: number,
  title: string,
  extraHtml = ""
): EnemCronogramaLesson {
  const slug = `${moduleKey}-${String(index + 1).padStart(3, "0")}-${slugify(title)}`.slice(0, 80);
  const bodyHtml = `<p class="course-text-muted text-sm">Cronograma <strong>ENEM — Felipe Araújo</strong> · ${escapeHtml(sectionTitle)}</p>
<h3>${escapeHtml(title)}</h3>
${extraHtml}
<p>Marque como concluída quando finalizar o estudo deste tópico na sua rotina.</p>`;
  return {
    slug,
    title,
    lessonType: "article",
    bodyHtml,
    sectionTitle,
    sectionSortOrder
  };
}

function buildLessons(
  moduleKey: string,
  sections: { sectionTitle: string; sectionSortOrder: number; topics: string[]; extraForTopic?: Record<string, string> }[]
): EnemCronogramaLesson[] {
  const lessons: EnemCronogramaLesson[] = [];
  let index = 0;
  for (const sec of sections) {
    for (const title of sec.topics) {
      const extra = sec.extraForTopic?.[title] ?? "";
      lessons.push(cronogramaLesson(moduleKey, index++, sec.sectionTitle, sec.sectionSortOrder, title, extra));
    }
  }
  return lessons;
}

const FILMES_1 = [
  "Preciosa - Uma História de Esperança",
  "Uma prova de amor Mother",
  "Entre os Muros da Escola",
  "Coringa",
  "Guerras do Brasil.doc"
];

const FILMES_2 = [
  "Democracia em Vertigem",
  "Interestelar",
  "A Rede Social",
  "Bastardos Inglórios",
  "As Sufragistas",
  "Os suspeitos",
  "Uma Noite de 12 Anos",
  "Quanto Tempo o Tempo Tem",
  "Nise: O Coração da Loucura",
  "Filhos da Esperança",
  "Getúlio",
  "Vida Maria (Curta / Animação)",
  "12 Anos de Escravidão",
  "Parasita",
  "Horas de Desespero"
];

const BIO_GENETICA = [
  "Citogenética e os componentes do núcleo",
  "Divisão Celular: Mitose e Meiose",
  "Código Genético e a Síntese Proteica",
  "Introdução à genética: Genes, 1ª Lei de Mendel e Probabilidade Genética",
  "Heredograma, Cruzamento Teste e Retrocruzamento",
  "Ausência de Dominância, Codominância e Genes Letais",
  "Sistema ABO, Sistema Rh e MN",
  "Segunda Lei de Mendel",
  "Interação Gênica e Pleiotropia",
  "Herança ligada ao sexo e Doenças relacionadas ao cromossomo X",
  "Linkage e Mutações Gênicas",
  "Engenharia Genética: Técnicas de PCR, Transgênicos e DNA recombinante",
  "Clonagem, Células Tronco e ética na genética",
  "Espermatogênese e Ovogênese",
  "Ciclo Menstrual e Anticoncepção",
  "Matriz extracelular",
  "Anticorpos, Vacina e Soro",
  "Homeostase e Morfostase",
  "Sistema Cardiovascular e Linfático",
  "Sistema Urinário e Sistema Excretor",
  "Sistema Nervoso/Sensorial e Sistema Músculo-Esquelético",
  "Introdução à Citologia: Célula Eucarionte X Procarionte"
];

const BIO_ECOLOGIA = [
  "Ciclos Biogeoquímicos (água, carbono, oxigênio, nitrogênio e fósforo)",
  "Relações Ecológicas Harmônicas e Desarmônicas",
  "Cadeia e Teia Alimentar",
  "Pirâmide Ecológica e Produtividade nos Ecossistemas",
  "Bioacumulação / Magnificação Trófica",
  "Ecologia das Populações: Fatores abióticos, Habitat e Nicho Ecológico",
  "Ecologia das Populações: Dinâmica Populacional e Potencial Biótico",
  "Paleontologia, Fósseis e Órgãos Vestigiais",
  "Teorias Evolucionistas: Lamarckismo, Darwinismo e Neodarwinismo",
  "Equilíbrio de Hardy-Weinberg"
];

const QUIM_GERAL = [
  "Substâncias Puras e Misturas",
  "Separação de Misturas",
  "Atomística: Composição do Átomo e Propriedades Interatômicas",
  "Capacidade de Solvatação da Água",
  "Entalpias de Reação, Combustão e Dissolução",
  "Tipos de Radioatividade e as Reações Nucleares",
  "Fusão e Fissão Nuclear",
  "Elementos Radioativos e Geração de Energia a partir da Radioatividade",
  "Estabilidade e Tempo de Meia-Vida",
  "Química Ambiental e Poluição Atmosférica"
];

const QUIM_SOLUCOES = [
  "pH",
  "Hidrólise Salina",
  "Solução Tampão e a Chuva Ácida",
  "Eletrólise Ígnea e Aquosa",
  "Eletrólise Quantitativa",
  "Processos de Galvanização e Eletrodeposição",
  "Leis de Faraday"
];

const FILOSOFIA = [
  "Mito e Senso Comum",
  "O Surgimento da Filosofia",
  "O Contexto Sociopolítico na Grécia",
  "O Período Pré-Socrático",
  "Tales de Mileto",
  "Anaximandro e Anaxímenes",
  "Heráclito e Parmênides",
  "O Período Clássico",
  "Os Sofistas",
  "Sócrates e o Método Socrático",
  "Platão e a Democracia",
  "Mito da Caverna",
  "Aristóteles",
  "Platão X Aristóteles",
  "A Física e a Metafísica de Aristóteles",
  "Escola Peripatética",
  "Lógica",
  "Período Helenista",
  "Epicurismo",
  "Estoicismo",
  "Cinismo",
  "Filosofia Medieval",
  "Renascimento e Revolução Científica",
  "Racionalismo",
  "René Descartes",
  "Empirismo",
  "John Locke",
  "Empirismo Atual - Neopositivismo",
  "Liberalismo",
  "Teoria Kantiana",
  "Iluminismo e Filósofos do Iluminismo",
  "Ética, Moral e Valores",
  "Utilitarismo e Bioética",
  "Maquiavel e a Ciência Política",
  "Contratualismo: Hobbes, Locke e Rousseau",
  "Montesquieu e o Espírito das Leis",
  "Divisão dos Três Poderes",
  "Escola de Frankfurt",
  "Teoria da Ação Comunicativa",
  "Karl Marx e a Ideologia",
  "Materialismo Histórico e Luta de Classes",
  "Nietzsche e o Niilismo",
  "Fenomenologia e Estruturalismo",
  "Foucault e o Poder",
  "Existencialismo: Heidegger e Sartre",
  "Filosofia Contemporânea",
  "Indústria Cultural",
  "Schopenhaeur e Freud"
];

const SOCIOLOGIA = [
  "O Surgimento da Sociologia: Contexto Histórico-Social",
  "Augusto Comte e o Positivismo",
  "Lei dos Três Estados",
  "Émile Durkheim: Fatos Sociais",
  "Suícidio e Solidariedade em Durkheim",
  "Max Weber: Ação Social",
  "Ética Protestante e o Espírito Do Capitalismo",
  "Sociologia e Globalização",
  "Etnocentrismo",
  "Evolucionismo X Relativismo",
  "Cultura e Identidade",
  "Indústria Cultural: Adorno e Horkheimer",
  "Cultura de Massa",
  "Cultura Material e Imaterial",
  "Patrimônio Cultural Brasileiro",
  "Cultura Popular e Erudita",
  "Processo de Socialização e as Instituições Sociais",
  "Nacionalismo",
  "Socialização e Racismo",
  "Relações Raciais no Brasil: Gilberto Freyre e Florestan Fernandes",
  "Poder em Weber",
  "Tipos de Dominação Legítima",
  "Poder em Maquiavel",
  "Estado e Governo",
  "Constituição de 1988 - Constituição Cidadã",
  "Sistemas de Governo",
  "Modelos de Estado: Absolutismo, Socialismo e Fascismo",
  "Contratualismo: Estado de Natureza e o Contrato Social",
  "Cidadania e os Direitos dos Indivíduos",
  "Marshall e a Análise do Conceito de Cidadania",
  "Declaração Universal dos Direitos Humanos",
  "Precarização do Trabalho",
  "Taylorismo, Fordismo e Toyotismo",
  "Trabalho em Durkheim e Trabalho em Marx",
  "Novas Relações de Trabalho",
  "Movimentos Socioculturais",
  "Sociologia Brasileira e Questão Indígena",
  "Estratificação e Mobilidade Social",
  "Sociedade em Rede e Sociedade Informacional",
  "Zygmunt Bauman e a Modernidade Líquida",
  "Sociologia Urbana e Atitude Blasé",
  "Mulheres e Sociedade",
  "O Movimento Sufragista no Brasil",
  "Karl Marx: Classes Sociais",
  "Materialismo Histórico, Alienação e Mais-Valia",
  "Antropologia",
  "Desigualdade Social",
  "O Índice de Gini e a Medida da Desigualdade Mundial",
  "Questões de Gênero e Diversidade Cultural",
  "Sociologia e Meio Ambiente"
];

const GEO_FISICA = [
  "Eras Geológicas e Estrutura interna da Terra",
  "Formação e Tipos de Solos",
  "Impactos Ambientais nos Solos",
  "Escala Cartográfica",
  "Tipos de Chuvas",
  "Climograma",
  "Pressão atmosférica",
  "Tipos de Ventos",
  "Atmosfera",
  "Climas do Mundo",
  "Elementos e Fatores do Clima",
  "Fenômenos e Mudanças Climáticas",
  "Biomas Brasileiros",
  "Domínios Morfoclimáticos",
  "Distribuição de Água no Mundo",
  "Pegada Hídrica, Água Virtual e Ciclo Hidrográfico",
  "Bacias Hidrográficas do Brasil",
  "Fontes de Energia",
  "Consumo de Energia no Brasil",
  "Regionalismo: Aspectos Físicos, Populacionais e Econômicos do NORDESTE",
  "Regionalismo: Aspectos Físicos, Populacionais e Econômicos do NORTE",
  "Regionalismo: Aspectos Físicos, Populacionais e Econômicos do CENTRO-OESTE",
  "Regionalismo: Aspectos Físicos, Populacionais e Econômicos do SUDESTE",
  "Regionalismo: Aspectos Físicos, Populacionais e Econômicos do SUL"
];

const GEO_HUMANA = [
  "Migração: Fatores migratórios e Tipos de migração",
  "Fluxos Migratórios Principais",
  "Migrações Internacionais e o Brasil",
  "Migrações Internas no Brasil",
  "Características Gerais da População brasileira",
  "Modelos de Produção Industrial",
  "Revoluções Industriais",
  "Industrialização no Brasil: A evolução da Atividade Industrial",
  "Regiões Industrializadas do Brasil e do Mundo",
  "Cinturões Verdes, Agricultura Irrigada e Agroecologia",
  "Estrutura Fundiária, Reforma Agrária e os Conflitos no Campo",
  "Transgênicos e Orgânicos",
  "Modernização Agrícola e Complexos Agroindustriais",
  "A Agropecuária e o Agronegócio no Brasil",
  "Transporte no Brasil e Mobilidade Urbana",
  "As questões ambientais no Brasil e a Ação Antrópica",
  "DIT e Fases do Capitalismo",
  "Amazônia",
  "Geopolítica do pós-guerra: A velha ordem mundial",
  "Globalização",
  "Blocos Econômicos I",
  "Blocos Econômicos II",
  "Tensões Geopolíticas Atuais: AMÉRICA",
  "Terrorismo no Mundo Atual",
  "Geopolítica e Meio Ambiente",
  "Geopolítica: Regionalização Mundial",
  "Tensões Geopolíticas Atuais: EUROPA",
  "Tensões Geopolíticas Atuais: ÁSIA",
  "Tensões Geopolíticas Atuais: ÁFRICA",
  "Tensões Geopolíticas Atuais: ORIENTE MÉDIO I",
  "O Socialismo de Mercado na China",
  "EUA: Superpotência Global",
  "Desafios do Século XXI e Organismos Internacionais",
  "Tensões Geopolíticas Atuais: ORIENTE MÉDIO II"
];

const HIST_GERAL = [
  "Expansão Marítima e o Descobrimento da América",
  "A Revolução de Avis e a Formação de Portugal",
  "A História dos Hebreus e a Civilização Hebraica",
  "Os Reinos Africanos",
  "Feudalismo e Cultura Medieval",
  "Igreja Católica na Idade Média",
  "Peste Negra, Guerra dos 100 anos e Declínio Feudal",
  "Absolutismo e Mercantilismo",
  "Iluminismo e Liberalismo",
  "Revoluções Inglesas",
  "Independência dos EUA e a Guerra de Secessão",
  "Primavera dos Povos",
  "Tratado de Versalhes",
  "Primeira Guerra Mundial",
  "Fascismo, Nazismo e Franquismo",
  "Guerra Civil Espanhola",
  "Guerra Fria",
  "Independência da Indochina e Guerra do Vietnã",
  "Descolonização da África e da Ásia",
  "Primavera Árabe",
  "A Civilização Maia, O Império Asteca e o Império Inca"
];

const HIST_BR = [
  "A Pré-História Do Brasil: Do Povoamento às Sociedades",
  "A Expansão Marítima e Comercial e o Descobrimento do Brasil",
  "América Espanhola e América Inglesa",
  "Povos Indígenas No Brasil: Identidade Indígena",
  "O Tráfico Negreiro e a Diáspora Africana",
  "Capitanias Hereditárias e o Governo-Geral",
  "As Feitorias e o Pau-Brasil",
  "União Ibérica e as Invasões Estrangeiras",
  "Entradas, Bandeiras E Monções",
  "Brasil Colônia: Expansão Territorial Brasileira",
  "Os jesuítas no Brasil",
  "O Ciclo da Cana-de-Açúcar e a Economia Açucareira",
  "Brasil Colônia: Atividades Econômicas Complementares",
  "Comércio Triangular",
  "Mineração e o Período Pombalino",
  "Os Quilombos e a Resistência Negra",
  "Revoltas Nativistas",
  "Revoltas Separatistas",
  "A chegada da Família Real e o Período Joanino",
  "Revolução Pernambucana",
  "Independência do Brasil",
  "Período Regencial e as Revoltas Regenciais",
  "Guerra Do Paraguai",
  "República Oligárquica - Governos e Econômia",
  "Revoltas da República Velha: Canudos, Contestado, Vacina e Chibata",
  "O Cangaço e o Banditismo Social",
  "República Oligárquica: Coluna Prestes e Crise da República Velha",
  "República Populista: Dutra e Vargas",
  "República Populista: Café Filho e JK",
  "República Populista: Jânio Quadros e João Goulart"
];

const ESPANHOL = [
  "Introducción a la cultura hispanoamericana",
  "Los verbos",
  "El Presente del Indicativo",
  "Los colores",
  "Los contrarios",
  "Sitios turísticos y comerciales",
  "Heterosemánticos",
  "Las profesiones",
  "El cuerpo humano",
  "Los artículos y el género",
  "Los adverbios",
  "Pretéritos del Indicativo",
  "Apócope",
  "Las preposiciones",
  "Los números",
  "Las conjunciones",
  "Muy x mucho",
  "Tilde diacrítica",
  "Sustantivos abstractos – Verbos gustar, parecer, encantar",
  "Partes y objetos de la casa",
  "Los alimentos",
  "Los pronombres",
  "El Futuro Imperfecto y el Condicional",
  "El Subjuntivo",
  "Textos Periodísticos",
  "Historietas y cómics",
  "Falsos Amigos en español 1",
  "Estrategia de lectura en español",
  "Interpretación de texto",
  "Las prendas de vestir",
  "La familia",
  "Expresiones lingüísticas",
  "Las medicinas",
  "Los fenómenos naturales",
  "Las horas",
  "Los animales",
  "Las finanzas",
  "Los materiales",
  "Falsos Amigos en español 2",
  "Análisis de Fotos y Pinturas"
];

const LINGUAGENS = [
  "Função e Impacto das Novas Mídias",
  "Gêneros Digitais",
  "Meios de Comunicação e a Indústria Cultural",
  "Redes Sociais e Relações na Sociedade Atual",
  "Internet, as Organizações Políticas e a Censura",
  "Marco Civil da Internet",
  "Ética na internet",
  "Privacidade na Internet",
  "Crime Digital",
  "Inclusão Digital e Acesso Democrático",
  "Padrão estético contemporâneo",
  "Influência da mídia no corpo",
  "Obesidade",
  "Atletismo",
  "Basquetebol",
  "Futebol / Futsal",
  "Ginástica artística",
  "Handebol",
  "Voleibol",
  "O papel Social do Funk no Brasil",
  "O papel social do Esporte",
  "Lutas",
  "Jogos",
  "Brincadeiras",
  "O samba",
  "O Rap como Manifestação Cultural",
  "Exercício Físico e Saúde",
  "Condicionamento e Esforço Físico",
  "Vivência Crítica e Emancipada do Lazer",
  "Práticas Corporais e Autonomia",
  "O Corpo Como Expressão Artística e Cultural",
  "Dança e Educação",
  "Capoeira",
  "Esportes Adaptados",
  "Danças Folclóricas",
  "Danças Africanas"
];

const REDACAO = [
  "Introdução: Funções e Estratégias",
  "Tese: Funções e Estratégias",
  "Conclusão: Funções e Estratégias",
  "Título: Funções e Estratégias",
  "Análise de Redações Exemplares 1",
  "Análise de Redações Exemplares 2",
  "Estrutura Dissertativa: Microestrutura e macroestrutura",
  "Métodos de raciocínio: indução e dedução",
  "Métodos de raciocínio: dialética e falhas na argumentação",
  "Concisão no Parágrafo e Progressão Textual",
  "O Tema na Redação do ENEM: Particularidades, Interpretação e Delimitação",
  "Projeto de Texto e Marca de Autoria na Produção Textual",
  "Fuga do Tema X Tangência",
  "Aspectos formais relevantes e Gramática Aplicada à Redação",
  "Mecanismos Estruturais no Desenvolvimento",
  "Uso da vírgula: regra geral, casos especiais e exercícios",
  "Uso da crase: regra geral, casos especiais e exercícios",
  "Folha de redação ENEM — orientações oficiais"
];

const TEMAS_REDACAO = [
  "Os efeitos da desinformação e da espetacularização midiática nas sociedades contemporâneas",
  "Desafios para a conciliação da Biotecnologia e a Ética",
  "Os limites entre humor e ofensa",
  "A exploração trabalhista na sociedade moderna",
  "Cibercondria – a doença da era digital",
  "Ensino sobre gênero e diversidade sexual nas escolas: necessidade ou doutrinação?",
  "Desafios da alfabetização tecnológica para os idosos",
  "Êxodo rural e suas consequências sociais",
  "Aleitamento materno em questão no Brasil",
  "Funk: expressão de uma cultura ou apenas mais um produto da mídia",
  "A importância da educação financeira na vida do cidadão",
  "Desaparecimento de pessoas no Brasil",
  "O ensino da história e cultura africana no Brasil: conquistas e desafios",
  "Doenças negligenciadas pela indústria farmacêutica: causas e consequências",
  "A educação como solução para ressocialização de detentos: utopia ou realidade?",
  "Limites entre a liberdade de expressão e o politicamente correto",
  "Caminhos para combater a epidemia de crack no Brasil",
  "Humanização no Atendimento à Saúde",
  "Os efeitos da má gestão hídrica no setor energético brasileiro",
  "Os desafios da produção artística no Brasil",
  "A tecnologia no combate à criminalidade",
  "Lixo eletrônico e impactos socioambientais",
  "A sociedade atual e as relações de trabalho: o fenômeno da uberização",
  "O futuro do trabalho: automação e aspectos sociais",
  "As fronteiras simbólicas e exclusão dos sujeitos na sociedade atual",
  "Perigos da obsolescência programada",
  "Tatuagem: modismo ou formação de identidade",
  "Os desafios dos professores brasileiros na contemporaneidade",
  "Preservação da Amazônia: Desafio brasileiro ou internacional?",
  "O desperdício de alimentos no Brasil",
  "A importância do movimento feminista na luta pelos direitos das mulheres",
  "Adoção de crianças no Brasil: avanços e desafios",
  "Os fatores motivadores da violência escolar",
  "O uso de celular em sala de aula: ferramenta de aprendizagem ou distração?",
  "Os bens culturais digitais tendem a enfraquecer os bens culturais tradicionais?",
  "Preservação do patrimônio histórico cultural brasileiro"
];

export const ENEM_FELIPE_ARAUJO_CATALOG: EnemCronogramaCatalog = {
  slug: "enem-cronograma-felipe-araujo",
  title: "ENEM — Cronograma Felipe Araújo",
  summary:
    "Trilha completa baseada no cronograma F3lipearaujo: metas e filmes, Ciências da Natureza, Matemática, Humanas, Linguagens, Redação, competências e temas de prática.",
  sortOrder: 5,
  catalogVersion: 1,
  modules: [
    {
      title: "Introdução",
      lessons: buildLessons("intro", [
        {
          sectionTitle: "Como usar",
          sectionSortOrder: 1,
          topics: ["Visão geral do cronograma ENEM"],
          extraForTopic: {
            "Visão geral do cronograma ENEM": `<p>Este curso reproduz a sequência de estudos do material <em>Cronograma Felipe Araújo</em>. Avance módulo a módulo e marque cada tópico conforme concluir.</p>`
          }
        },
        {
          sectionTitle: "Competências",
          sectionSortOrder: 2,
          topics: [
            "Competência I — domínio da norma culta",
            "Competência II — compreensão da proposta e repertório",
            "Competência III — organização de informações e argumentos",
            "Competência IV — coesão e conectivos",
            "Competência V — proposta de intervenção"
          ]
        }
      ])
    },
    {
      title: "Metas",
      lessons: buildLessons("metas", [
        { sectionTitle: "Metas", sectionSortOrder: 1, topics: ["Metas de estudo"] },
        { sectionTitle: "Filmes recomendados", sectionSortOrder: 2, topics: FILMES_1 },
        { sectionTitle: "Filmes recomendados (continuação)", sectionSortOrder: 3, topics: FILMES_2 }
      ])
    },
    {
      title: "Biologia",
      lessons: buildLessons("biologia", [
        { sectionTitle: "Genética, citologia e fisiologia", sectionSortOrder: 1, topics: BIO_GENETICA },
        { sectionTitle: "Ecologia e evolução", sectionSortOrder: 2, topics: BIO_ECOLOGIA }
      ])
    },
    {
      title: "Química",
      lessons: buildLessons("quimica", [
        { sectionTitle: "Química geral e ambiental", sectionSortOrder: 1, topics: QUIM_GERAL },
        { sectionTitle: "Soluções, pH e eletroquímica", sectionSortOrder: 2, topics: QUIM_SOLUCOES }
      ])
    },
    {
      title: "Matemática",
      lessons: buildLessons("matematica", [
        { sectionTitle: "Funções", sectionSortOrder: 1, topics: ["Introdução à Função Quadrática"] }
      ])
    },
    {
      title: "Filosofia",
      lessons: buildLessons("filosofia", [{ sectionTitle: "História da filosofia", sectionSortOrder: 1, topics: FILOSOFIA }])
    },
    {
      title: "Sociologia",
      lessons: buildLessons("sociologia", [{ sectionTitle: "Teorias e Brasil", sectionSortOrder: 1, topics: SOCIOLOGIA }])
    },
    {
      title: "Geografia",
      lessons: buildLessons("geografia", [
        { sectionTitle: "Geografia física e regional", sectionSortOrder: 1, topics: GEO_FISICA },
        { sectionTitle: "Geografia humana e geopolítica", sectionSortOrder: 2, topics: GEO_HUMANA }
      ])
    },
    {
      title: "História Geral",
      lessons: buildLessons("hist-geral", [
        {
          sectionTitle: "História mundial",
          sectionSortOrder: 1,
          topics: HIST_GERAL,
          extraForTopic: {
            "Primavera Árabe":
              "<p><em>Nota do cronograma:</em> sugere-se iniciar o estudo da História do Brasil a partir do módulo seguinte.</p>"
          }
        }
      ])
    },
    {
      title: "História do Brasil",
      lessons: buildLessons("hist-brasil", [{ sectionTitle: "Do povoamento à República", sectionSortOrder: 1, topics: HIST_BR }])
    },
    {
      title: "Literatura",
      lessons: buildLessons("literatura", [
        { sectionTitle: "Literatura", sectionSortOrder: 1, topics: ["Introdução à Literatura"] }
      ])
    },
    {
      title: "Inglês",
      lessons: buildLessons("ingles", [
        {
          sectionTitle: "Textos em inglês",
          sectionSortOrder: 1,
          topics: ["Journalistic texts", "Comic strips and cartoons", "Technical texts", "Advertisements", "Interrogative adverbs"]
        }
      ])
    },
    {
      title: "Espanhol",
      lessons: buildLessons("espanhol", [{ sectionTitle: "Gramática e interpretação", sectionSortOrder: 1, topics: ESPANHOL }])
    },
    {
      title: "Linguagens, mídia e educação física",
      lessons: buildLessons("linguagens", [{ sectionTitle: "LC e práticas corporais", sectionSortOrder: 1, topics: LINGUAGENS }])
    },
    {
      title: "Redação ENEM",
      lessons: buildLessons("redacao", [{ sectionTitle: "Técnicas dissertativas", sectionSortOrder: 1, topics: REDACAO }])
    },
    {
      title: "Temas de redação (prática)",
      lessons: buildLessons("temas", [{ sectionTitle: "Sugestões de tema", sectionSortOrder: 1, topics: TEMAS_REDACAO }])
    }
  ]
};
