/** Branding — navegação em seções (12 etapas + visão do processo). */

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
  {
    id: "analisar",
    sectionLabel: "Analisar",
    items: [
      {
        id: "estatistica",
        label: "Estatística",
        adminPath: "operacao/branding/estatistica",
        description: "Progresso das 12 etapas e campos do workspace de marca."
      },
      {
        id: "processo",
        label: "Visão do processo",
        adminPath: "operacao/branding/processo",
        description: "Metodologia completa, entregáveis e critérios de aprovação."
      }
    ]
  },
  {
    id: "fundar",
    sectionLabel: "Fundar",
    items: BRANDING_PROCESS_STEPS.filter((s) => s.order <= 2).map(etapaItem)
  },
  {
    id: "estrategia",
    sectionLabel: "Estratégia",
    items: BRANDING_PROCESS_STEPS.filter((s) => s.order >= 3 && s.order <= 5).map(etapaItem)
  },
  {
    id: "criar",
    sectionLabel: "Criar",
    items: BRANDING_PROCESS_STEPS.filter((s) => s.order >= 6 && s.order <= 8).map(etapaItem)
  },
  {
    id: "viver",
    sectionLabel: "Viver",
    items: BRANDING_PROCESS_STEPS.filter((s) => s.order >= 9 && s.order <= 10).map(etapaItem)
  },
  {
    id: "evoluir",
    sectionLabel: "Evoluir",
    items: BRANDING_PROCESS_STEPS.filter((s) => s.order >= 11).map(etapaItem)
  },
  {
    id: "entregar",
    sectionLabel: "Entregar",
    items: [
      {
        id: "brandbook",
        label: "Brandbook PDF",
        adminPath: "operacao/branding/brandbook",
        description: "Relatório profissional da marca e download em PDF."
      }
    ]
  }
] as const;

export const BRANDING_LEGACY_PATH_ALIASES: Record<string, string> = {
  "operacao/branding/identidade": "operacao/branding/identidade-visual",
  "operacao/branding/plataforma": "operacao/branding/plataforma"
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
