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
    { key: "package", label: "Pacote" },
    { key: "contract", label: "Contrato" },
    { key: "checkout", label: "Checkout" },
    { key: "delivery", label: "Entrega" }
  ],
  client: {
    title: "Seu funil de contratação",
    subtitle: "Assista à live de apresentação e avance etapa a etapa até liberar seu projeto.",
    stepLiveTitle: "Live de apresentação",
    stepLiveDesc: "Assista à aula ao vivo (ou replay) e confirme sua participação para desbloquear os pacotes.",
    stepPackageTitle: "Escolha seu pacote",
    stepPackageDesc: "Valores e escopo conforme publicado pela equipe — sem surpresas fora do contrato.",
    stepContractTitle: "Assinatura digital",
    stepContractDesc: "Revise investimento, jornada e cláusulas antes de assinar.",
    stepCheckoutTitle: "Pagamento da entrada",
    stepCheckoutDesc: "Finalize o checkout para iniciar a jornada de desenvolvimento.",
    liveRequired:
      "Para contratar pelo funil pós-live, confirme sua participação na aula ou aguarde liberação pelo administrador.",
    selectPackage: "Selecione o pacote",
    hireCta: "Continuar para o contrato",
    signTitle: "Contrato digital",
    signSubtitle: "Leia o resumo abaixo. Após assinar, você segue para o checkout (entrada) e então a jornada é liberada.",
    signCta: "Assinar contrato",
    checkoutTitle: "Checkout — entrada do projeto",
    checkoutCta: "Confirmar pagamento da entrada e liberar projeto",
    checkoutAck:
      "Confirmo que realizei (ou combinarei) o pagamento da entrada conforme instruções abaixo e desejo liberar a jornada de desenvolvimento.",
    signFieldLabel: "Nome completo (como no contrato)",
    signedSuccess: "Projeto ativo. Acompanhe o progresso de cada fase de desenvolvimento abaixo.",
    pendingContract: "Assinatura pendente",
    goToProject: "Ir para o projeto"
  },
  admin: {
    liveToggle: "Participou da live",
    funnelSource: "Origem do funil",
    funnelEditorTitle: "Funil comercial (fonte da Área do cliente)",
    funnelEditorHint: "Publique a live, pacotes, contrato e checkout — o cliente segue estas etapas na ordem.",
    livePublish: "Publicar live para clientes",
    saveFunnel: "Salvar funil",
    applyInstitutional: "Preencher com dados institucionais",
    applyInstitutionalForce: "Restaurar tudo da landing",
    applyInstitutionalHint:
      "Importa live, pacotes (Essencial/Profissional/Avançado), contrato e checkout a partir de MARKETING_COPY / página principal."
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
