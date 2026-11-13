import { AUTOMATION_TRIGGER_IDS } from "@ederson-agencia/shared";
import { env } from "../env.js";
import { messagingStatus } from "../integrations/messaging/hub.js";
import { prisma } from "../prisma.js";

export type MarketingSetupItem = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export async function evaluateMarketingSetup(): Promise<{
  ready: boolean;
  score: number;
  total: number;
  items: MarketingSetupItem[];
  automationsByTrigger: Record<string, number>;
}> {
  const providers = messagingStatus();
  const [contacts, campaigns, automations, loyalty, leads] = await Promise.all([
    prisma.marketingContactProfile.count(),
    prisma.marketingCampaign.count(),
    prisma.marketingAutomation.findMany({ select: { trigger: true, enabled: true } }),
    prisma.loyaltyProgramConfig.findUnique({ where: { id: "default" } }),
    prisma.lead.count()
  ]);

  const byTrigger: Record<string, number> = {};
  for (const row of automations) {
    if (!row.enabled) continue;
    byTrigger[row.trigger] = (byTrigger[row.trigger] ?? 0) + 1;
  }

  const funnelTriggers = ["lead.created", "client.hired", "contract.signed", "checkout.completed"] as const;
  const funnelOk = funnelTriggers.every((t) => (byTrigger[t] ?? 0) > 0);

  const items: MarketingSetupItem[] = [
    {
      id: "db",
      label: "Banco (CDP + campanhas)",
      ok: true,
      detail: `${contacts} contatos · ${campaigns} campanhas`
    },
    {
      id: "email",
      label: "Provedor de e-mail",
      ok: Boolean(providers.resend || providers.brevo),
      detail: providers.resend ? "Resend" : providers.brevo ? "Brevo" : "Configure RESEND_* ou BREVO_*"
    },
    {
      id: "sms",
      label: "SMS (opcional)",
      ok: Boolean(providers.sms),
      detail: providers.sms ? "Brevo SMS" : "BREVO_SMS_SENDER + API key"
    },
    {
      id: "whatsapp",
      label: "WhatsApp (opcional)",
      ok: Boolean(providers.whatsapp),
      detail: providers.whatsapp ? "Webhook ativo" : "MESSAGING_WHATSAPP_WEBHOOK_URL"
    },
    {
      id: "automations",
      label: "Automações do funil",
      ok: funnelOk && automations.filter((a) => a.enabled).length >= 3,
      detail: funnelOk
        ? `${automations.filter((a) => a.enabled).length} fluxos ativos`
        : "Faltam triggers lead/contratação/contrato/checkout"
    },
    {
      id: "cdp",
      label: "CDP alimentado",
      ok: contacts > 0 || leads > 0,
      detail: leads > 0 ? `${leads} leads · sincronize o CDP` : "Capture leads na landing"
    },
    {
      id: "loyalty",
      label: "Fidelização",
      ok: Boolean(loyalty),
      detail: loyalty?.enabled ? `Ativo: ${loyalty.name}` : "Programa configurável (inativo por padrão)"
    },
    {
      id: "webhook",
      label: "Orquestração (n8n)",
      ok: Boolean(providers.n8n || env.MESSAGING_EVENT_WEBHOOK_URL),
      detail: providers.n8n ? "N8N_LEAD_WEBHOOK_URL" : "Opcional — recomendado"
    }
  ];

  const required = items.filter((i) => !["sms", "whatsapp", "webhook", "loyalty"].includes(i.id));
  const score = required.filter((i) => i.ok).length;
  const total = required.length;
  const ready = score === total;

  return { ready, score, total, items, automationsByTrigger: byTrigger };
}

export async function ensureLoyaltyProgramDefault() {
  await prisma.loyaltyProgramConfig.upsert({
    where: { id: "default" },
    create: {
      enabled: false,
      name: "Programa Ederson",
      tiersJson: [
        { id: "start", name: "Start", pointsMin: 0 },
        { id: "growth", name: "Growth", pointsMin: 500 },
        { id: "partner", name: "Partner", pointsMin: 2000 }
      ],
      rulesJson: { pointsPerCheckout: 100, pointsPerReferral: 50 }
    },
    update: {}
  });
}

/** Garante cobertura mínima de triggers conhecidos (relatório). */
export function missingAutomationTriggers(covered: Record<string, number>): string[] {
  return AUTOMATION_TRIGGER_IDS.filter(
    (t) => t !== "manual.test" && t !== "webhook.purchase" && (covered[t] ?? 0) === 0
  );
}
