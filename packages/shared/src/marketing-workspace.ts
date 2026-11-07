/** Marketing — captura estruturada (planejamento, funil, mídia). */

import type { BrandingFieldDef, BrandingFieldValue, BrandingSectionDef, BrandingWorkspaceData } from "./branding-workspace.js";
import { isBrandingFieldValueEmpty } from "./branding-workspace.js";

const M = "marketing" as const;

function mid(section: string, field: string): string {
  return `${M}:planejamento:${section}:${field}`;
}

export const MARKETING_PLANEJAMENTO_SECTIONS: readonly BrandingSectionDef[] = [
  {
    id: "estrategia",
    title: "Estratégia de campanha",
    intro: "Promessa, mecanismo e objetivo — alimenta copy e FL.",
    fields: [
      {
        id: mid("estrategia", "objetivo"),
        label: "Objetivo do ciclo",
        type: "textarea",
        placeholder: "Captação, nutrição, conversão, perpétuo…"
      },
      {
        id: mid("estrategia", "promessa-campanha"),
        label: "Promessa da campanha",
        type: "textarea"
      },
      {
        id: mid("estrategia", "mecanismo"),
        label: "Mecanismo único / big idea",
        type: "textarea"
      }
    ]
  },
  {
    id: "funil",
    title: "Funil e jornada",
    fields: [
      {
        id: mid("funil", "etapas"),
        label: "Etapas do funil",
        type: "repeater",
        columns: [
          { key: "etapa", label: "Etapa", input: "text" },
          { key: "canal", label: "Canal", input: "text" },
          { key: "kpi", label: "KPI principal", input: "text" },
          { key: "meta", label: "Meta", input: "text" }
        ]
      },
      {
        id: mid("funil", "notas"),
        label: "Observações da jornada",
        type: "textarea"
      }
    ]
  },
  {
    id: "midia",
    title: "Mídia e budget",
    fields: [
      {
        id: mid("midia", "canais"),
        label: "Canais e verba",
        type: "repeater",
        columns: [
          { key: "canal", label: "Canal", input: "text" },
          { key: "budget", label: "Budget (R$)", input: "text" },
          { key: "cpa-meta", label: "CPA / CPL meta", input: "text" },
          { key: "periodo", label: "Período", input: "text" }
        ]
      },
      {
        id: mid("midia", "total-budget"),
        label: "Budget total do ciclo (R$)",
        type: "text",
        placeholder: "Ex.: 15000"
      }
    ]
  }
] as const;

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

function parseMoney(value: BrandingFieldValue | undefined): number {
  if (typeof value !== "string") return 0;
  const n = Number(value.replace(/[^\d,.-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

/** Gráfico de budget por canal (a partir do repeater de mídia). */
export function marketingBudgetChart(fields: BrandingWorkspaceData): MarketingBudgetBar[] {
  const raw = fields[mid("midia", "canais")];
  const bars: MarketingBudgetBar[] = [];
  if (raw && typeof raw === "object" && "rows" in raw && Array.isArray(raw.rows)) {
    for (const row of raw.rows) {
      const label = String(row.canal ?? "").trim() || "Canal";
      const value = parseMoney(row.budget);
      if (value > 0) bars.push({ label, value });
    }
  }
  const total = parseMoney(fields[mid("midia", "total-budget")]);
  if (total > 0 && bars.length === 0) bars.push({ label: "Total planejado", value: total });
  return bars;
}
