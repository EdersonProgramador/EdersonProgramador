/** Fórmula de Lançamento — jornada FL (fundação → PL → L → pós). */

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
        description: "Progresso das fases FL e checklist integrado ao workspace."
      },
      {
        id: "simulador",
        label: "Simulador de receita",
        adminPath: "operacao/formula-lancamento/simulador",
        description: "Lista, conversão e ticket — cenários conservador, base e agressivo."
      }
    ]
  },
  {
    id: "fundamentar",
    sectionLabel: "Fundamentar",
    items: [
      {
        id: "fundacao",
        label: "Fundação",
        adminPath: "operacao/formula-lancamento/fundacao",
        description: "Posicionamento, oferta e desenho da jornada (Fase 1 FL)."
      },
      {
        id: "teaser",
        label: "Teaser & editorial",
        adminPath: "operacao/formula-lancamento/teaser",
        description: "Identidade visível e aquecimento orgânico (Fase 2 FL)."
      }
    ]
  },
  {
    id: "pre-lancamento",
    sectionLabel: "Pré-lançamento",
    items: [
      {
        id: "pl",
        label: "Pré-lançamento (PL)",
        adminPath: "operacao/formula-lancamento/pl",
        description: "CPLs, gatilhos mentais e ritmo psicológico (Fase 4 FL)."
      }
    ]
  },
  {
    id: "lancamento",
    sectionLabel: "Lançamento",
    items: [
      {
        id: "l",
        label: "Lançamento (L)",
        adminPath: "operacao/formula-lancamento/lancamento",
        description: "Carrinho, oferta irrecusável e pico de conversão (Fase 5 FL)."
      }
    ]
  },
  {
    id: "consolidar",
    sectionLabel: "Consolidar",
    items: [
      {
        id: "pos",
        label: "Pós-lançamento",
        adminPath: "operacao/formula-lancamento/pos-lancamento",
        description: "Fechamento, onboarding e debriefing (Fase 6 FL)."
      }
    ]
  }
] as const;

export const FORMULA_LEGACY_PATH_ALIASES: Record<string, string> = {
  "operacao/fase-1": "operacao/formula-lancamento/fundacao",
  "operacao/fase-2": "operacao/formula-lancamento/teaser",
  "operacao/fase-4": "operacao/formula-lancamento/pl",
  "operacao/fase-5": "operacao/formula-lancamento/lancamento",
  "operacao/fase-6": "operacao/formula-lancamento/pos-lancamento"
};

/** Hub view id → fase FL legada (operacao/fase-N). */
export const FORMULA_HUB_REDIRECT_TO_PHASE: Record<string, string> = {
  fundacao: "fase-1",
  teaser: "fase-2",
  pl: "fase-4",
  lancamento: "fase-5",
  "pos-lancamento": "fase-6"
};

export function formulaNavFlatItems(): FormulaNavItem[] {
  return operationSectionNavFlatItems(FORMULA_OPERATION_NAV);
}

export function findFormulaNavByAdminPath(adminPath: string): {
  section: FormulaNavSection;
  item: FormulaNavItem;
} | null {
  return findOperationSectionNavByAdminPath(FORMULA_OPERATION_NAV, adminPath);
}

export function formulaLaunchPhaseIdFromHubView(view: string): string | null {
  return FORMULA_HUB_REDIRECT_TO_PHASE[view] ?? null;
}
