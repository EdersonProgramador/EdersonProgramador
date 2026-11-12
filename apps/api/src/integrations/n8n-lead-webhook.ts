import type { FastifyBaseLogger } from "fastify";
import { env } from "../env.js";

export type N8nLeadPayload = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  source?: string | null;
  packageTier?: string | null;
  message: string;
  createdAt: Date;
  campaign?: string;
};

/** Dispara workflow n8n (webhook) — falha silenciosa para não bloquear o cadastro. */
export async function notifyN8nLeadWebhook(lead: N8nLeadPayload, log?: FastifyBaseLogger) {
  const url = env.N8N_LEAD_WEBHOOK_URL;
  if (!url) return;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  if (env.N8N_LEAD_WEBHOOK_SECRET) {
    headers["X-Webhook-Secret"] = env.N8N_LEAD_WEBHOOK_SECRET;
  }

  const body = {
    event: "lead.created",
    at: new Date().toISOString(),
    lead: {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone ?? null,
      source: lead.source ?? null,
      packageTier: lead.packageTier ?? null,
      message: lead.message,
      createdAt: lead.createdAt.toISOString()
    },
    campaign: lead.campaign ?? null
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12_000)
    });
    if (!res.ok) {
      log?.warn({ status: res.status, url }, "n8n webhook respondeu com erro");
    }
  } catch (error) {
    log?.warn({ err: error }, "n8n webhook indisponível — lead já salvo no banco");
  }
}
