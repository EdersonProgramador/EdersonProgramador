/** Workspace unificado por projeto — campos (Branding…) + checklist (FL / Dev / Marketing). */

import { formatBrandingNamingForFeed, formatBrandingPaletteForFeed } from "./branding-studio.js";
import type { BrandingFieldValue, BrandingWorkspaceData } from "./branding-workspace.js";
import { brandingWorkspaceProgress, isBrandingFieldValueEmpty, parseBrandingWorkspaceJson } from "./branding-workspace.js";
import { marketingPlanejamentoProgress } from "./marketing-workspace.js";
import { MARKETING_PRODUCTION_VIEWS, marketingProductionResolvedItems } from "./launch-operation-marketing-production.js";
import { marketingDevAllTaskIds } from "./launch-operation-marketing-dev.js";
import {
  launchOperationPillarProgress,
  launchOperationProgress,
  parseLaunchOpCheckedJson,
  type LaunchOperationPillarId
} from "./launch-operation-phases.js";
import {
  PROJECT_WORKSPACE_FEED_RULES,
  type ProjectWorkspaceFeedRule
} from "./project-workspace-feeds.js";
import { productOfferProgress } from "./project-product-offer.js";

export const PROJECT_WORKSPACE_VERSION = 1 as const;

export type ProjectWorkspaceDocument = {
  version: typeof PROJECT_WORKSPACE_VERSION;
  fields: BrandingWorkspaceData;
  checklist: Record<string, boolean>;
  updatedAt?: string;
};

export type ProjectWorkspaceLegacySources = {
  projectWorkspaceJson?: unknown;
  brandingWorkspaceJson?: unknown;
  launchOpCheckedJson?: unknown;
};

export type OperationNavPillarId = "branding" | "marketing" | "development" | "formula";

export type ProgressSlice = { total: number; done: number; percent: number };

export function emptyProjectWorkspace(): ProjectWorkspaceDocument {
  return { version: PROJECT_WORKSPACE_VERSION, fields: {}, checklist: {} };
}

export function parseProjectWorkspaceJson(raw: unknown): ProjectWorkspaceDocument {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return emptyProjectWorkspace();
  }
  const o = raw as Record<string, unknown>;
  const version = o.version === 1 ? 1 : PROJECT_WORKSPACE_VERSION;
  const fields =
    o.fields && typeof o.fields === "object" && !Array.isArray(o.fields)
      ? (o.fields as BrandingWorkspaceData)
      : {};
  const checklist =
    o.checklist && typeof o.checklist === "object" && !Array.isArray(o.checklist)
      ? (o.checklist as Record<string, boolean>)
      : {};
  return {
    version,
    fields,
    checklist,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : undefined
  };
}

function legacyFields(sources: ProjectWorkspaceLegacySources): BrandingWorkspaceData {
  return parseBrandingWorkspaceJson(sources.brandingWorkspaceJson);
}

function legacyChecklist(sources: ProjectWorkspaceLegacySources): Record<string, boolean> {
  return parseLaunchOpCheckedJson(sources.launchOpCheckedJson);
}

/** Mescla documento canônico com colunas legadas (sem sobrescrever o que já existe no workspace). */
export function hydrateProjectWorkspace(sources: ProjectWorkspaceLegacySources): ProjectWorkspaceDocument {
  const stored = parseProjectWorkspaceJson(sources.projectWorkspaceJson);
  const branding = legacyFields(sources);
  const checklist = legacyChecklist(sources);

  const fields = { ...branding, ...stored.fields };
  const mergedChecklist = { ...checklist, ...stored.checklist };

  const hasStored =
    sources.projectWorkspaceJson != null &&
    typeof sources.projectWorkspaceJson === "object" &&
    !Array.isArray(sources.projectWorkspaceJson);

  return {
    version: PROJECT_WORKSPACE_VERSION,
    fields,
    checklist: mergedChecklist,
    updatedAt: stored.updatedAt ?? (hasStored ? undefined : new Date().toISOString())
  };
}

export function extractBrandingFields(doc: ProjectWorkspaceDocument): BrandingWorkspaceData {
  const out: BrandingWorkspaceData = {};
  for (const [key, value] of Object.entries(doc.fields)) {
    if (key.startsWith("branding:")) out[key] = value;
  }
  return out;
}

export function brandingFieldIdValid(fieldId: string): boolean {
  return /^branding:[a-z0-9:-]+$/i.test(fieldId);
}

export function workspaceFieldIdValid(fieldId: string): boolean {
  return /^(branding|product|integration|marketing|formula):[a-z0-9:-]+$/i.test(fieldId);
}

export function checklistTaskIdValid(taskId: string): boolean {
  return taskId.length >= 3 && taskId.length <= 120;
}

