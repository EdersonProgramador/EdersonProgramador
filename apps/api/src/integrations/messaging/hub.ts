import type { FastifyBaseLogger } from "fastify";
import type { MessagingContactProvider, MessagingEmailProvider, MessagingEventProvider } from "@ederson-agencia/shared";
import { env } from "../../env.js";
import {
  brevoConfigured,
  brevoSendSms,
  brevoSendTransactional,
  brevoTrackEvent,
  brevoUpsertContact
} from "../brevo/brevo-client.js";
import { buildBrevoAttributes } from "../../automation/template-vars.js";
import type { AutomationContext } from "../../automation/types.js";

type StepResult = { ok: boolean; skipped?: boolean; detail?: string };

function pickContactProvider(explicit?: string): MessagingContactProvider {
  if (explicit && explicit !== "auto") return explicit as MessagingContactProvider;
  if (env.MESSAGING_CONTACT_PROVIDER && env.MESSAGING_CONTACT_PROVIDER !== "auto") {
    return env.MESSAGING_CONTACT_PROVIDER;
  }
  if (brevoConfigured()) return "brevo";
  if (env.LEADLOVERS_API_URL) return "leadlovers";
  if (env.N8N_LEAD_WEBHOOK_URL) return "webhook";
  return "none";
}

function pickEmailProvider(explicit?: string): MessagingEmailProvider {
  if (explicit && explicit !== "auto") return explicit as MessagingEmailProvider;
  if (env.MESSAGING_EMAIL_PROVIDER && env.MESSAGING_EMAIL_PROVIDER !== "auto") {
    return env.MESSAGING_EMAIL_PROVIDER;
  }
  if (env.RESEND_API_KEY && env.MAIL_FROM) return "resend";
  if (brevoConfigured()) return "brevo";
  return "none";
}

function pickEventProvider(explicit?: string): MessagingEventProvider {
  if (explicit && explicit !== "auto") return explicit as MessagingEventProvider;
  if (env.MESSAGING_EVENT_PROVIDER && env.MESSAGING_EVENT_PROVIDER !== "auto") {
    return env.MESSAGING_EVENT_PROVIDER;
  }
  if (brevoConfigured()) return "brevo";
  return "none";
}

