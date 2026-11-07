/** Studios de Branding — paleta, naming e integrações (valores estruturados no workspace). */

import type { BrandingFieldValue, BrandingWorkspaceData } from "./branding-workspace.js";

export const BRANDING_PALETTE_FIELD_ID = "branding:identidade:visual:paleta" as const;
export const BRANDING_NAMING_FIELD_ID = "branding:identidade:verbal:naming-opcoes" as const;

export type BrandingPaletteRole = "primary" | "secondary" | "accent" | "neutral" | "support";

export type BrandingPaletteSwatch = {
  id: string;
  name: string;
  hex: string;
  role: BrandingPaletteRole;
};

export type BrandingPaletteValue = {
  kind: "palette";
  swatches: BrandingPaletteSwatch[];
  notes?: string;
};

export type BrandingNamingOption = {
  nome: string;
  fonetica?: string;
  inpi?: string;
  dominio?: string;
  score?: number;
};

export type BrandingNamingStudioValue = {
  kind: "naming-studio";
  criteria?: string;
  options: BrandingNamingOption[];
  chosen?: string;
};

export type BrandingStudioValue = BrandingPaletteValue | BrandingNamingStudioValue;

export function isBrandingPaletteValue(value: unknown): value is BrandingPaletteValue {
  return (
    !!value &&
    typeof value === "object" &&
    (value as BrandingPaletteValue).kind === "palette" &&
    Array.isArray((value as BrandingPaletteValue).swatches)
  );
}

export function isBrandingNamingStudioValue(value: unknown): value is BrandingNamingStudioValue {
  return (
    !!value &&
    typeof value === "object" &&
    (value as BrandingNamingStudioValue).kind === "naming-studio" &&
    Array.isArray((value as BrandingNamingStudioValue).options)
  );
}

export function defaultBrandingPaletteValue(): BrandingPaletteValue {
  return {
    kind: "palette",
    swatches: [
      { id: "primary", name: "Primária", hex: "#5B21B6", role: "primary" },
      { id: "secondary", name: "Secundária", hex: "#0F172A", role: "secondary" },
      { id: "accent", name: "Destaque", hex: "#F59E0B", role: "accent" }
    ]
  };
}

export function defaultBrandingNamingStudioValue(): BrandingNamingStudioValue {
  return { kind: "naming-studio", options: [] };
}

