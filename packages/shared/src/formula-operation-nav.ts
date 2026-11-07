/** Fórmula de Lançamento — navegação (aguardando sequência definida). */

import {
  findOperationSectionNavByAdminPath,
  operationSectionNavFlatItems,
  type OperationSectionNav,
  type OperationSectionNavItem
} from "./operation-pillar-section-nav.js";

export type FormulaNavItem = OperationSectionNavItem;
export type FormulaNavSection = OperationSectionNav;

export const FORMULA_OPERATION_NAV: readonly FormulaNavSection[] = [
  {
    id: "analisar",
    sectionLabel: "Analisar",
    items: [
      {
        id: "estatistica",
        label: "Estatística",
        adminPath: "operacao/formula-lancamento/estatistica",
        description: "Progresso do playbook FL (sequência em definição)."
      }
    ]
  }
] as const;

export const FORMULA_LEGACY_PATH_ALIASES: Record<string, string> = {};

export const FORMULA_HUB_REDIRECT_TO_PHASE: Record<string, string> = {};

export function formulaNavFlatItems(): FormulaNavItem[] {
  return operationSectionNavFlatItems(FORMULA_OPERATION_NAV);
}

export function findFormulaNavByAdminPath(adminPath: string): {
  section: FormulaNavSection;
  item: FormulaNavItem;
} | null {
  return findOperationSectionNavByAdminPath(FORMULA_OPERATION_NAV, adminPath);
}

export function formulaLaunchPhaseIdFromHubView(_view: string): string | null {
  return null;
}
