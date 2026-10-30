import {
  entryValueCentsForTier,
  JOURNEY_PHASES,
  PACKAGE_TIER_CONFIG,
  type PackageTierId
} from "./project-journey.js";

function brl(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export const AGENCY_CONTRACT_VERSION = "app-zero-v1";

export const AGENCY_FUNNEL_COPY = {
  steps: [
    { key: "live", label: "Live" },
    { key: "account", label: "Conta" },
    { key: "package", label: "Pacote" },
    { key: "contract", label: "Contrato" },
    { key: "delivery", label: "Entrega" }
  ],
  client: {
    title: "Contratar App do Zero ao Lançamento",
    subtitle: "Após a live, escolha o pacote, assine o contrato digital e entre na jornada do projeto.",
    liveRequired:
      "Para contratar pelo funil pós-live, confirme sua participação na aula ou aguarde liberação pelo administrador.",
    selectPackage: "Selecione o pacote",
    hireCta: "Continuar para o contrato",
    signTitle: "Contrato digital",
    signSubtitle: "Leia o resumo abaixo. Ao assinar, o projeto entra na fase de entrega (Diagnóstico).",
    signCta: "Assinar e iniciar projeto",
    signFieldLabel: "Nome completo (como no contrato)",
    signedSuccess: "Contrato assinado. Seu projeto foi ativado — acompanhe as etapas abaixo.",
    pendingContract: "Assinatura pendente",
    goToProject: "Ir para o projeto"
  },
  admin: {
    liveToggle: "Participou da live",
    funnelSource: "Origem do funil"
  }
} as const;

export function contractSummaryForTier(tier: PackageTierId) {
  const cfg = PACKAGE_TIER_CONFIG[tier];
  const phases = JOURNEY_PHASES.map((p) => p.shortLabel).join(" → ");
  return {
    tier,
    tierLabel: cfg.name,
    totalFormatted: brl(cfg.totalValueCents),
    entryFormatted: brl(entryValueCentsForTier(tier)),
    phasesSummary: phases,
    clauses: [
      "Prestação de serviços de desenvolvimento conforme pacote e Anexo de escopo acordado.",
      "Pagamento: entrada na assinatura e saldo conforme marcos do contrato formal.",
      "Cada fase avança após aprovação do cliente nos entregáveis da etapa.",
      "Garantia de conformidade técnica de 30 dias após aceite da entrega, nos termos do contrato.",
      "Alterações fora do escopo aprovado serão orçadas separadamente."
    ]
  };
}
