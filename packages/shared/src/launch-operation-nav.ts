/** Navegação da Operação — pilares com fases de produção próprias. */

import {
  BRANDING_LEGACY_PATH_ALIASES,
  BRANDING_OPERATION_NAV
} from "./branding-operation-nav.js";
import {
  DEVELOPMENT_LEGACY_PATH_ALIASES,
  DEVELOPMENT_OPERATION_NAV
} from "./development-operation-nav.js";
import { FORMULA_LEGACY_PATH_ALIASES, FORMULA_OPERATION_NAV } from "./formula-operation-nav.js";
import { MARKETING_LEGACY_PATH_ALIASES, MARKETING_OPERATION_NAV } from "./marketing-operation-nav.js";
import { findOperationSectionNavContext } from "./operation-pillar-section-nav.js";

export type OperationPillarTone = "branding" | "marketing" | "tech" | "formula";

export type OperationProductionPhaseNav = {
  /** Número da fase dentro do pilar (1, 2, 3…). */
  productionOrder: number;
  /** Nome curto após “Fase N —”. */
  stepLabel: string;
  /** Caminho relativo a `/agencia/admin` (sem barra inicial). */
  adminPath: string;
};

export type OperationPillarNav = {
  id: string;
  pillarLabel: string;
  tone: OperationPillarTone;
  phases: OperationProductionPhaseNav[];
};

export const OPERATION_PILLAR_NAV: readonly OperationPillarNav[] = [
  {
    id: "branding",
    pillarLabel: "Branding",
    tone: "branding",
    /** Itens em {@link BRANDING_OPERATION_NAV}. */
    phases: []
  },
  {
    id: "marketing",
    pillarLabel: "Marketing",
    tone: "marketing",
    /** Itens em {@link MARKETING_OPERATION_NAV} — sidebar em seções. */
    phases: []
  },
  {
    id: "desenvolvimento",
    pillarLabel: "Desenvolvimento",
    tone: "tech",
    /** Itens em {@link DEVELOPMENT_OPERATION_NAV}. */
    phases: []
  },
  {
    id: "formula-lancamento",
    pillarLabel: "Fórmula de Lançamento",
    tone: "formula",
    /** Itens em {@link FORMULA_OPERATION_NAV}. */
    phases: []
  }
] as const;

export function operationPhaseNavLabel(phase: OperationProductionPhaseNav): string {
  return `Fase ${phase.productionOrder} — ${phase.stepLabel}`;
}

export function findOperationNavByAdminPath(adminPath: string): {
  pillar: OperationPillarNav;
  phase: OperationProductionPhaseNav;
} | null {
  const normalized = adminPath.replace(/^\/+/, "");
  for (const pillar of OPERATION_PILLAR_NAV) {
    const phase = pillar.phases.find((p) => p.adminPath === normalized);
    if (phase) return { pillar, phase };
  }
  return null;
}

/** Breadcrumb Marketing (seções Analisar / Nutrir / …). */
export function findMarketingOperationNavContext(adminPath: string): {
  pillarLabel: string;
  sectionLabel: string;
  itemLabel: string;
} | null {
  return findOperationSectionNavContext("Marketing", MARKETING_OPERATION_NAV, adminPath, MARKETING_LEGACY_PATH_ALIASES);
}

export function findBrandingOperationNavContext(adminPath: string): {
  pillarLabel: string;
  sectionLabel: string;
  itemLabel: string;
} | null {
  return findOperationSectionNavContext("Branding", BRANDING_OPERATION_NAV, adminPath, BRANDING_LEGACY_PATH_ALIASES);
}

export function findDevelopmentOperationNavContext(adminPath: string): {
  pillarLabel: string;
  sectionLabel: string;
  itemLabel: string;
} | null {
  return findOperationSectionNavContext(
    "Desenvolvimento",
    DEVELOPMENT_OPERATION_NAV,
    adminPath,
    DEVELOPMENT_LEGACY_PATH_ALIASES
  );
}

export function findFormulaOperationNavContext(adminPath: string): {
  pillarLabel: string;
  sectionLabel: string;
  itemLabel: string;
} | null {
  return findOperationSectionNavContext(
    "Fórmula de Lançamento",
    FORMULA_OPERATION_NAV,
    adminPath,
    FORMULA_LEGACY_PATH_ALIASES
  );
}

export function adjacentOperationProductionPhase(
  currentAdminPath: string,
  direction: "prev" | "next"
): { pillar: OperationPillarNav; phase: OperationProductionPhaseNav } | null {
  const ctx = findOperationNavByAdminPath(currentAdminPath);
  if (!ctx) return null;
  const index = ctx.pillar.phases.findIndex((p) => p.adminPath === ctx.phase.adminPath);
  const nextIndex = direction === "prev" ? index - 1 : index + 1;
  const phase = ctx.pillar.phases[nextIndex];
  if (!phase) return null;
  return { pillar: ctx.pillar, phase };
}
