/**
 * Faixas organizacionais espelhadas do modelo AgencyOS (marketingagencyops):
 * Comando, Pipeline, Entrega, Propostas, Portal, Tempo, Finanças, Inteligência, Relatórios.
 * Aplicadas de forma idêntica a Marketing, Branding e Lançamento.
 */

export const AGENCY_OPS_VERTICAL_IDS = ["marketing", "branding", "formula-lancamento"] as const;
export type AgencyOpsVerticalId = (typeof AGENCY_OPS_VERTICAL_IDS)[number];

export const AGENCY_OPS_LANE_IDS = [
  "comando",
  "pipeline",
  "entrega",
  "propostas",
  "portal",
  "tempo",
  "financas",
  "inteligencia",
  "relatorios"
] as const;
export type AgencyOpsLaneId = (typeof AGENCY_OPS_LANE_IDS)[number];

export type AgencyOpsLane = {
  id: AgencyOpsLaneId;
  label: string;
  purpose: string;
  /** Ordem na sidebar (1–9). */
  order: number;
};

export const AGENCY_OPS_LANES: readonly AgencyOpsLane[] = [
  {
    id: "comando",
    label: "Comando",
    purpose: "O que precisa de atenção agora — tickets, entregas e focos do dia.",
    order: 1
  },
  {
    id: "pipeline",
    label: "Pipeline",
    purpose: "CRM em estágios: lead → proposta → negociação → contrato → ativo.",
    order: 2
  },
  {
    id: "entrega",
    label: "Entrega",
    purpose: "Kanban de entregáveis com aprovação, tempo e vínculo a projetos.",
    order: 3
  },
  {
    id: "propostas",
    label: "Propostas",
    purpose: "Propostas com IA, aceite e conversão em projeto.",
    order: 4
  },
  {
    id: "portal",
    label: "Portal",
    purpose: "Visão do cliente: progresso, entregáveis e cobrança.",
    order: 5
  },
  {
    id: "tempo",
    label: "Tempo",
    purpose: "Horas, capacidade da equipe e alocação por projeto.",
    order: 6
  },
  {
    id: "financas",
    label: "Finanças",
    purpose: "Cotações, faturas, MRR e lucratividade da vertical.",
    order: 7
  },
  {
    id: "inteligencia",
    label: "Inteligência",
    purpose: "Agentes IA e assistente cross-módulo da vertical.",
    order: 8
  },
  {
    id: "relatorios",
    label: "Relatórios",
    purpose: "Analytics de pipeline, entrega, receita e capacidade.",
    order: 9
  }
] as const;

export type AgencyOpsVerticalMeta = {
  id: AgencyOpsVerticalId;
  label: string;
  /** Segmento de path sob operacao/ */
  pathSegment: AgencyOpsVerticalId;
  tone: "marketing" | "branding" | "formula";
};

export const AGENCY_OPS_VERTICALS: readonly AgencyOpsVerticalMeta[] = [
  { id: "marketing", label: "Marketing", pathSegment: "marketing", tone: "marketing" },
  { id: "branding", label: "Branding", pathSegment: "branding", tone: "branding" },
  {
    id: "formula-lancamento",
    label: "Lançamento",
    pathSegment: "formula-lancamento",
    tone: "formula"
  }
] as const;

/** Pipeline comercial espelhando AgencyOS (6 estágios). */
export const AGENCY_OPS_PIPELINE_STAGES = [
  { id: "LEAD", label: "Lead", leadStatuses: ["NEW"] as const },
  { id: "QUALIFIED", label: "Qualificação", leadStatuses: ["QUALIFIED"] as const },
  { id: "PROPOSAL", label: "Proposta", leadStatuses: ["PROPOSAL"] as const },
  { id: "NEGOTIATION", label: "Negociação", leadStatuses: ["NEGOTIATION"] as const },
  { id: "CONTRACT", label: "Contrato", leadStatuses: ["CONTRACT"] as const },
  { id: "ACTIVE", label: "Ativo", leadStatuses: ["WON", "ACTIVE"] as const }
] as const;

export type AgencyOpsPipelineStageId = (typeof AGENCY_OPS_PIPELINE_STAGES)[number]["id"];

export const AGENCY_OPS_DELIVERABLE_STATUSES = ["TODO", "DOING", "REVIEW", "DONE"] as const;
export type AgencyOpsDeliverableStatus = (typeof AGENCY_OPS_DELIVERABLE_STATUSES)[number];

export function isAgencyOpsLaneId(value: string): value is AgencyOpsLaneId {
  return (AGENCY_OPS_LANE_IDS as readonly string[]).includes(value);
}

export function isAgencyOpsVerticalId(value: string): value is AgencyOpsVerticalId {
  return (AGENCY_OPS_VERTICAL_IDS as readonly string[]).includes(value);
}

export function getAgencyOpsLane(id: AgencyOpsLaneId): AgencyOpsLane {
  return AGENCY_OPS_LANES.find((l) => l.id === id)!;
}

export function getAgencyOpsVertical(id: AgencyOpsVerticalId): AgencyOpsVerticalMeta {
  return AGENCY_OPS_VERTICALS.find((v) => v.id === id)!;
}

/** Caminho relativo a /agencia/admin */
export function agencyOpsLaneAdminPath(vertical: AgencyOpsVerticalId, lane: AgencyOpsLaneId): string {
  return `operacao/${vertical}/${lane}`;
}

export function agencyOpsDefaultAdminPath(vertical: AgencyOpsVerticalId): string {
  return agencyOpsLaneAdminPath(vertical, "comando");
}

/** Seções de nav (padrão Leadlovers) — mesmas lanes em toda vertical. */
export function buildAgencyOpsLaneNavSections(vertical: AgencyOpsVerticalId) {
  return [
    {
      id: "agency-ops",
      sectionLabel: "Agency Ops",
      items: AGENCY_OPS_LANES.map((lane) => ({
        id: lane.id,
        label: `${lane.order}. ${lane.label}`,
        adminPath: agencyOpsLaneAdminPath(vertical, lane.id),
        description: lane.purpose,
        pathMatch: "exact" as const
      }))
    }
  ] as const;
}
