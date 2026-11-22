/** Branding — Agency Ops lanes + processo de marca (12 etapas) sob Entrega. */

import {
  AGENCY_OPS_LANE_IDS,
  agencyOpsDefaultAdminPath,
  agencyOpsLaneAdminPath,
  buildAgencyOpsLaneNavSections
} from "./agency-ops-process-lanes.js";
import {
  BRANDING_PROCESS_STEPS,
  type BrandingProcessStep
} from "./branding-process-overview.js";
import {
  findOperationSectionNavByAdminPath,
  operationSectionNavFlatItems,
  type OperationSectionNav,
  type OperationSectionNavItem
} from "./operation-pillar-section-nav.js";

export type BrandingNavItem = OperationSectionNavItem;
export type BrandingNavSection = OperationSectionNav;

function shortEtapaLabel(step: BrandingProcessStep): string {
  const short: Record<string, string> = {
    alinhamento: "Alinhamento",
    diagnostico: "Diagnóstico",
    estrategia: "Estratégia",
    plataforma: "Plataforma",
    arquitetura: "Arquitetura",
    naming: "Naming",
    "identidade-verbal": "Identidade verbal",
    "identidade-visual": "Identidade visual",
    experiencia: "Experiência",
    implementacao: "Implementação",
    governanca: "Governança",
    medicao: "Medição"
  };
  return `${step.order}. ${short[step.etapaId] ?? step.etapaId}`;
}

function etapaItem(step: BrandingProcessStep): BrandingNavItem {
  return {
    id: step.etapaId,
    label: shortEtapaLabel(step),
    adminPath: `operacao/branding/${step.etapaId}`,
    description: step.objective
  };
}

export const BRANDING_OPERATION_NAV: readonly BrandingNavSection[] = [
  ...buildAgencyOpsLaneNavSections("branding"),
  {
    id: "processo-marca",
    sectionLabel: "Processo de marca",
    items: [
      {
        id: "estatistica",
        label: "Estatística",
        adminPath: "operacao/branding/estatistica",
        description: "Progresso das 12 etapas e campos do workspace."
      },
      {
        id: "processo",
        label: "Visão do processo",
        adminPath: "operacao/branding/processo",
        description: "Metodologia, entregáveis e critérios de aprovação."
      },
      ...BRANDING_PROCESS_STEPS.map(etapaItem),
      {
        id: "brandbook",
        label: "Brandbook PDF",
        adminPath: "operacao/branding/brandbook",
        description: "Relatório profissional da marca e download em PDF."
      }
    ]
  }
] as unknown as readonly BrandingNavSection[];

export const BRANDING_LEGACY_PATH_ALIASES: Record<string, string> = {
  "operacao/branding/identidade": "operacao/branding/identidade-visual",
  "operacao/branding/plataforma": "operacao/branding/plataforma",
  "operacao/branding": agencyOpsDefaultAdminPath("branding")
};

export function brandingNavFlatItems(): BrandingNavItem[] {
  return operationSectionNavFlatItems(BRANDING_OPERATION_NAV);
}

export function findBrandingNavByAdminPath(adminPath: string): {
  section: BrandingNavSection;
  item: BrandingNavItem;
} | null {
  return findOperationSectionNavByAdminPath(BRANDING_OPERATION_NAV, adminPath);
}

/** Paths das lanes (registrar no router antes de :etapaId). */
export const BRANDING_AGENCY_OPS_LANE_PATHS = AGENCY_OPS_LANE_IDS.map((lane) =>
  agencyOpsLaneAdminPath("branding", lane)
);
