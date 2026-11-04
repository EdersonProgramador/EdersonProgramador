import { parseEmailTemplateContent, type LaunchTemplateId, getLaunchTemplateById, renderLaunchTemplate, buildLaunchTemplateContext } from "@ederson-agencia/shared";
import type { BrandingWorkspaceData } from "@ederson-agencia/shared";
import { env } from "../env.js";

export async function sendLaunchTemplateEmail(input: {
  to: string;
  templateId: LaunchTemplateId;
  fields: BrandingWorkspaceData;
  log: { info: (obj: unknown, msg?: string) => void; warn: (obj: unknown, msg?: string) => void };
}): Promise<{ sent: boolean; subject?: string; preview?: { subject: string; html: string } }> {
  const template = getLaunchTemplateById(input.templateId);
  if (!template || template.channel !== "email") {
    throw Object.assign(new Error("Template de e-mail inválido."), { statusCode: 400 });
  }

  const ctx = buildLaunchTemplateContext(input.fields);
  const rendered = renderLaunchTemplate(template, ctx);
  const { subject, bodyHtml } = parseEmailTemplateContent(rendered);

  const from = env.MAIL_FROM;
  const apiKey = env.RESEND_API_KEY;

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.55;color:#111;max-width:36rem">
      ${bodyHtml}
    </div>
  `.trim();

  if (!apiKey || !from) {
    input.log.info({ to: input.to, subject, templateId: input.templateId }, "Launch e-mail (Resend não configurado)");
    return { sent: false, preview: { subject, html } };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject,
      html
    })
  });

  if (!res.ok) {
    const text = await res.text();
    input.log.warn({ status: res.status, text }, "Falha Resend (launch template)");
    return { sent: false, preview: { subject, html } };
  }

  return { sent: true, subject };
}
