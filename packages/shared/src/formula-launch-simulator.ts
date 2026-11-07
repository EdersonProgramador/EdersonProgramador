/** Fórmula de Lançamento — simulador de receita a partir do workspace. */

import type { BrandingFieldValue, BrandingWorkspaceData } from "./branding-workspace.js";
import { isBrandingFieldValueEmpty } from "./branding-workspace.js";

const F = "formula:sim";

export const FORMULA_SIMULATOR_FIELD_IDS = {
  lista: `${F}:lista`,
  convWebinar: `${F}:conv-webinar`,
  convCheckout: `${F}:conv-checkout`,
  ticket: `${F}:ticket-brl`,
  budgetAds: `${F}:budget-ads`,
  notas: `${F}:notas`
} as const;

/** Campos do simulador esvaziados — serão redefinidos com a nova sequência FL. */
export const FORMULA_SIMULATOR_FIELDS: readonly {
  id: string;
  label: string;
  type: "text" | "textarea";
  placeholder?: string;
}[] = [];

function num(value: BrandingFieldValue | undefined): number {
  if (typeof value !== "string") return 0;
  const n = Number(value.replace(/[^\d,.-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export type LaunchScenario = {
  id: "conservative" | "base" | "aggressive";
  label: string;
  leads: number;
  buyers: number;
  revenue: number;
  roas: number | null;
};

export type LaunchSimulatorResult = {
  scenarios: LaunchScenario[];
  chart: { label: string; value: number }[];
};

export function computeLaunchRevenueProjection(fields: BrandingWorkspaceData): LaunchSimulatorResult {
  const lista = num(fields[FORMULA_SIMULATOR_FIELD_IDS.lista]);
  const convW = num(fields[FORMULA_SIMULATOR_FIELD_IDS.convWebinar]) / 100;
  const convC = num(fields[FORMULA_SIMULATOR_FIELD_IDS.convCheckout]) / 100;
  const ticket = num(fields[FORMULA_SIMULATOR_FIELD_IDS.ticket]);
  const budget = num(fields[FORMULA_SIMULATOR_FIELD_IDS.budgetAds]);

  const multipliers = [
    { id: "conservative" as const, label: "Conservador", m: 0.75 },
    { id: "base" as const, label: "Base", m: 1 },
    { id: "aggressive" as const, label: "Agressivo", m: 1.2 }
  ];

  const scenarios: LaunchScenario[] = multipliers.map(({ id, label, m }) => {
    const live = Math.round(lista * convW * m);
    const buyers = Math.round(live * convC * m);
    const revenue = buyers * ticket;
    const roas = budget > 0 ? revenue / budget : null;
    return { id, label, leads: live, buyers, revenue, roas };
  });

  return {
    scenarios,
    chart: scenarios.map((s) => ({ label: s.label, value: Math.round(s.revenue) }))
  };
}

export function formulaSimulatorFieldCount(): number {
  return FORMULA_SIMULATOR_FIELDS.length;
}

export function formulaSimulatorProgress(fields: BrandingWorkspaceData): { total: number; done: number; percent: number } {
  let done = 0;
  for (const f of FORMULA_SIMULATOR_FIELDS) {
    if (!isBrandingFieldValueEmpty(fields[f.id])) done += 1;
  }
  const total = formulaSimulatorFieldCount();
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
