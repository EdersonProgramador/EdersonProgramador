/** Branding — navegação em seções (pesquisa → identidade → entrega). */

import {
  findOperationSectionNavByAdminPath,
  operationSectionNavFlatItems,
  type OperationSectionNav,
  type OperationSectionNavItem
} from "./operation-pillar-section-nav.js";

export type BrandingNavItem = OperationSectionNavItem;
export type BrandingNavSection = OperationSectionNav;

export const BRANDING_OPERATION_NAV: readonly BrandingNavSection[] = [
  {
    id: "analisar",
    sectionLabel: "Analisar",
    items: [
      {
        id: "estatistica",
        label: "Estatística",
        adminPath: "operacao/branding/estatistica",
        description: "Progresso das etapas e campos preenchidos no workspace de marca."
      }
    ]
  },
  {
    id: "pesquisar",
    sectionLabel: "Pesquisar",
    items: [
      {
        id: "diagnostico",
        label: "Diagnóstico",
        adminPath: "operacao/branding/diagnostico",
        description: "Briefing, imersão e pesquisa — fundação antes do posicionamento."
      }
    ]
  },
  {
    id: "posicionar",
    sectionLabel: "Posicionar",
    items: [
      {
        id: "plataforma",
        label: "Plataforma de marca",
        adminPath: "operacao/branding/plataforma",
        description: "Propósito, arquétipo, tom de voz e promessa central."
      }
    ]
  },
  {
    id: "criar",
    sectionLabel: "Criar",
    items: [
      {
        id: "identidade",
        label: "Identidade",
        adminPath: "operacao/branding/identidade",
        description: "Visual, verbal, manual e assets de marca."
      }
    ]
  },
  {
    id: "aplicar",
    sectionLabel: "Aplicar",
    items: [
      {
        id: "implementacao",
        label: "Implementação",
        adminPath: "operacao/branding/implementacao",
        description: "Rollout, governança e gestão da marca no dia a dia."
      },
      {
        id: "brandbook",
        label: "Brandbook PDF",
        adminPath: "operacao/branding/brandbook",
        description: "Relatório profissional da marca e download em PDF."
      }
    ]
  }
] as const;

export const BRANDING_LEGACY_PATH_ALIASES: Record<string, string> = {};

export function brandingNavFlatItems(): BrandingNavItem[] {
  return operationSectionNavFlatItems(BRANDING_OPERATION_NAV);
}

export function findBrandingNavByAdminPath(adminPath: string): {
  section: BrandingNavSection;
  item: BrandingNavItem;
} | null {
  return findOperationSectionNavByAdminPath(BRANDING_OPERATION_NAV, adminPath);
}
