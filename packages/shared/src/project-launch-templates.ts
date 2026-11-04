/** Templates LP / e-mail — placeholders preenchidos pelo workspace. */

import type { BrandingWorkspaceData } from "./branding-workspace.js";
import { productOfferSnapshot } from "./project-product-offer.js";
import { projectWorkspaceFeedProjections } from "./project-workspace.js";

export type LaunchTemplateId =
  | "lp-hero"
  | "lp-capture-form"
  | "email-ppl-confirm"
  | "email-cpl1-invite"
  | "email-cart-open";

export type LaunchTemplateDef = {
  id: LaunchTemplateId;
  label: string;
  channel: "lp" | "email";
  /** Placeholders: {{promessa}}, {{tagline}}, {{manifesto}}, {{produto}}, {{preco}}, {{checkout}}, {{persona}} */
  body: string;
};

export const LAUNCH_TEMPLATES: readonly LaunchTemplateDef[] = [
  {
    id: "lp-hero",
    label: "LP — Hero (captação PPL)",
    channel: "lp",
    body: `<section class="launch-hero">
  <p class="eyebrow">{{tagline}}</p>
  <h1>{{promessa}}</h1>
  <p class="lead">{{persona}}</p>
  <a href="{{checkout}}" class="cta">Quero me inscrever no evento</a>
</section>`
  },
  {
    id: "lp-capture-form",
    label: "LP — Bloco formulário (copy)",
    channel: "lp",
    body: `<div class="capture-copy">
  <h2>Inscreva-se no {{produto}}</h2>
  <p>{{manifesto}}</p>
  <p><small>Garantia: consulte condições na página de vendas.</small></p>
</div>`
  },
  {
    id: "email-ppl-confirm",
    label: "E-mail — Confirmação de inscrição (PPL)",
    channel: "email",
    body: `Assunto: Inscrição confirmada — {{produto}}

Olá!

Sua vaga no {{produto}} está confirmada.

{{promessa}}

Próximo passo: fique de olho no e-mail com o link do CPL 1.

{{checkout}}`
  },
  {
    id: "email-cpl1-invite",
    label: "E-mail — Convite CPL 1",
    channel: "email",
    body: `Assunto: [AO VIVO] {{tagline}}

{{manifesto}}

Clique para assistir ao CPL 1 e entender como {{promessa}}`
  },
  {
    id: "email-cart-open",
    label: "E-mail — Carrinho aberto",
    channel: "email",
    body: `Assunto: Inscrições abertas — {{produto}} por {{preco}}

{{promessa}}

Garanta sua vaga: {{checkout}}`
  }
] as const;

export type LaunchTemplateContext = {
  promessa: string;
  tagline: string;
  manifesto: string;
  produto: string;
  preco: string;
  checkout: string;
  persona: string;
};

export function buildLaunchTemplateContext(fields: BrandingWorkspaceData): LaunchTemplateContext {
  const projections = projectWorkspaceFeedProjections(fields);
  const offer = productOfferSnapshot(fields);
  const pick = (id: string) => projections[id]?.value ?? "";

  return {
    promessa: pick("launch:copy:promessa") || offer.promessa || "[Defina promessa FL ou Branding]",
    tagline: pick("launch:copy:tagline") || "[Tagline]",
    manifesto: pick("launch:copy:manifesto") || "[Manifesto]",
    produto: pick("product:offer:nome") || offer.nome || "[Nome do produto]",
    preco: offer.precoBrl ? `R$ ${offer.precoBrl}` : "[Preço]",
    checkout: pick("marketing:checkout:url") || offer.checkoutUrl || "[URL checkout]",
    persona: pick("marketing:persona:resumo") || "[Persona]"
  };
}

