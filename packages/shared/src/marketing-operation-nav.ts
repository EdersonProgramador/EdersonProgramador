/** Marketing — navegação em seções (aguardando sequência definida). */

import {
  findOperationSectionNavByAdminPath,
  operationSectionNavFlatItems,
  type OperationSectionNav,
  type OperationSectionNavItem
} from "./operation-pillar-section-nav.js";

export type MarketingNavItem = OperationSectionNavItem;
export type MarketingNavSection = OperationSectionNav;

export const MARKETING_OPERATION_NAV: readonly MarketingNavSection[] = [
  {
    id: "analisar",
    sectionLabel: "Analisar",
    items: [
      {
        id: "estatistica",
        label: "Estatística",
        adminPath: "operacao/marketing/estatistica",
        description: "Progresso do workspace (sequência em definição)."
      }
    ]
  }
] as const;

export function marketingNavFlatItems(): MarketingNavItem[] {
  return operationSectionNavFlatItems(MARKETING_OPERATION_NAV);
}

export function findMarketingNavByAdminPath(adminPath: string): {
  section: MarketingNavSection;
  item: MarketingNavItem;
} | null {
  return findOperationSectionNavByAdminPath(MARKETING_OPERATION_NAV, adminPath);
}

/** Rotas legadas — mapeamento vazio até nova sequência. */
export const MARKETING_LEGACY_PATH_ALIASES: Record<string, string> = {};
