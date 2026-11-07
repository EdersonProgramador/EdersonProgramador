/** Marketing — captura estruturada (planejamento, funil, mídia). */

import type { BrandingFieldValue, BrandingSectionDef, BrandingWorkspaceData } from "./branding-workspace.js";
import { isBrandingFieldValueEmpty } from "./branding-workspace.js";

/** Conteúdo esvaziado — a sequência será redefinida pela agência. */
export const MARKETING_PLANEJAMENTO_SECTIONS: readonly BrandingSectionDef[] = [];

export const MARKETING_PLANEJAMENTO_FIELD_IDS: string[] = MARKETING_PLANEJAMENTO_SECTIONS.flatMap((s) =>
  s.fields.map((f) => f.id)
);

export function marketingPlanejamentoProgress(fields: BrandingWorkspaceData): {
  total: number;
  done: number;
  percent: number;
} {
  let total = 0;
  let done = 0;
  for (const section of MARKETING_PLANEJAMENTO_SECTIONS) {
    for (const field of section.fields) {
      total += 1;
      if (!isBrandingFieldValueEmpty(fields[field.id])) done += 1;
    }
  }
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export type MarketingBudgetBar = { label: string; value: number };

/** Gráfico de budget por canal (a partir do repeater de mídia). */
export function marketingBudgetChart(_fields: BrandingWorkspaceData): MarketingBudgetBar[] {
  return [];
}
