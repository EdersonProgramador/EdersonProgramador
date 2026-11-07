/** Branding — navegação em seções (aguardando sequência definida). */

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
        description: "Progresso do workspace de marca (sequência em definição)."
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