export function projectWorkspaceToLegacyColumns(doc: ProjectWorkspaceDocument): {
  projectWorkspaceJson: ProjectWorkspaceDocument;
  brandingWorkspaceJson: BrandingWorkspaceData;
  launchOpCheckedJson: Record<string, boolean>;
} {
  const normalized: ProjectWorkspaceDocument = {
    version: PROJECT_WORKSPACE_VERSION,
    fields: { ...doc.fields },
    checklist: { ...doc.checklist },
    updatedAt: new Date().toISOString()
  };
  return {
    projectWorkspaceJson: normalized,
    brandingWorkspaceJson: extractBrandingFields(normalized),
    launchOpCheckedJson: { ...normalized.checklist }
  };
}

function checklistSubsetProgress(ids: string[], checked: Record<string, boolean>): ProgressSlice {
  const total = ids.length;
  const done = ids.filter((id) => checked[id]).length;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

function mergeProgress(a: ProgressSlice, b: ProgressSlice): ProgressSlice {
  const total = a.total + b.total;
  const done = a.done + b.done;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

function marketingProductionTaskIds(): string[] {
  const set = new Set<string>();
  for (const view of MARKETING_PRODUCTION_VIEWS) {
    for (const row of marketingProductionResolvedItems(view)) {
      set.add(row.taskId);
    }
  }
  return [...set];
}

export function projectWorkspaceNavPillarProgress(
  doc: ProjectWorkspaceDocument,
  pillar: OperationNavPillarId
): ProgressSlice {
  switch (pillar) {
    case "branding":
      return brandingWorkspaceProgress(doc.fields);
    case "marketing":
      return mergeProgress(
        mergeProgress(
          checklistSubsetProgress(marketingProductionTaskIds(), doc.checklist),
          productOfferProgress(doc.fields)
        ),
        marketingPlanejamentoProgress(doc.fields)
      );
    case "development":
      return checklistSubsetProgress(marketingDevAllTaskIds(), doc.checklist);
    case "formula":
      return launchOperationPillarProgress("formula", doc.checklist);
    default:
      return { total: 0, done: 0, percent: 0 };
  }
}

export function projectWorkspaceSummary(doc: ProjectWorkspaceDocument) {
  const branding = projectWorkspaceNavPillarProgress(doc, "branding");
  const marketing = projectWorkspaceNavPillarProgress(doc, "marketing");
  const development = projectWorkspaceNavPillarProgress(doc, "development");
  const formula = projectWorkspaceNavPillarProgress(doc, "formula");

  const total = branding.total + marketing.total + development.total + formula.total;
  const done = branding.done + marketing.done + development.done + formula.done;

  return {
    branding,
    marketing,
    development,
    formula,
    overall: {
      total,
      done,
      percent: total === 0 ? 0 : Math.round((done / total) * 100)
    },
    launchPillars: {
      branding: launchOperationPillarProgress("branding", doc.checklist),
      "marketing-tech": launchOperationPillarProgress("marketing-tech", doc.checklist),
      formula: launchOperationPillarProgress("formula", doc.checklist)
    },
    launchChecklist: launchOperationProgress(doc.checklist)
  };
}

function fieldAsText(fieldId: string, value: BrandingFieldValue | undefined): string | undefined {
  if (value === undefined || isBrandingFieldValueEmpty(value)) return undefined;
  if (fieldId === "branding:identidade:visual:paleta") {
    return formatBrandingPaletteForFeed(value);
  }
  if (fieldId === "branding:identidade:verbal:naming-opcoes") {
    return formatBrandingNamingForFeed(value);
  }
  if (typeof value === "string") return value.trim() || undefined;
  if (Array.isArray(value)) return undefined;
  if ("rows" in value && Array.isArray(value.rows)) {
    const first = value.rows.find((row) => Object.values(row).some((c) => String(c ?? "").trim()));
    if (!first) return undefined;
    return Object.values(first)
      .map((c) => String(c ?? "").trim())
      .filter(Boolean)
      .join(" · ");
  }
  if ("url" in value) return value.name || value.url;
  return undefined;
}

export function resolveWorkspaceFeed(
  rule: ProjectWorkspaceFeedRule,
  fields: BrandingWorkspaceData
): { value?: string; sourceFieldId?: string } {
  for (const sourceId of rule.sourceFieldIds) {
    const text = fieldAsText(sourceId, fields[sourceId]);
    if (text) return { value: text, sourceFieldId: sourceId };
  }
  return {};
}

export function projectWorkspaceFeedProjections(fields: BrandingWorkspaceData): Record<
  string,
  { label: string; value?: string; sourceFieldId?: string }
> {
  const out: Record<string, { label: string; value?: string; sourceFieldId?: string }> = {};
  for (const rule of PROJECT_WORKSPACE_FEED_RULES) {
    out[rule.targetId] = { label: rule.label, ...resolveWorkspaceFeed(rule, fields) };
  }
  return out;
}

export { PROJECT_WORKSPACE_FEED_RULES };
