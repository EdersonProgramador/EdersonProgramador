/** Identidade visual — tokens únicos para web, e-mail e documentos. */

export const BRAND_IDENTITY = {
  name: "Ederson Programador",
  monogram: "EP",
  domain: "edersonprogramador.com.br",
  domainUrl: "https://edersonprogramador.com.br",
  tagline: "Engenharia de produto digital — do primeiro commit ao domínio no ar.",
  colors: {
    primary: "#38bdf8",
    primarySoft: "#7dd3fc",
    primaryDeep: "#0ea5e9",
    accentIndigo: "#818cf8",
    surface: "#020617",
    surfaceElevated: "#0f172a",
    text: "#f0f4f8",
    textMuted: "#94a3b8"
  },
  assets: {
    favicon: "/favicon.svg",
    logoMark: "/logo-mark.svg",
    ogImage: "/og-image.svg"
  }
} as const;
