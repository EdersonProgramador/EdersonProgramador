import {
  entryValueCentsForTier,
  PACKAGE_TIER_CONFIG,
  PACKAGE_TIER_SALES_IDS,
  type PackageTierId
} from "./project-journey.js";

/** IDs legados do CRM Amplifica (checkout Stripe / `planId` no Supabase). */
export const LEGACY_AMPLIFICA_PLAN_IDS = {
  essential: "plan1",
  professional: "plan2",
  advanced: "plan3"
} as const;

export type LegacyAmplificaPlanId = (typeof LEGACY_AMPLIFICA_PLAN_IDS)[keyof typeof LEGACY_AMPLIFICA_PLAN_IDS];

const PLAN_FEATURES: Record<(typeof PACKAGE_TIER_SALES_IDS)[number], string[]> = {
  essential: [
    "Diagnóstico e definição de escopo",
    "MVP / app com entregas essenciais",
    "Desenvolvimento e testes básicos",
    "Implantação conforme contrato",
    "Ideal para validar a ideia no mercado"
  ],
  professional: [
    "Tudo do START com maior profundidade",
    "Módulos e integrações sob medida",
    "Fluxos de negócio e painéis",
    "Testes estruturados e lançamento",
    "Suporte de evolução pós-entrega",
    "Para empresas que precisam operar de verdade"
  ],
  advanced: [
    "Tudo do BUSINESS em escala",
    "Arquitetura e produtos complexos",
    "Integrações críticas e multi-equipe",
    "Roadmap, governança e SLAs",
    "Acompanhamento contínuo de evolução",
    "Sob avaliação de complexidade"
  ]
};

const PLAN_SUBTITLES: Record<(typeof PACKAGE_TIER_SALES_IDS)[number], string> = {
  essential: "referência · escopo controlado",
  professional: "referência · escopo ampliado",
  advanced: "a partir de · escopo sob medida"
};

export type AgencyClientPortalPlan = {
  tierId: (typeof PACKAGE_TIER_SALES_IDS)[number];
  legacyPlanId: LegacyAmplificaPlanId;
  name: string;
  priceLabel: string;
  sub: string;
  features: string[];
  featured?: boolean;
  totalValueCents: number;
  entryValueCents: number;
};

function priceLabelFromCents(cents: number): string {
  const reais = Math.round(cents / 100);
  return reais.toLocaleString("pt-BR");
}

export function agencyClientPortalPlans(): AgencyClientPortalPlan[] {
  return PACKAGE_TIER_SALES_IDS.map((tierId) => {
    const cfg = PACKAGE_TIER_CONFIG[tierId];
    return {
      tierId,
      legacyPlanId: LEGACY_AMPLIFICA_PLAN_IDS[tierId],
      name: cfg.name,
      priceLabel: priceLabelFromCents(cfg.totalValueCents),
      sub: PLAN_SUBTITLES[tierId],
      features: PLAN_FEATURES[tierId],
      featured: tierId === "professional",
      totalValueCents: cfg.totalValueCents,
      entryValueCents: entryValueCentsForTier(tierId)
    };
  });
}

export function legacyPlanIdForTier(tier: PackageTierId): LegacyAmplificaPlanId | null {
  if (tier === "essential") return LEGACY_AMPLIFICA_PLAN_IDS.essential;
  if (tier === "professional") return LEGACY_AMPLIFICA_PLAN_IDS.professional;
  if (tier === "advanced") return LEGACY_AMPLIFICA_PLAN_IDS.advanced;
  return null;
}

export function packageTierFromLegacyPlanId(planId: string | null | undefined): PackageTierId | null {
  if (!planId) return null;
  const map: Record<string, PackageTierId> = {
    plan1: "essential",
    plan2: "professional",
    plan3: "advanced"
  };
  return map[planId] ?? null;
}