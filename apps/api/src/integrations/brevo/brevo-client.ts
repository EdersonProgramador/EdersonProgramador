import type { FastifyBaseLogger } from "fastify";
import { env } from "../../env.js";

const BREVO_BASE = "https://api.brevo.com/v3";

function headers(): Record<string, string> | null {
  const key = env.BREVO_API_KEY;
  if (!key) return null;
  return {
    "api-key": key,
    "Content-Type": "application/json",
    Accept: "application/json"
  };
}

export function brevoConfigured(): boolean {
  return Boolean(env.BREVO_API_KEY);
}

export async function brevoUpsertContact(
  input: {
    email: string;
    attributes?: Record<string, string | number | boolean | null>;
    listIds?: number[];
  },
  log?: FastifyBaseLogger
): Promise<{ ok: boolean; skipped?: boolean; detail?: string }> {
  const h = headers();
  if (!h) {
    log?.info({ email: input.email }, "Brevo não configurado (BREVO_API_KEY)");
    return { ok: true, skipped: true, detail: "BREVO_API_KEY ausente" };
  }

  const listIds =
    input.listIds && input.listIds.length > 0
      ? input.listIds
      : env.BREVO_LIST_ID
        ? [Number(env.BREVO_LIST_ID)]
        : undefined;

  try {
    const res = await fetch(`${BREVO_BASE}/contacts`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({
        email: input.email,
        updateEnabled: true,
        attributes: input.attributes,
        listIds
      }),
      signal: AbortSignal.timeout(15_000)
    });
    if (res.ok || res.status === 204) return { ok: true };
    const text = await res.text();
    log?.warn({ status: res.status, text }, "Brevo upsert contact");
    return { ok: false, detail: text.slice(0, 500) };
  } catch (err) {
    log?.warn({ err }, "Brevo upsert contact falhou");
    return { ok: false, detail: err instanceof Error ? err.message : "erro de rede" };
  }
}

export async function brevoSendTransactional(
  input: {
    to: { email: string; name?: string };
    subject: string;
    html: string;
    params?: Record<string, unknown>;
    templateId?: number;
  },
  log?: FastifyBaseLogger
): Promise<{ ok: boolean; skipped?: boolean; detail?: string }> {
  const h = headers();
  if (!h) return { ok: true, skipped: true, detail: "BREVO_API_KEY ausente" };

  const senderEmail = env.BREVO_SENDER_EMAIL ?? env.MAIL_FROM;
  const senderName = env.BREVO_SENDER_NAME ?? "Ederson Programador";
  if (!senderEmail) {
    return { ok: true, skipped: true, detail: "Remetente não configurado" };
  }

  const body =
    input.templateId && input.templateId > 0
      ? {
          templateId: input.templateId,
          to: [input.to],
          params: input.params ?? {},
          sender: { email: senderEmail, name: senderName }
        }
      : {
          subject: input.subject,
          htmlContent: input.html,
          to: [input.to],
          params: input.params ?? {},
          sender: { email: senderEmail, name: senderName }
        };

  try {
    const res = await fetch(`${BREVO_BASE}/smtp/email`, {
      method: "POST",
      headers: h,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000)
    });
    if (res.ok || res.status === 201) return { ok: true };
    const text = await res.text();
    log?.warn({ status: res.status, text }, "Brevo transactional");
    return { ok: false, detail: text.slice(0, 500) };
  } catch (err) {
    log?.warn({ err }, "Brevo transactional falhou");
    return { ok: false, detail: err instanceof Error ? err.message : "erro de rede" };
  }
}

export async function brevoSendSms(
  input: { phone: string; content: string },
  log?: FastifyBaseLogger
): Promise<{ ok: boolean; skipped?: boolean; detail?: string }> {
  const h = headers();
  if (!h) return { ok: true, skipped: true, detail: "BREVO_API_KEY ausente" };

  const sender = env.BREVO_SMS_SENDER ?? "Ederson";
  const recipient = input.phone.replace(/\s/g, "");
  if (recipient.length < 10) return { ok: false, detail: "Telefone inválido" };

  try {
    const res = await fetch(`${BREVO_BASE}/transactionalSMS/sms`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({
        sender,
        recipient,
        content: input.content.slice(0, 1600),
        type: "transactional"
      }),
      signal: AbortSignal.timeout(20_000)
    });
    if (res.ok || res.status === 201) return { ok: true };
    const text = await res.text();
    log?.warn({ status: res.status, text }, "Brevo SMS");
    return { ok: false, detail: text.slice(0, 500) };
  } catch (err) {
    log?.warn({ err }, "Brevo SMS falhou");
    return { ok: false, detail: err instanceof Error ? err.message : "erro de rede" };
  }
}

export async function brevoTrackEvent(
  input: {
    email: string;
    eventName: string;
    eventData?: Record<string, unknown>;
  },
  log?: FastifyBaseLogger
): Promise<{ ok: boolean; skipped?: boolean; detail?: string }> {
  const h = headers();
  if (!h) return { ok: true, skipped: true, detail: "BREVO_API_KEY ausente" };

  try {
    const res = await fetch(`${BREVO_BASE}/events`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({
        event_name: input.eventName,
        event_date: new Date().toISOString(),
        identifiers: { email_id: input.email },
        event_properties: input.eventData ?? {}
      }),
      signal: AbortSignal.timeout(12_000)
    });
    if (res.ok || res.status === 204) return { ok: true };
    const text = await res.text();
    log?.warn({ status: res.status, text }, "Brevo track event");
    return { ok: false, detail: text.slice(0, 500) };
  } catch (err) {
    log?.warn({ err }, "Brevo track event falhou");
    return { ok: false, detail: err instanceof Error ? err.message : "erro de rede" };
  }
}
