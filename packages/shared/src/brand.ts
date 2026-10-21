/** Identidade visual — guia Ederson Programador (tecnológica). */

export const BRAND_IDENTITY = {
  name: "Ederson Programador",
  nameDisplay: {
    primary: "EDERSON",
    secondary: "PROGRAMADOR"
  },
  monogram: "EP",
  domain: "edersonprogramador.com.br",
  domainUrl: "https://edersonprogramador.com.br",
  slogan: "Soluções digitais que geram resultados",
  sloganSecondary: "Transformando ideias em soluções digitais",
  tagline: "Soluções digitais que geram resultados",
  values: ["Tecnologia", "Confiança", "Inovação", "Resultados"] as const,
  servicePillars: [
    { id: "systems", label: "Desenvolvimento de sistemas" },
    { id: "ai", label: "Inteligência artificial" },
    { id: "automation", label: "Automações e integrações" },
    { id: "platforms", label: "Sites e plataformas" },
    { id: "projects", label: "Projetos digitais" }
  ] as const,
  colors: {
    primary: "#38bdf8",
    primarySoft: "#7dd3fc",
    primaryDeep: "#2563eb",
    accentIndigo: "#1e40af",
    surface: "#020617",
    surfaceElevated: "#0f172a",
    text: "#f0f4f8",
    textMuted: "#94a3b8"
  },
  assets: {
    favicon: "/favicon.svg",
    logoMark: "/logo-mark.svg",
    logoHorizontal: "/brand/logo-ederson-programador.png",
    ogImage: "/og-image.svg"
  }
} as const;
