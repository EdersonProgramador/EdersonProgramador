export type AgencyRole = "ADMIN" | "CLIENT" | "FREELANCER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AgencyRole;
  company?: string | null;
  github?: string | null;
};

export function homePathForRole(role: AgencyRole): string {
  switch (role) {
    case "ADMIN":
      return "/app/admin";
    case "FREELANCER":
      return "/app/freelancer";
    case "CLIENT":
    default:
      return "/app/cliente";
  }
}

export const CONTRACT_DEFAULTS = {
  title: "Contrato de Prestação de Serviços de Desenvolvimento de Site/Sistema",
  totalValueCents: 300_000,
  entryValueCents: 150_000,
  technicalHourCents: 5_000,
  estimatedDays: 40,
  lateFeePercent: 5,
  lateInterestPercentMonthly: 2,
  clientRescissionPenaltyPercent: 25,
  phases: [
    {
      key: "DESIGN",
      label: "1ª fase — Criação de toda a parte gráfica do projeto (pré-aprovação da CONTRATANTE)",
      days: 10
    },
    {
      key: "LOGIC",
      label:
        "2ª fase — Desenvolvimento da lógica e funcionamento, com base na parte gráfica aprovada",
      days: 15
    },
    {
      key: "CONTENT",
      label: "3ª fase — Ajuste do conteúdo fornecido pela CONTRATANTE ao projeto desenvolvido",
      days: 10
    },
    {
      key: "DEPLOY",
      label: "4ª fase — Configuração e publicação do projeto",
      days: 5
    }
  ] as const
} as const;

export type ContractPhaseKey = (typeof CONTRACT_DEFAULTS.phases)[number]["key"];

export { CONTRACT_COPY } from "./contract-copy.js";
export { MARKETING_COPY } from "./marketing-copy.js";
export { LEGAL_NOTICES } from "./legal-notices.js";

export {
  AGENCY_META,
  PORTFOLIO_GITHUB,
  PORTFOLIO_PRODUCTION,
  PORTFOLIO_REPOS,
  type PortfolioGithubItem,
  type PortfolioProductionItem
} from "./portfolio.js";

export function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
