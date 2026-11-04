/** Produto & oferta (checkout) — campos no workspace, inspirado Hotmart / Kiwify / Monetizze. */

import type { BrandingFieldDef, BrandingFieldValue, BrandingWorkspaceData } from "./branding-workspace.js";
import { isBrandingFieldValueEmpty } from "./branding-workspace.js";

const P = "product";

function pid(section: string, field: string): string {
  return `${P}:${section}:${field}`;
}

export const PRODUCT_OFFER_FIELDS: readonly BrandingFieldDef[] = [
  {
    id: pid("core", "nome"),
    label: "Nome do produto",
    type: "text",
    placeholder: "Como aparece no checkout e área de membros"
  },
  {
    id: pid("core", "formato"),
    label: "Formato",
    type: "text",
    placeholder: "Curso, mentoria, software, comunidade…"
  },
  {
    id: pid("core", "nicho"),
    label: "Nicho / categoria",
    type: "text"
  },
  {
    id: pid("offer", "promessa-fl"),
    label: "Promessa principal (FL)",
    type: "textarea",
    description: "Prioridade sobre Branding nas projeções de copy do lançamento."
  },
  {
    id: pid("offer", "preco-brl"),
    label: "Preço principal (R$)",
    type: "text",
    placeholder: "Ex.: 1997,00"
  },
  {
    id: pid("offer", "ancora"),
    label: "Preço âncora / de / por",
    type: "textarea"
  },
  {
    id: pid("offer", "parcelas"),
    label: "Parcelamento",
    type: "text",
    placeholder: "Ex.: 12x de R$ 197"
  },
  {
    id: pid("offer", "garantia"),
    label: "Garantia",
    type: "textarea"
  },
  {
    id: pid("offer", "bonus"),
    label: "Bônus e order bumps",
    type: "textarea"
  },
  {
    id: pid("gateway", "provedor"),
    label: "Gateway preferido",
    type: "text",
    placeholder: "hotmart | kiwify | monetizze | leadlovers"
  },
  {
    id: pid("gateway", "product-id"),
    label: "ID do produto no gateway",
    type: "text"
  },
  {
    id: pid("gateway", "checkout-url"),
    label: "URL do checkout",
    type: "url"
  },
  {
    id: pid("gateway", "members-url"),
    label: "URL área de membros",
    type: "url"
  },
  {
    id: pid("affiliate", "comissao"),
    label: "Programa de afiliados (comissão / regras)",
    type: "textarea"
  }
] as const;

export function extractProductFields(fields: BrandingWorkspaceData): BrandingWorkspaceData {
  const out: BrandingWorkspaceData = {};
  for (const [key, value] of Object.entries(fields)) {
    if (key.startsWith(`${P}:`)) out[key] = value;
  }
  return out;
}

export function productOfferProgress(fields: BrandingWorkspaceData): {
  total: number;
  done: number;
  percent: number;
} {
  let total = 0;
  let done = 0;
  for (const def of PRODUCT_OFFER_FIELDS) {
    total += 1;
    if (!isBrandingFieldValueEmpty(fields[def.id])) done += 1;
  }
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function productFieldIds(): string[] {
  return PRODUCT_OFFER_FIELDS.map((f) => f.id);
}

export function isProductFieldId(fieldId: string): boolean {
  return fieldId.startsWith(`${P}:`);
}

export type ProductOfferSnapshot = {
  nome?: string;
  promessa?: string;
  precoBrl?: string;
  checkoutUrl?: string;
  gateway?: string;
  gatewayProductId?: string;
};

function textField(fields: BrandingWorkspaceData, id: string): string | undefined {
  const v = fields[id];
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

export function productOfferSnapshot(fields: BrandingWorkspaceData): ProductOfferSnapshot {
  return {
    nome: textField(fields, pid("core", "nome")),
    promessa: textField(fields, pid("offer", "promessa-fl")),
    precoBrl: textField(fields, pid("offer", "preco-brl")),
    checkoutUrl: textField(fields, pid("gateway", "checkout-url")),
    gateway: textField(fields, pid("gateway", "provedor")),
    gatewayProductId: textField(fields, pid("gateway", "product-id"))
  };
}
