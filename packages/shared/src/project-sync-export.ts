/** Export / sync outbound — pacote para gateways e automação. */

import type { BrandingWorkspaceData } from "./branding-workspace.js";
import type { ProjectWorkspaceDocument } from "./project-workspace.js";
import { productOfferSnapshot } from "./project-product-offer.js";
import { projectWorkspaceFeedProjections } from "./project-workspace.js";
import { buildLaunchTemplateContext, renderAllLaunchTemplates } from "./project-launch-templates.js";

export type LaunchKitExport = {
  version: 1;
  exportedAt: string;
  product: ReturnType<typeof productOfferSnapshot>;
  projections: Record<string, { label: string; value?: string; sourceFieldId?: string }>;
  templates: ReturnType<typeof renderAllLaunchTemplates>["rendered"];
  checklistProgress: { done: number; total: number };
  meta: {
    gateway?: string;
    gatewayProductId?: string;
  };
};

export function buildLaunchKitExport(doc: ProjectWorkspaceDocument, projectTitle: string): LaunchKitExport {
  const fields = doc.fields;
  const offer = productOfferSnapshot(fields);
  const { rendered } = renderAllLaunchTemplates(fields);
  const ids = Object.keys(doc.checklist);
  const done = ids.filter((id) => doc.checklist[id]).length;

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    product: { ...offer, nome: offer.nome ?? projectTitle },
    projections: projectWorkspaceFeedProjections(fields),
    templates: rendered,
    checklistProgress: { done, total: ids.length },
    meta: {
      gateway: offer.gateway,
      gatewayProductId: offer.gatewayProductId
    }
  };
}

export type LeadloversAutomationBlueprint = {
  provider: "leadlovers";
  version: 1;
  tags: string[];
  sequences: {
    id: string;
    name: string;
    trigger: string;
    emails: { subject: string; bodyPreview: string }[];
  }[];
};

export function buildLeadloversBlueprint(fields: BrandingWorkspaceData): LeadloversAutomationBlueprint {
  const ctx = buildLaunchTemplateContext(fields);
  const produto = ctx.produto.replace(/\s+/g, "-").toLowerCase().slice(0, 40);

  return {
    provider: "leadlovers",
    version: 1,
    tags: [
      `ppl-inscrito-${produto}`,
      `cpl1-consumido-${produto}`,
      `carrinho-aberto-${produto}`
    ],
    sequences: [
      {
        id: "ppl-welcome",
        name: "PPL — Boas-vindas",
        trigger: "form.captacao.submitted",
        emails: [
          {
            subject: `Inscrição confirmada — ${ctx.produto}`,
            bodyPreview: ctx.promessa.slice(0, 240)
          }
        ]
      },
      {
        id: "cpl1-reminder",
        name: "CPL 1 — Lembrete",
        trigger: "tag.cpl1.pending",
        emails: [
          {
            subject: ctx.tagline,
            bodyPreview: ctx.manifesto.slice(0, 240)
          }
        ]
      },
      {
        id: "cart-open",
        name: "Vendas — Carrinho aberto",
        trigger: "launch.cart.open",
        emails: [
          {
            subject: `Inscrições abertas — ${ctx.produto}`,
            bodyPreview: `${ctx.promessa} — ${ctx.preco}`
          }
        ]
      }
    ]
  };
}

export type HotmartProductDraft = {
  provider: "hotmart";
  version: 1;
  name: string;
  description: string;
  priceHint?: string;
  externalId?: string;
  checkoutUrl?: string;
};

export function buildHotmartProductDraft(fields: BrandingWorkspaceData): HotmartProductDraft {
  const ctx = buildLaunchTemplateContext(fields);
  const offer = productOfferSnapshot(fields);
  return {
    provider: "hotmart",
    version: 1,
    name: ctx.produto,
    description: `${ctx.promessa}\n\n${ctx.manifesto}`.trim(),
    priceHint: offer.precoBrl,
    externalId: offer.gatewayProductId,
    checkoutUrl: offer.checkoutUrl
  };
}