export function renderLaunchTemplate(template: LaunchTemplateDef, ctx: LaunchTemplateContext): string {
  return template.body
    .replace(/\{\{promessa\}\}/g, ctx.promessa)
    .replace(/\{\{tagline\}\}/g, ctx.tagline)
    .replace(/\{\{manifesto\}\}/g, ctx.manifesto)
    .replace(/\{\{produto\}\}/g, ctx.produto)
    .replace(/\{\{preco\}\}/g, ctx.preco)
    .replace(/\{\{checkout\}\}/g, ctx.checkout)
    .replace(/\{\{persona\}\}/g, ctx.persona);
}

export function getLaunchTemplateById(id: LaunchTemplateId): LaunchTemplateDef | undefined {
  return LAUNCH_TEMPLATES.find((t) => t.id === id);
}

/** E-mails no formato "Assunto: …" + corpo. */
export function parseEmailTemplateContent(content: string): { subject: string; bodyText: string; bodyHtml: string } {
  const normalized = content.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  let subject = "Lançamento";
  let bodyStart = 0;
  if (lines[0]?.trim().toLowerCase().startsWith("assunto:")) {
    subject = lines[0].replace(/^assunto:\s*/i, "").trim();
    bodyStart = 1;
    while (lines[bodyStart] === "") bodyStart += 1;
  }
  const bodyText = lines.slice(bodyStart).join("\n").trim();
  const bodyHtml = bodyText
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return { subject, bodyText, bodyHtml };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildLaunchLandingDocument(fields: BrandingWorkspaceData): {
  heroHtml: string;
  captureHtml: string;
  documentHtml: string;
} {
  const ctx = buildLaunchTemplateContext(fields);
  const hero = LAUNCH_TEMPLATES.find((t) => t.id === "lp-hero")!;
  const capture = LAUNCH_TEMPLATES.find((t) => t.id === "lp-capture-form")!;
  const heroHtml = renderLaunchTemplate(hero, ctx);
  const captureHtml = renderLaunchTemplate(capture, ctx);
  const documentHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(ctx.produto)}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: #0f172a; color: #f8fafc; }
    .launch-hero { max-width: 40rem; margin: 0 auto; padding: 3rem 1.25rem; text-align: center; }
    .launch-hero .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; opacity: 0.85; }
    .launch-hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); line-height: 1.15; margin: 0.75rem 0; }
    .launch-hero .lead { opacity: 0.9; font-size: 1.05rem; }
    .launch-hero .cta, .launch-capture .cta {
      display: inline-block; margin-top: 1.5rem; padding: 0.85rem 1.5rem;
      background: #38bdf8; color: #0f172a; font-weight: 700; text-decoration: none; border-radius: 0.5rem;
    }
    .launch-capture { max-width: 28rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    .capture-copy h2 { font-size: 1.25rem; }
    form.launch-form { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
    form.launch-form input, form.launch-form textarea {
      padding: 0.65rem 0.75rem; border-radius: 0.375rem; border: 1px solid #334155; background: #1e293b; color: #f8fafc;
    }
    form.launch-form button { padding: 0.75rem; border: 0; border-radius: 0.375rem; background: #38bdf8; font-weight: 700; cursor: pointer; }
  </style>
</head>
<body>
  ${heroHtml}
  <section class="launch-capture">
    ${captureHtml}
    <form class="launch-form" data-launch-capture="1" method="post">
      <input name="name" required placeholder="Seu nome" autocomplete="name"/>
      <input name="email" type="email" required placeholder="E-mail" autocomplete="email"/>
      <input name="phone" placeholder="WhatsApp (opcional)" autocomplete="tel"/>
      <button type="submit">Confirmar inscrição</button>
    </form>
  </section>
</body>
</html>`;
  return { heroHtml, captureHtml, documentHtml };
}

export function renderAllLaunchTemplates(fields: BrandingWorkspaceData): {
  context: LaunchTemplateContext;
  rendered: { id: LaunchTemplateId; label: string; channel: "lp" | "email"; content: string }[];
} {
  const context = buildLaunchTemplateContext(fields);
  const rendered = LAUNCH_TEMPLATES.map((t) => ({
    id: t.id,
    label: t.label,
    channel: t.channel,
    content: renderLaunchTemplate(t, context)
  }));
  return { context, rendered };
}