/** Aceita JSON do studio, repeater legado ou texto com HEX. */
export function parseBrandingPaletteField(value: BrandingFieldValue | undefined): BrandingPaletteValue {
  if (isBrandingPaletteValue(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const hexes = value.match(/#[0-9A-Fa-f]{6}\b/g) ?? [];
    if (hexes.length) {
      return {
        kind: "palette",
        notes: value.trim(),
        swatches: hexes.map((hex, i) => ({
          id: `import-${i}`,
          name: `Cor ${i + 1}`,
          hex,
          role: (i === 0 ? "primary" : i === 1 ? "secondary" : "support") as BrandingPaletteRole
        }))
      };
    }
    return { kind: "palette", swatches: [], notes: value.trim() };
  }
  return defaultBrandingPaletteValue();
}

export function parseBrandingNamingField(value: BrandingFieldValue | undefined): BrandingNamingStudioValue {
  if (isBrandingNamingStudioValue(value)) return value;
  if (value && typeof value === "object" && "rows" in value && Array.isArray(value.rows)) {
    const options: BrandingNamingOption[] = value.rows
      .map((row) => ({
        nome: String(row.nome ?? "").trim(),
        fonetica: String(row.fonetica ?? "").trim() || undefined,
        inpi: String(row.inpi ?? "").trim() || undefined,
        dominio: String(row.dominio ?? "").trim() || undefined
      }))
      .filter((o) => o.nome.length > 0);
    return { kind: "naming-studio", options };
  }
  return defaultBrandingNamingStudioValue();
}

export function brandingPaletteValueEmpty(value: BrandingPaletteValue): boolean {
  return !value.swatches.some((s) => /^#[0-9A-Fa-f]{6}$/.test(s.hex.trim()));
}

export function brandingNamingStudioValueEmpty(value: BrandingNamingStudioValue): boolean {
  return value.options.every((o) => !o.nome.trim());
}

export function formatBrandingPaletteForFeed(value: BrandingFieldValue | undefined): string | undefined {
  const palette = parseBrandingPaletteField(value);
  if (brandingPaletteValueEmpty(palette)) {
    if (palette.notes?.trim()) return palette.notes.trim();
    return undefined;
  }
  return palette.swatches
    .filter((s) => s.hex.trim())
    .map((s) => `${s.name}: ${s.hex.toUpperCase()}`)
    .join(" · ");
}

export function formatBrandingNamingForFeed(value: BrandingFieldValue | undefined): string | undefined {
  const studio = parseBrandingNamingField(value);
  const name = studio.chosen?.trim() || studio.options.find((o) => o.nome.trim())?.nome?.trim();
  return name || undefined;
}

export type BrandbookSection = {
  title: string;
  lines: string[];
};

export type BrandbookPdfModel = {
  projectTitle: string;
  generatedAt: string;
  sections: BrandbookSection[];
  palette: BrandingPaletteValue;
  logoAssetUrls: string[];
  moodboardAssetUrls: string[];
  tagline?: string;
  manifesto?: string;
};

const LOGO_FIELD = "branding:identidade:visual:logo-arquivos";
const MOODBOARD_FIELD = "branding:identidade:visual:moodboard";

function mediaUrlsFromField(value: BrandingFieldValue | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((m) => m.url).filter((u) => typeof u === "string" && u.trim());
  }
  if (typeof value === "object" && "url" in value && !("rows" in value)) {
    const u = (value as { url: string }).url;
    return u?.trim() ? [u] : [];
  }
  return [];
}

function repeaterLines(
  value: BrandingFieldValue | undefined,
  format: (row: Record<string, string>) => string | null
): string[] {
  if (!value || typeof value !== "object" || !("rows" in value)) return [];
  const rows = (value as { rows: Record<string, string>[] }).rows;
  return rows.map(format).filter((l): l is string => Boolean(l?.trim()));
}

/** Modelo completo para PDF/HTML do brandbook. */
export function buildBrandbookPdfModel(
  projectTitle: string,
  fields: BrandingWorkspaceData,
  generatedAt: string
): BrandbookPdfModel {
  const sections = buildBrandbookOutline(fields);

  const benchmark = repeaterLines(fields["branding:diagnostico:benchmark:matriz"], (r) => {
    const marca = String(r.marca ?? "").trim();
    if (!marca) return null;
    const brecha = String(r.brecha ?? "").trim();
    return brecha ? `${marca} — brecha: ${brecha}` : `${marca} — ${String(r.posicionamento ?? "").trim()}`;
  });
  if (benchmark.length) sections.push({ title: "Benchmark competitivo", lines: benchmark });

  const voz = repeaterLines(fields["branding:plataforma:voz:tom-canais"], (r) => {
    const canal = String(r.canal ?? "").trim();
    const tom = String(r.tom ?? "").trim();
    if (!canal) return null;
    return tom ? `${canal}: ${tom}` : canal;
  });
  if (voz.length) sections.push({ title: "Tom de voz por canal", lines: voz });

  const audit = repeaterLines(fields["branding:diagnostico:audit:links"], (r) => {
    const canal = String(r.canal ?? "").trim();
    const problema = String(r.problema ?? "").trim();
    if (!canal) return null;
    return problema ? `${canal}: ${problema}` : canal;
  });
  if (audit.length) sections.push({ title: "Auditoria de marca", lines: audit });

  const cronograma = repeaterLines(fields["branding:implementacao:ativacao:cronograma"], (r) => {
    const data = String(r.data ?? "").trim();
    const acao = String(r.acao ?? "").trim();
    if (!acao) return null;
    return data ? `${data} — ${acao}` : acao;
  });
  if (cronograma.length) sections.push({ title: "Cronograma de ativação", lines: cronograma });

  const tagline = fields["branding:identidade:verbal:tagline"];
  const manifesto = fields["branding:identidade:verbal:manifesto"];

  return {
    projectTitle,
    generatedAt,
    sections,
    palette: parseBrandingPaletteField(fields[BRANDING_PALETTE_FIELD_ID]),
    logoAssetUrls: mediaUrlsFromField(fields[LOGO_FIELD]),
    moodboardAssetUrls: mediaUrlsFromField(fields[MOODBOARD_FIELD]),
    tagline: typeof tagline === "string" && tagline.trim() ? tagline.trim() : undefined,
    manifesto: typeof manifesto === "string" && manifesto.trim() ? manifesto.trim() : undefined
  };
}

/** Conteúdo textual do brandbook a partir do workspace (PDF/HTML). */
export function buildBrandbookOutline(fields: BrandingWorkspaceData): BrandbookSection[] {
  void fields;
  return [];
}
