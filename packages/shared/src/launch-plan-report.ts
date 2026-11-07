/** Plano de Lançamento — relatório PDF (dados Marketing + FL + Produto). */

import type { BrandbookSection } from "./branding-studio.js";
import type { BrandingFieldValue, BrandingWorkspaceData } from "./branding-workspace.js";
import { isBrandingFieldValueEmpty } from "./branding-workspace.js";
import { computeLaunchRevenueProjection } from "./formula-launch-simulator.js";
import { launchOperationProgress } from "./launch-operation-phases.js";
import { MARKETING_PLANEJAMENTO_SECTIONS } from "./marketing-workspace.js";
import { PROJECT_WORKSPACE_FEED_RULES, resolveWorkspaceFeed } from "./project-workspace.js";

export type LaunchPlanPdfModel = {
  projectTitle: string;
  generatedAt: string;
  sections: BrandbookSection[];
  scenariosChart: { label: string; value: number }[];
  checklistPercent: number;
};

function textField(fields: BrandingWorkspaceData, id: string): string | undefined {
  const v = fields[id];
  if (isBrandingFieldValueEmpty(v)) return undefined;
  if (typeof v === "string") return v.trim() || undefined;
  return undefined;
}

function repeaterLines(
  value: BrandingFieldValue | undefined,
  format: (row: Record<string, string>) => string | null
): string[] {
  if (!value || typeof value !== "object" || !("rows" in value)) return [];
  const rows = (value as { rows: Record<string, string>[] }).rows;
  return rows.map(format).filter((l): l is string => Boolean(l?.trim()));
}

export function buildLaunchPlanOutline(
  fields: BrandingWorkspaceData,
  checklist: Record<string, boolean>
): BrandbookSection[] {
  const sections: BrandbookSection[] = [];

  const copyLines: string[] = [];
  for (const rule of PROJECT_WORKSPACE_FEED_RULES) {
    const { value } = resolveWorkspaceFeed(rule, fields);
    if (value) copyLines.push(`${rule.label}: ${value}`);
  }
  if (copyLines.length) sections.push({ title: "Síntese estratégica (workspace)", lines: copyLines });

  const promessa = textField(fields, "product:offer:promessa-fl");
  const preco = textField(fields, "product:offer:preco-brl");
  const garantia = textField(fields, "product:offer:garantia");
  const oferta: string[] = [];
  if (promessa) oferta.push(`Promessa: ${promessa}`);
  if (preco) oferta.push(`Preço: R$ ${preco}`);
  if (garantia) oferta.push(`Garantia: ${garantia}`);
  if (oferta.length) sections.push({ title: "Oferta e produto", lines: oferta });

  const mktObj = textField(fields, "marketing:planejamento:estrategia:objetivo");
  const mktPromessa = textField(fields, "marketing:planejamento:estrategia:promessa-campanha");
  const mkt: string[] = [];
  if (mktObj) mkt.push(mktObj);
  if (mktPromessa) mkt.push(`Campanha: ${mktPromessa}`);
  const funil = repeaterLines(fields["marketing:planejamento:funil:etapas"], (r) => {
    const etapa = String(r.etapa ?? "").trim();
    if (!etapa) return null;
    return `${etapa} · ${String(r.canal ?? "").trim()} · meta ${String(r.meta ?? "").trim()}`;
  });
  mkt.push(...funil);
  if (mkt.length) sections.push({ title: "Marketing — planejamento", lines: mkt });

  const sim = computeLaunchRevenueProjection(fields);
  const simLines = sim.scenarios.map(
    (s) =>
      `${s.label}: ${s.buyers.toLocaleString("pt-BR")} vendas · R$ ${s.revenue.toLocaleString("pt-BR")}${s.roas != null ? ` · ROAS ${s.roas.toFixed(2)}` : ""}`
  );
  if (simLines.length) sections.push({ title: "Projeção de receita (simulador)", lines: simLines });

  const notes = textField(fields, "formula:sim:notas");
  if (notes) sections.push({ title: "Premissas do lançamento", lines: [notes] });

  const prog = launchOperationProgress(checklist);
  sections.push({
    title: "Execução FL (checklist)",
    lines: [`Progresso global do playbook: ${prog.done}/${prog.total} (${prog.percent}%)`]
  });

  let mktEmpty = 0;
  let mktTotal = 0;
  for (const section of MARKETING_PLANEJAMENTO_SECTIONS) {
    for (const field of section.fields) {
      mktTotal += 1;
      if (isBrandingFieldValueEmpty(fields[field.id])) mktEmpty += 1;
    }
  }
  if (mktTotal > 0) {
    const done = mktTotal - mktEmpty;
    sections.push({
      title: "Maturidade de dados",
      lines: [`Planejamento marketing: ${done}/${mktTotal} campos (${Math.round((done / mktTotal) * 100)}%)`]
    });
  }

  return sections;
}

export function buildLaunchPlanPdfModel(
  projectTitle: string,
  fields: BrandingWorkspaceData,
  checklist: Record<string, boolean>,
  generatedAt: string
): LaunchPlanPdfModel {
  const sections = buildLaunchPlanOutline(fields, checklist);
  const sim = computeLaunchRevenueProjection(fields);
  const prog = launchOperationProgress(checklist);

  return {
    projectTitle,
    generatedAt,
    sections,
    scenariosChart: sim.chart,
    checklistPercent: prog.percent
  };
}
