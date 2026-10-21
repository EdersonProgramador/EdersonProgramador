export type PortfolioProductionItem = {
  kind: "production";
  name: string;
  description: string;
  url: string;
  tags: string[];
};

export type PortfolioGithubItem = {
  kind: "github";
  name: string;
  description: string;
  language: string;
  url: string;
  demoUrl?: string;
};

export const AGENCY_META = {
  name: "Ederson Programador",
  domain: "https://edersonprogramador.com.br",
  tagline: "Engenharia de produto digital — do primeiro commit ao domínio no ar.",
  github: "https://github.com/EdersonProgramador"
} as const;

/** Sites e produtos já publicados */
export const PORTFOLIO_PRODUCTION: PortfolioProductionItem[] = [
  {
    kind: "production",
    name: "ATLLY",
    description:
      "Plataforma completa para coaches e alunos: treinos, assinaturas, pagamentos (Pix/cartão), app mobile e painel administrativo.",
    url: "https://atlly.com.br",
    tags: ["Site em produção", "Sistema web"]
  },
  {
    kind: "production",
    name: "Nacional Divulga",
    description:
      "Portal de divulgação e gestão com foco em visibilidade de negócios, catálogo e operação web em escala.",
    url: "https://nacionaldivulga.com.br",
    tags: ["Site em produção", "Portal"]
  }
];

/** Todos os repositórios públicos em github.com/EdersonProgramador */
export const PORTFOLIO_GITHUB: PortfolioGithubItem[] = [
  {
    kind: "github",
    name: "AppTreino",
    description: "Monorepo ATLLY — web, API, mobile, checkout e integrações de pagamento.",
    language: "TypeScript",
    url: "https://github.com/EdersonProgramador/AppTreino",
    demoUrl: "https://atlly.com.br"
  },
  {
    kind: "github",
    name: "rede-social-init",
    description: "Rede social com feed, autenticação e chat em tempo real.",
    language: "TypeScript",
    url: "https://github.com/EdersonProgramador/rede-social-init"
  },
  {
    kind: "github",
    name: "Fullstack-IA",
    description: "Projetos e experimentos full stack com integração de IA.",
    language: "JavaScript",
    url: "https://github.com/EdersonProgramador/Fullstack-IA"
  },
  {
    kind: "github",
    name: "AppClima",
    description: "Aplicação de previsão do tempo com interface moderna.",
    language: "TypeScript",
    url: "https://github.com/EdersonProgramador/AppClima"
  },
  {
    kind: "github",
    name: "Guia-Git",
    description: "Guia de Git para iniciantes — material didático.",
    language: "Markdown",
    url: "https://github.com/EdersonProgramador/Guia-Git"
  },
  {
    kind: "github",
    name: "Projeto-Painel-de-despesas",
    description: "Painel de despesas responsivo publicado no GitHub Pages.",
    language: "HTML",
    url: "https://github.com/EdersonProgramador/Projeto-Painel-de-despesas",
    demoUrl: "https://edersonprogramador.github.io/Projeto-Painel-de-despesas/"
  },
  {
    kind: "github",
    name: "cursophp",
    description: "Exercícios e anotações do curso de PHP.",
    language: "PHP",
    url: "https://github.com/EdersonProgramador/cursophp"
  },
  {
    kind: "github",
    name: "Gemini-prompt",
    description: "Coleção de prompts e testes com modelos Gemini.",
    language: "Docs",
    url: "https://github.com/EdersonProgramador/Gemini-prompt"
  },
  {
    kind: "github",
    name: "Cart-o-de-perfil-responsivo-em-HTML-e-CSS",
    description: "Cartão de perfil responsivo em HTML e CSS puro.",
    language: "HTML/CSS",
    url: "https://github.com/EdersonProgramador/Cart-o-de-perfil-responsivo-em-HTML-e-CSS"
  },
  {
    kind: "github",
    name: "1-Profile-Card",
    description: "Componente visual de profile card com CSS avançado.",
    language: "CSS",
    url: "https://github.com/EdersonProgramador/1-Profile-Card"
  },
  {
    kind: "github",
    name: "EdersonProgramador",
    description: "Perfil e README especial do GitHub.",
    language: "Profile",
    url: "https://github.com/EdersonProgramador/EdersonProgramador"
  },
  {
    kind: "github",
    name: "projeto-discover-1",
    description: "Projeto Discover — layout e estilização front-end.",
    language: "CSS",
    url: "https://github.com/EdersonProgramador/projeto-discover-1"
  },
  {
    kind: "github",
    name: "desenvolve",
    description: "Material e entregas do programa Desenvolve.",
    language: "Docs",
    url: "https://github.com/EdersonProgramador/desenvolve"
  },
  {
    kind: "github",
    name: "O-plano-de-100mil",
    description: "Planejamento e estudos de negócio digital.",
    language: "Docs",
    url: "https://github.com/EdersonProgramador/O-plano-de-100mil"
  },
  {
    kind: "github",
    name: "Php_do_zero_ao_profissional",
    description: "Trilha PHP do zero ao profissional — código e exercícios.",
    language: "PHP",
    url: "https://github.com/EdersonProgramador/Php_do_zero_ao_profissional"
  },
  {
    kind: "github",
    name: "Javascript-B7web",
    description: "Projetos JavaScript do curso B7Web.",
    language: "JavaScript",
    url: "https://github.com/EdersonProgramador/Javascript-B7web"
  },
  {
    kind: "github",
    name: "HTML5-CSS3",
    description: "Referência didática de HTML5 e CSS3 em sequência.",
    language: "HTML",
    url: "https://github.com/EdersonProgramador/HTML5-CSS3"
  },
  {
    kind: "github",
    name: "Projeto-Awax",
    description: "Landing page e layout estático Awax.",
    language: "HTML",
    url: "https://github.com/EdersonProgramador/Projeto-Awax"
  },
  {
    kind: "github",
    name: "MedCenter",
    description: "Layout institucional MedCenter — HTML/CSS responsivo.",
    language: "HTML",
    url: "https://github.com/EdersonProgramador/MedCenter"
  }
];

/** @deprecated use PORTFOLIO_GITHUB */
export const PORTFOLIO_REPOS = PORTFOLIO_GITHUB;
