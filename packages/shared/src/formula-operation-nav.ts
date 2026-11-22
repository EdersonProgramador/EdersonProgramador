/** Fórmula de Lançamento — mesmas faixas Agency Ops + ferramentas FL. */

import {
  agencyOpsDefaultAdminPath,
  agencyOpsLaneAdminPath,
  buildAgencyOpsLaneNavSections
} from "./agency-ops-process-lanes.js";
import {
  findOperationSectionNavByAdminPath,
  operationSectionNavFlatItems,
  type OperationSectionNav,
  type OperationSectionNavItem
} from "./operation-pillar-section-nav.js";

export type FormulaNavItem = OperationSectionNavItem;
export type FormulaNavSection = OperationSectionNav;

export const FORMULA_OPERATION_NAV: readonly FormulaNavSection[] = [
  ...buildAgencyOpsLaneNavSections("formula-lancamento"),
  {
    id: "ferramentas-fl",
    sectionLabel: "Ferramentas FL",
    items: [
      {
        id: "simulador",
        label: "Simulador",
        adminPath: "operacao/formula-lancamento/simulador",
        description: "Simulação de lançamento e playbook."
      },
      {
        id: "plano-pdf",
        label: "Plano PDF",
        adminPath: "operacao/formula-lancamento/plano-pdf",
        description: "Exportação do plano de lançamento."
      },
      {
        id: "estatistica",
        label: "Estatística FL",
        adminPath: "operacao/formula-lancamento/estatistica",
        description: "Progresso do playbook (legado → Relatórios)."
      }
    ]
  }
] as unknown as readonly FormulaNavSection[];

export const FORMULA_LEGACY_PATH_ALIASES: Record<string, string> = {
  "operacao/formula-lancamento": agencyOpsDefaultAdminPath("formula-lancamento"),
  "operacao/formula-lancamento/estatistica": agencyOpsLaneAdminPath("formula-lancamento", "relatorios")
};

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
