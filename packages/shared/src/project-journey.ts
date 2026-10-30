/** Pacotes e etapas da jornada (App do Zero ao Lançamento) — uso no portal e na API. */

export const PACKAGE_TIER_IDS = ["essential", "professional", "advanced", "partnership"] as const;
export type PackageTierId = (typeof PACKAGE_TIER_IDS)[number];

export const JOURNEY_PHASE_KEYS = ["IDEA", "PLAN", "BUILD", "QA", "LAUNCH"] as const;
export type JourneyPhaseKey = (typeof JOURNEY_PHASE_KEYS)[number];

export const JOURNEY_PHASES: ReadonlyArray<{
  key: JourneyPhaseKey;
  label: string;
  shortLabel: string;
  daysPlanned: number;
}> = [
  { key: "IDEA", label: "Da ideia ao projeto", shortLabel: "Diagnóstico", daysPlanned: 7 },
  { key: "PLAN", label: "Do projeto ao planejamento", shortLabel: "Especificação", daysPlanned: 10 },
  { key: "BUILD", label: "Do planejamento ao desenvolvimento", shortLabel: "Implementação", daysPlanned: 14 },
  { key: "QA", label: "Do desenvolvimento aos testes", shortLabel: "Qualidade", daysPlanned: 7 },
  { key: "LAUNCH", label: "Dos testes ao lançamento", shortLabel: "Implantação", daysPlanned: 5 }
];

const TIER_DELIVERABLES: Record<PackageTierId, Record<JourneyPhaseKey, readonly string[]>> = {
  essential: {
    IDEA: ["Diagnóstico inicial do projeto", "Definição das funcionalidades essenciais"],
    PLAN: ["Planejamento técnico básico", "Interface das telas principais"],
    BUILD: ["Desenvolvimento de um MVP com escopo limitado"],
    QA: ["Testes funcionais e correções"],
    LAUNCH: ["Implantação em um ambiente acordado", "Orientação básica de utilização"]
  },
  professional: {
    IDEA: ["Diagnóstico e levantamento de requisitos", "Especificação funcional do projeto"],
    PLAN: ["Arquitetura técnica da solução", "Design das principais interfaces"],
    BUILD: [
      "Desenvolvimento do aplicativo ou sistema acordado",
      "Banco de dados e autenticação, quando necessários",
      "Integrações previamente especificadas"
    ],
    QA: ["Testes e correções de conformidade"],
    LAUNCH: ["Implantação e documentação técnica básica", "Demonstração e treinamento de entrega"]
  },
  advanced: {
    IDEA: ["Descoberta e análise aprofundada do negócio", "Especificação detalhada de requisitos"],
    PLAN: ["Arquitetura de software e planejamento de dados"],
    BUILD: [
      "Desenvolvimento de módulos personalizados",
      "Integrações com APIs e serviços externos previstos",
      "Painel administrativo, conforme escopo"
    ],
    QA: ["Testes, validações e correções"],
    LAUNCH: [
      "Preparação de implantação e documentação",
      "Planejamento de escalabilidade e evolução"
    ]
  },
  partnership: {
    IDEA: ["Diagnóstico do modelo de negócio e metas de receita compartilhada", "Definição do produto mínimo viável da parceria"],
    PLAN: ["Anexo técnico (backlog) e anexo comercial (percentual e repasses)", "Arquitetura e roadmap alinhados ao risco compartilhado"],
    BUILD: ["Desenvolvimento do produto digital conforme escopo fechado", "Integrações financeiras para auditoria de métricas"],
    QA: ["Homologação conjunta antes de abrir receita", "Validação de relatórios e painéis de repasse"],
    LAUNCH: ["Publicação assistida", "Acordo operacional de divisão de receitas em vigor"]
  }
};

export const PACKAGE_TIER_CONFIG: Record<
  PackageTierId,
  { name: string; tagline: string; totalValueCents: number; entryPercent: number }
> = {
  essential: {
    name: "Essencial",
    tagline: "Para validar uma ideia",
    totalValueCents: 590_000,
    entryPercent: 40
  },
  professional: {
    name: "Profissional",
    tagline: "Para construir um produto mais completo",
    totalValueCents: 1_290_000,
    entryPercent: 40
  },
  advanced: {
    name: "Avançado",
    tagline: "Para projetos de maior complexidade",
    totalValueCents: 2_490_000,
    entryPercent: 40
  },
  partnership: {
    name: "Parceria Comercial",
    tagline: "Divisão de receitas e riscos compartilhados",
    totalValueCents: 0,
    entryPercent: 100
  }
};

export function parsePackageTier(value: unknown): PackageTierId | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return PACKAGE_TIER_IDS.includes(normalized as PackageTierId) ? (normalized as PackageTierId) : null;
}

export function packageTierLabel(tier: PackageTierId): string {
  return PACKAGE_TIER_CONFIG[tier].name;
}

export function entryValueCentsForTier(tier: PackageTierId): number {
  if (tier === "partnership") return 150_000;
  const cfg = PACKAGE_TIER_CONFIG[tier];
  return Math.round((cfg.totalValueCents * cfg.entryPercent) / 100);
}

export function deliverablesForTierPhase(tier: PackageTierId, phaseKey: JourneyPhaseKey): string[] {
  return [...TIER_DELIVERABLES[tier][phaseKey]];
}

export function allDeliverablesForTier(tier: PackageTierId): Array<{ phaseKey: JourneyPhaseKey; label: string }> {
  return JOURNEY_PHASES.flatMap((phase) =>
    TIER_DELIVERABLES[tier][phase.key].map((label) => ({ phaseKey: phase.key, label }))
  );
}

export const PHASE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando início",
  IN_PROGRESS: "Em andamento",
  WAITING_APPROVAL: "Aguardando sua aprovação",
  APPROVED: "Aprovada",
  DONE: "Concluída"
};

export const DELIVERABLE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em produção",
  DONE: "Entregue"
};

export function projectProgressPercent(
  phases: ReadonlyArray<{ status: string }>,
  deliverables?: ReadonlyArray<{ status: string }>
): number {
  if (deliverables && deliverables.length > 0) {
    const done = deliverables.filter((d) => d.status === "DONE").length;
    return Math.round((done / deliverables.length) * 100);
  }
  if (phases.length === 0) return 0;
  const weight: Record<string, number> = {
    PENDING: 0,
    IN_PROGRESS: 45,
    WAITING_APPROVAL: 75,
    APPROVED: 100,
    DONE: 100
  };
  const sum = phases.reduce((acc, p) => acc + (weight[p.status] ?? 0), 0);
  return Math.round(sum / phases.length);
}

export function currentPhaseIndex(phases: ReadonlyArray<{ status: string; sortOrder: number }>): number {
  const sorted = [...phases].sort((a, b) => a.sortOrder - b.sortOrder);
  const active = sorted.findIndex((p) => p.status === "IN_PROGRESS" || p.status === "WAITING_APPROVAL");
  if (active >= 0) return active;
  const firstPending = sorted.findIndex((p) => p.status === "PENDING");
  if (firstPending >= 0) return firstPending;
  return Math.max(0, sorted.length - 1);
}

export const UPGRADE_TIER_ORDER: PackageTierId[] = ["essential", "professional", "advanced"];

export function nextUpgradeTier(current: PackageTierId): PackageTierId | null {
  if (current === "partnership") return null;
  const idx = UPGRADE_TIER_ORDER.indexOf(current);
  if (idx < 0 || idx >= UPGRADE_TIER_ORDER.length - 1) return null;
  return UPGRADE_TIER_ORDER[idx + 1]!;
}
