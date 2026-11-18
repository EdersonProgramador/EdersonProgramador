import type { FastifyBaseLogger } from "fastify";
import { env } from "../env.js";
import { sendTransactionalMessage, sendWhatsAppMessage } from "../integrations/messaging/hub.js";

export type LeadInboxPayload = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  source?: string | null;
  packageTier?: string | null;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isQuizLead(lead: LeadInboxPayload) {
  return (
    lead.source === "qualification_quiz" ||
    /\[Quiz de diagnóstico/i.test(lead.message) ||
    /\/formulario/i.test(lead.message)
  );
}

function resolveInboxEmail() {
  return env.LEAD_NOTIFY_EMAIL || env.ADMIN_EMAIL || undefined;
}

function buildSubject(lead: LeadInboxPayload) {
  return isQuizLead(lead)
    ? `Diagnóstico recebido — ${lead.name}`
    : `Novo lead — ${lead.name}`;
}

function buildEmailHtml(lead: LeadInboxPayload) {
  const origin = lead.source?.replace(/_/g, " ") ?? "site";
  const body = escapeHtml(lead.message).replace(/\n/g, "<br/>");
  return `
    <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.5;color:#111">
      <h2 style="margin:0 0 12px">${escapeHtml(buildSubject(lead))}</h2>
      <p style="margin:0 0 8px"><strong>Nome:</strong> ${escapeHtml(lead.name)}</p>
      <p style="margin:0 0 8px"><strong>E-mail:</strong> ${escapeHtml(lead.email)}</p>
      <p style="margin:0 0 8px"><strong>WhatsApp:</strong> ${escapeHtml(lead.phone?.trim() || "—")}</p>
      <p style="margin:0 0 8px"><strong>Origem:</strong> ${escapeHtml(origin)}</p>
      ${lead.packageTier ? `<p style="margin:0 0 8px"><strong>Pacote:</strong> ${escapeHtml(lead.packageTier)}</p>` : ""}
      <hr style="border:none;border-top:1px solid #ddd;margin:16px 0" />
      <div style="white-space:normal">${body}</div>
      <p style="margin:16px 0 0;font-size:12px;color:#666">Lead ID: ${escapeHtml(lead.id)}</p>
    </div>
  `.trim();
}

function buildWhatsAppText(lead: LeadInboxPayload) {
  const origin = lead.source?.replace(/_/g, " ") ?? "site";
  const title = isQuizLead(lead) ? "Diagnóstico (/formulario)" : "Novo lead";
  return [
    `*${title}*`,
    `Nome: ${lead.name}`,
    `E-mail: ${lead.email}`,
    `WhatsApp: ${lead.phone?.trim() || "—"}`,
    `Origem: ${origin}`,
    lead.packageTier ? `Pacote: ${lead.packageTier}` : null,
    "",
    lead.message.trim(),
    "",
    `ID: ${lead.id}`
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** Dispara e-mail + WhatsApp para o inbox registrado (LEAD_NOTIFY_* / ADMIN_EMAIL). */
export async function notifyLeadInboxChannels(lead: LeadInboxPayload, log?: FastifyBaseLogger) {
  const inboxEmail = resolveInboxEmail();
  const inboxWhatsApp = env.LEAD_NOTIFY_WHATSAPP;
  const subject = buildSubject(lead);
  const html = buildEmailHtml(lead);
  const text = buildWhatsAppText(lead);

  if (inboxEmail) {
    const emailRes = await sendTransactionalMessage(
      { to: inboxEmail, name: env.ADMIN_NAME, subject, html },
      { provider: "auto" },
      log
    );
    if (emailRes.skipped) {
      log?.warn({ detail: emailRes.detail, to: inboxEmail }, "E-mail de inbox do lead ignorado");
    } else if (!emailRes.ok) {
      log?.warn({ detail: emailRes.detail, to: inboxEmail }, "Falha ao e-mailar inbox do lead");
    } else {
      log?.info({ to: inboxEmail }, "E-mail de inbox do lead enviado");
    }
  } else {
    log?.warn("LEAD_NOTIFY_EMAIL/ADMIN_EMAIL ausente — e-mail de inbox não enviado");
  }

  if (inboxWhatsApp) {
    const waRes = await sendWhatsAppMessage(
      { phone: inboxWhatsApp, text, name: lead.name },
      { provider: "auto" },
      log
    );
    if (waRes.skipped) {
      log?.warn({ detail: waRes.detail, phone: inboxWhatsApp }, "WhatsApp de inbox do lead ignorado");
    } else if (!waRes.ok) {
      log?.warn({ detail: waRes.detail, phone: inboxWhatsApp }, "Falha ao enviar WhatsApp de inbox");
    } else {
      log?.info({ phone: inboxWhatsApp }, "WhatsApp de inbox do lead enviado");
    }
  } else {
    log?.warn("LEAD_NOTIFY_WHATSAPP ausente — WhatsApp de inbox não enviado");
  }
}
