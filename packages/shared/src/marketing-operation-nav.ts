/** Marketing/Comercial — navegação alinhada ao processo operacional. */

import { ADMIN_COMERCIAL_STEPS } from "./admin-operation-ia.js";
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
    id: "comercial",
    sectionLabel: "Processo comercial",
    items: ADMIN_COMERCIAL_STEPS.map((step) => ({
      id: step.id,
      label: step.stepNumber ? `${step.stepNumber}. ${step.label}` : step.label,
      adminPath: step.adminPath,
      description: step.purpose
    }))
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

export const MARKETING_LEGACY_PATH_ALIASES: Record<string, string> = {
  leads: "comercial/captura",
  "marketing/cdp": "comercial/captura",
  "marketing/campanhas": "comercial/nutricao",
  "marketing/crm": "comercial/vendas",
  funil: "comercial/vendas",
  clientes: "comercial/relacionamento",
  "marketing/fidelidade": "comercial/relacionamento"
};
