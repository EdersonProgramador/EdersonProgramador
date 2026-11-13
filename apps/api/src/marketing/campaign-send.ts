import type { FastifyBaseLogger } from "fastify";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { sendSmsMessage, sendTransactionalMessage, sendWhatsAppMessage } from "../integrations/messaging/hub.js";

export type CampaignAudienceFilter = {
  source?: string;
  packageTier?: string;
  limit?: number;
};

export type CampaignRecipient = {
  email: string;
  name: string | null;
  phone: string | null;
};

function parseAudienceFilter(json: unknown): CampaignAudienceFilter {
  if (!json || typeof json !== "object") return {};
  const o = json as Record<string, unknown>;
  return {
    source: typeof o.source === "string" && o.source ? o.source : undefined,
    packageTier: typeof o.packageTier === "string" && o.packageTier ? o.packageTier : undefined,
    limit: typeof o.limit === "number" ? o.limit : undefined
  };
}

function buildAudienceWhere(filter: CampaignAudienceFilter): Prisma.MarketingContactProfileWhereInput {
  if (filter.packageTier) {
    return {
      attributesJson: {
        path: ["packageTier"],
        equals: filter.packageTier
      }
    };
  }
  return {};
}

function contactMatchesSource(sourcesJson: unknown, source: string): boolean {
  if (!Array.isArray(sourcesJson)) return false;
  return sourcesJson.includes(source);
}

export async function resolveCampaignRecipients(
  audienceFilterJson: unknown,
  options?: { requirePhone?: boolean }
): Promise<CampaignRecipient[]> {
  const filter = parseAudienceFilter(audienceFilterJson);
  const take = Math.min(Math.max(filter.limit ?? 500, 1), 2000);
  const fetchCap = filter.source ? Math.min(take * 4, 2000) : take;
  let rows = await prisma.marketingContactProfile.findMany({
    where: buildAudienceWhere(filter),
    orderBy: { updatedAt: "desc" },
    take: fetchCap,
    select: { email: true, name: true, phone: true, sourcesJson: true, attributesJson: true }
  });
  if (filter.source) {
    rows = rows.filter((r) => contactMatchesSource(r.sourcesJson, filter.source!));
  }
  if (filter.packageTier) {
    rows = rows.filter((r) => {
      const tier = (r.attributesJson as Record<string, unknown> | null)?.packageTier;
      return tier === filter.packageTier;
    });
  }
  let list = rows.slice(0, take).map((r) => ({
    email: r.email,
    name: r.name,
    phone: r.phone
  }));
  if (options?.requirePhone) {
    list = list.filter((r) => Boolean(r.phone?.trim()));
  }
  return list;
}

export async function countCampaignAudience(
  audienceFilterJson: unknown,
  channel?: string
): Promise<number> {
  const requirePhone = channel === "sms" || channel === "whatsapp";
  return resolveCampaignRecipients(audienceFilterJson, { requirePhone }).then((r) => r.length);
}

async function dispatchToRecipient(
  channel: string,
  contact: CampaignRecipient,
  subject: string,
  body: string,
  log?: FastifyBaseLogger
): Promise<{ ok: boolean; skipped?: boolean }> {
  if (channel === "email") {
    const res = await sendTransactionalMessage(
      { to: contact.email, name: contact.name ?? undefined, subject, html: body },
      { provider: "auto" },
      log
    );
    return { ok: res.ok, skipped: res.skipped };
  }
  if (channel === "sms") {
    const phone = contact.phone?.trim();
    if (!phone) return { ok: false };
    const res = await sendSmsMessage({ phone, content: body }, { provider: "auto" }, log);
    return { ok: res.ok, skipped: res.skipped };
  }
  if (channel === "whatsapp") {
    const phone = contact.phone?.trim();
    if (!phone) return { ok: false };
    const res = await sendWhatsAppMessage(
      { phone, text: body, name: contact.name ?? undefined },
      { provider: "auto" },
      log
    );
    return { ok: res.ok, skipped: res.skipped };
  }
  return { ok: false };
}

export async function executeCampaignSend(
  campaignId: string,
  log?: FastifyBaseLogger
): Promise<{ ok: boolean; message: string; stats?: { sent: number; failed: number; total: number; skippedNoPhone?: number } }> {
  const campaign = await prisma.marketingCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { ok: false, message: "Campanha não encontrada." };
  const channel = campaign.channel;
  if (!["email", "sms", "whatsapp"].includes(channel)) {
    return { ok: false, message: `Canal ${channel} ainda não suporta envio em massa.` };
  }
  if (!["DRAFT", "SCHEDULED"].includes(campaign.status)) {
    return { ok: false, message: `Campanha não pode ser enviada no status ${campaign.status}.` };
  }

  const body = campaign.bodyHtml?.trim() ?? "";
  const subject = campaign.subject?.trim() ?? campaign.name;
  if (!body) {
    return { ok: false, message: channel === "email" ? "Preencha assunto e corpo HTML." : "Preencha a mensagem." };
  }
  if (channel === "email" && !campaign.subject?.trim()) {
    return { ok: false, message: "Preencha o assunto do e-mail." };
  }

  const all = await resolveCampaignRecipients(campaign.audienceFilterJson);
  const requirePhone = channel === "sms" || channel === "whatsapp";
  const recipients = requirePhone ? all.filter((c) => c.phone?.trim()) : all;
  const skippedNoPhone = requirePhone ? all.length - recipients.length : 0;

  if (recipients.length === 0) {
    const hint = requirePhone
      ? "Nenhum contato com telefone nesta audiência. Sincronize o CDP ou ajuste filtros."
      : "Nenhum contato no CDP. Sincronize leads ou ajuste o filtro.";
    return { ok: false, message: hint };
  }

  await prisma.marketingCampaign.update({
    where: { id: campaignId },
    data: { status: "SENDING" }
  });

  let sent = 0;
  let failed = 0;
  for (const contact of recipients) {
    const res = await dispatchToRecipient(channel, contact, subject, body, log);
    if (res.ok && !res.skipped) sent += 1;
    else if (res.skipped) sent += 1;
    else failed += 1;
  }

  const stats = { sent, failed, total: recipients.length, skippedNoPhone };
  const status = failed === recipients.length ? "DRAFT" : "SENT";
  await prisma.marketingCampaign.update({
    where: { id: campaignId },
    data: {
      status,
      sentAt: status === "SENT" ? new Date() : null,
      statsJson: stats as Prisma.InputJsonValue
    }
  });

  const channelLabel = channel === "email" ? "e-mail" : channel;
  return {
    ok: status === "SENT",
    message:
      failed > 0
        ? `${channelLabel}: ${sent} ok, ${failed} falha(s) de ${recipients.length}.${
            skippedNoPhone ? ` (${skippedNoPhone} sem telefone ignorados na audiência bruta)` : ""
          }`
        : `${sent} mensagem(ns) ${channelLabel} enviada(s).${
            skippedNoPhone ? ` ${skippedNoPhone} contatos sem telefone fora do lote.` : ""
          }`,
    stats
  };
}

export async function processDueScheduledCampaigns(log?: FastifyBaseLogger) {
  const due = await prisma.marketingCampaign.findMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
    take: 3,
    orderBy: { scheduledAt: "asc" }
  });
  for (const row of due) {
    await executeCampaignSend(row.id, log);
  }
}
