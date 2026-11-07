/** Operação Branding — etapas, seções e campos de captura por projeto/cliente. */

import {
  brandingNamingStudioValueEmpty,
  brandingPaletteValueEmpty,
  isBrandingNamingStudioValue,
  isBrandingPaletteValue,
  parseBrandingNamingField,
  parseBrandingPaletteField,
  type BrandingNamingStudioValue,
  type BrandingPaletteValue
} from "./branding-studio.js";

export type BrandingEtapaId = string;

export type BrandingFieldType =
  | "text"
  | "textarea"
  | "url"
  | "audio"
  | "video"
  | "file"
  | "files"
  | "repeater"
  | "palette"
  | "naming-studio";

export type BrandingRepeaterColumn = {
  key: string;
  label: string;
  input: "text" | "textarea" | "url";
};

export type BrandingFieldDef = {
  id: string;
  label: string;
  description?: string;
  type: BrandingFieldType;
  placeholder?: string;
  columns?: BrandingRepeaterColumn[];
  acceptHint?: string;
};

export type BrandingSectionDef = {
  id: string;
  title: string;
  intro?: string;
  fields: BrandingFieldDef[];
};

export type BrandingEtapaDef = {
  id: BrandingEtapaId;
  order: number;
  emoji: string;
  navLabel: string;
  title: string;
  subtitle: string;
  sections: BrandingSectionDef[];
};

export type BrandingMediaAsset = {
  url: string;
  name: string;
  mimeType?: string;
  uploadedAt?: string;
};

export type BrandingRepeaterValue = { rows: Record<string, string>[] };

export type BrandingFieldValue =
  | string
  | BrandingMediaAsset
  | BrandingMediaAsset[]
  | BrandingRepeaterValue
  | BrandingPaletteValue
  | BrandingNamingStudioValue;

export type BrandingWorkspaceData = Record<string, BrandingFieldValue>;

/** Conteúdo esvaziado — a sequência será redefinida pela agência. */
export const BRANDING_ETAPAS: readonly BrandingEtapaDef[] = [];

export function getBrandingEtapa(id: string): BrandingEtapaDef | undefined {
  return BRANDING_ETAPAS.find((e) => e.id === id);
}

export function brandingEtapaAdminPath(etapaId: BrandingEtapaId): string {
  return `operacao/branding/${etapaId}`;
}

export function isBrandingFieldValueEmpty(value: BrandingFieldValue | undefined): boolean {
  if (value === undefined || value === null) return true;
  if (isBrandingPaletteValue(value)) return brandingPaletteValueEmpty(value);
  if (isBrandingNamingStudioValue(value)) return brandingNamingStudioValueEmpty(value);
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if ("url" in value && !("rows" in value)) return !value.url?.trim();
  if ("rows" in value && Array.isArray((value as BrandingRepeaterValue).rows)) {
    const rows = (value as BrandingRepeaterValue).rows;
    if (rows.length === 0) return true;
    return rows.every((row) => Object.values(row).every((c) => !String(c ?? "").trim()));
  }
  return true;
}

export function brandingEtapaProgress(
  etapa: BrandingEtapaDef,
  data: BrandingWorkspaceData
): { total: number; done: number; percent: number } {
  let total = 0;
  let done = 0;
  for (const section of etapa.sections) {
    for (const field of section.fields) {
      total += 1;
      if (!isBrandingFieldValueEmpty(data[field.id])) done += 1;
    }
  }
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function brandingWorkspaceProgress(data: BrandingWorkspaceData): {
  total: number;
  done: number;
  percent: number;
} {
  let total = 0;
  let done = 0;
  for (const etapa of BRANDING_ETAPAS) {
    const p = brandingEtapaProgress(etapa, data);
    total += p.total;
    done += p.done;
  }
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function parseBrandingWorkspaceJson(raw: unknown): BrandingWorkspaceData {
  if (raw == null) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as BrandingWorkspaceData;
}

export function adjacentBrandingEtapa(
  currentId: BrandingEtapaId,
  direction: "prev" | "next"
): BrandingEtapaDef | null {
  const index = BRANDING_ETAPAS.findIndex((e) => e.id === currentId);
  const next = direction === "prev" ? index - 1 : index + 1;
  return BRANDING_ETAPAS[next] ?? null;
}