export async function syncContact(
  ctx: AutomationContext,
  config: Record<string, unknown>,
  log?: FastifyBaseLogger
): Promise<StepResult> {
  const email = ctx.lead?.email ?? ctx.user?.email;
  if (!email) return { ok: true, skipped: true, detail: "sem e-mail" };

  const provider = pickContactProvider(String(config.provider ?? "auto"));
  const listIds = Array.isArray(config.listIds)
    ? (config.listIds as unknown[]).map((n) => Number(n)).filter((n) => Number.isFinite(n))
    : undefined;

  switch (provider) {
    case "brevo":
      return brevoUpsertContact({ email, attributes: buildBrevoAttributes(ctx), listIds }, log);
    case "leadlovers": {
      const apiUrl = env.LEADLOVERS_API_URL;
      if (!apiUrl) return { ok: true, skipped: true, detail: "LEADLOVERS_API_URL ausente" };
      try {
        const res = await fetch(`${apiUrl.replace(/\/$/, "")}/contacts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: ctx.lead?.name ?? ctx.user?.name,
            phone: ctx.lead?.phone,
            tags: [ctx.lead?.source, ctx.lead?.packageTier].filter(Boolean)
          }),
          signal: AbortSignal.timeout(12_000)
        });
        if (res.ok) return { ok: true };
        return { ok: false, detail: (await res.text()).slice(0, 300) };
      } catch (err) {
        return { ok: false, detail: err instanceof Error ? err.message : "leadlovers falhou" };
      }
    }
    case "webhook":
      return { ok: true, skipped: true, detail: "use webhook.call para payload completo" };
    case "none":
      return { ok: true, skipped: true, detail: "nenhum provedor de contato" };
    default:
      return { ok: true, skipped: true, detail: `provider ${provider} não implementado` };
  }
}

export async function sendTransactionalMessage(
  input: { to: string; name?: string; subject: string; html: string; templateId?: number },
  config: Record<string, unknown>,
  log?: FastifyBaseLogger
): Promise<StepResult> {
  const provider = pickEmailProvider(String(config.provider ?? "auto"));

  switch (provider) {
    case "resend": {
      const apiKey = env.RESEND_API_KEY;
      const from = env.MAIL_FROM;
      if (!apiKey || !from) return { ok: true, skipped: true, detail: "Resend não configurado" };
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html }),
          signal: AbortSignal.timeout(15_000)
        });
        if (!res.ok) return { ok: false, detail: (await res.text()).slice(0, 300) };
        return { ok: true };
      } catch (err) {
        return { ok: false, detail: err instanceof Error ? err.message : "resend falhou" };
      }
    }
    case "brevo":
      return brevoSendTransactional(
        {
          to: { email: input.to, name: input.name },
          subject: input.subject,
          html: input.html,
          templateId: input.templateId
        },
        log
      );
    case "none":
      return { ok: true, skipped: true, detail: "nenhum provedor de e-mail" };
    default:
      return { ok: true, skipped: true, detail: `provider ${provider} não implementado` };
  }
}

export async function trackMarketingEvent(
  input: { email: string; eventName: string; props?: Record<string, unknown> },
  config: Record<string, unknown>,
  log?: FastifyBaseLogger
): Promise<StepResult> {
  const provider = pickEventProvider(String(config.provider ?? "auto"));
  const url = typeof config.webhookUrl === "string" ? config.webhookUrl.trim() : "";

  switch (provider) {
    case "brevo":
      return brevoTrackEvent({ email: input.email, eventName: input.eventName, eventData: input.props }, log);
    case "webhook": {
      const target = url || env.MESSAGING_EVENT_WEBHOOK_URL;
      if (!target) return { ok: true, skipped: true, detail: "webhook de evento ausente" };
      try {
        const res = await fetch(target, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: input.eventName, email: input.email, properties: input.props }),
          signal: AbortSignal.timeout(12_000)
        });
        if (!res.ok) return { ok: false, detail: (await res.text()).slice(0, 300) };
        return { ok: true };
      } catch (err) {
        return { ok: false, detail: err instanceof Error ? err.message : "webhook evento falhou" };
      }
    }
    case "none":
      return { ok: true, skipped: true, detail: "nenhum provedor de evento" };
    default:
      return { ok: true, skipped: true, detail: `provider ${provider} não implementado` };
  }
}

export async function sendSmsMessage(
  input: { phone: string; content: string },
  config: Record<string, unknown>,
  log?: FastifyBaseLogger
): Promise<StepResult> {
  const provider = String(config.provider ?? "auto");
  if (provider === "none") return { ok: true, skipped: true, detail: "SMS desativado" };
  if (!brevoConfigured()) return { ok: true, skipped: true, detail: "BREVO_API_KEY para SMS" };
  return brevoSendSms(input, log);
}

export async function sendWhatsAppMessage(
  input: { phone: string; text: string; name?: string },
  config: Record<string, unknown>,
  log?: FastifyBaseLogger
): Promise<StepResult> {
  const url =
    (typeof config.webhookUrl === "string" ? config.webhookUrl.trim() : "") || env.MESSAGING_WHATSAPP_WEBHOOK_URL;
  if (!url) return { ok: true, skipped: true, detail: "MESSAGING_WHATSAPP_WEBHOOK_URL ausente" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "whatsapp",
        phone: input.phone,
        name: input.name,
        text: input.text
      }),
      signal: AbortSignal.timeout(20_000)
    });
    if (!res.ok) return { ok: false, detail: (await res.text()).slice(0, 300) };
    return { ok: true };
  } catch (err) {
    log?.warn({ err }, "WhatsApp webhook falhou");
    return { ok: false, detail: err instanceof Error ? err.message : "whatsapp falhou" };
  }
}

export function messagingStatus() {
  return {
    contact: pickContactProvider("auto"),
    email: pickEmailProvider("auto"),
    event: pickEventProvider("auto"),
    brevo: brevoConfigured(),
    resend: Boolean(env.RESEND_API_KEY && env.MAIL_FROM),
    sms: brevoConfigured() && Boolean(env.BREVO_SMS_SENDER),
    whatsapp: Boolean(env.MESSAGING_WHATSAPP_WEBHOOK_URL),
    n8n: Boolean(env.N8N_LEAD_WEBHOOK_URL),
    leadlovers: Boolean(env.LEADLOVERS_API_URL)
  };
}
