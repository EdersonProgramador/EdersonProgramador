import type { FastifyBaseLogger } from "fastify";
import { Prisma } from "@prisma/client";
import {
  defaultCampaignNameForKind,
  defaultSequenceForKind,
  type MarketingAudienceLevel,
  type MarketingCampaignKind,
  type MarketingDripStep
} from "@ederson-agencia/shared";
import { prisma } from "../prisma.js";
import { sendSmsMessage, sendTransactionalMessage, sendWhatsAppMessage } from "../integrations/messaging/hub.js";
import { upsertMarketingContactProfile } from "./cdp-contact.js";

export type ParsedSequenceStep = MarketingDripStep;

export function parseSequenceJson(json: unknown): ParsedSequenceStep[] {
  if (!Array.isArray(json)) return [];
  return json
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const o = raw as Record<string, unknown>;
      const dayOffset = Number(o.dayOffset ?? 0);
      const channel = String(o.channel ?? "email");
      const bodyHtml = String(o.bodyHtml ?? "").trim();
      if (!bodyHtml || !["email", "whatsapp", "sms"].includes(channel)) return null;
      return {
        dayOffset: Number.isFinite(dayOffset) ? Math.max(0, Math.floor(dayOffset)) : 0,
        channel: channel as ParsedSequenceStep["channel"],
        subject: typeof o.subject === "string" ? o.subject : undefined,
        bodyHtml
      };
    })
    .filter((s): s is ParsedSequenceStep => Boolean(s))
    .sort((a, b) => a.dayOffset - b.dayOffset);
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function personalize(template: string, lead: { name: string; email: string; phone?: string | null }) {
  const first = lead.name.trim().split(/\s+/)[0] || "Cliente";
  return template
    .replace(/\{\{\s*LEAD_NAME\s*\}\}/g, lead.name)
    .replace(/\{\{\s*FIRSTNAME\s*\}\}/g, first)
    .replace(/\{\{\s*LEAD_EMAIL\s*\}\}/g, lead.email)
    .replace(/\{\{\s*LEAD_PHONE\s*\}\}/g, lead.phone?.trim() || "");
}

export function classifyLeadAudienceLevel(input: {
  hadContactBefore: boolean;
  status?: string | null;
  liveAttended?: boolean;
  source?: string | null;
}): MarketingAudienceLevel {
  const status = (input.status ?? "NEW").toUpperCase();
  if (
    input.liveAttended ||
    ["CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "FOLLOW_UP"].includes(status) ||
    input.source === "qualification_quiz" ||
    /diagn[oó]stico/i.test(String(input.source ?? ""))
  ) {
    return "FOLLOW_UP";
  }
  if (input.hadContactBefore) return "REMARKETING";
  return "FIRST_CONTACT";
}

export async function ensureDefaultDripCampaigns(log?: FastifyBaseLogger) {
  const kinds: MarketingCampaignKind[] = ["ACQUISITION", "REMARKETING", "FOLLOW_UP"];
  const created: string[] = [];
  for (const kind of kinds) {
    const existing = await prisma.marketingCampaign.findFirst({
      where: { kind, status: { in: ["DRAFT", "SCHEDULED", "SENDING"] } },
      orderBy: { createdAt: "asc" }
    });
    if (existing) continue;
    const sequence = defaultSequenceForKind(kind);
    const row = await prisma.marketingCampaign.create({
      data: {
        name: defaultCampaignNameForKind(kind),
        kind,
        channel: "email",
        status: "SCHEDULED",
        subject: sequence.find((s) => s.channel === "email")?.subject ?? defaultCampaignNameForKind(kind),
        bodyHtml: sequence[0]?.bodyHtml ?? "<p></p>",
        sequenceJson: sequence as unknown as Prisma.InputJsonValue,
        audienceFilterJson: {
          selectAll: true,
          level: kind === "ACQUISITION" ? "FIRST_CONTACT" : kind === "REMARKETING" ? "REMARKETING" : "FOLLOW_UP"
        } as Prisma.InputJsonValue,
        scheduledAt: new Date()
      }
    });
    created.push(row.id);
    log?.info({ kind, id: row.id }, "Campanha drip padrão criada");
  }
  return { created };
}

export async function enrollLeadInAcquisitionFlow(
  lead: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    source?: string | null;
    status?: string | null;
    liveAttended?: boolean;
    packageTier?: string | null;
  },
  log?: FastifyBaseLogger
) {
  const email = lead.email.trim().toLowerCase();
  const existingContact = await prisma.marketingContactProfile.findUnique({ where: { email } });
  const hadContactBefore = Boolean(existingContact);

  await upsertMarketingContactProfile({
    email,
    name: lead.name,
    phone: lead.phone,
    source: lead.source ?? "lead",
    packageTier: lead.packageTier,
    extra: { leadStatus: lead.status ?? "NEW", leadId: lead.id }
  });

  await ensureDefaultDripCampaigns(log);
  const level = classifyLeadAudienceLevel({
    hadContactBefore,
    status: lead.status,
    liveAttended: lead.liveAttended,
    source: lead.source
  });

  const kind: MarketingCampaignKind =
    level === "FOLLOW_UP" ? "FOLLOW_UP" : level === "REMARKETING" ? "REMARKETING" : "ACQUISITION";

  const campaign = await prisma.marketingCampaign.findFirst({
    where: { kind, status: { in: ["DRAFT", "SCHEDULED", "SENDING"] } },
    orderBy: { createdAt: "asc" }
  });
  if (!campaign) {
    log?.warn({ kind }, "Nenhuma campanha drip ativa para matricular lead");
    return null;
  }

  const sequence = parseSequenceJson(campaign.sequenceJson);
  const firstOffset = sequence[0]?.dayOffset ?? 0;
  const enrollment = await prisma.marketingCampaignEnrollment.upsert({
    where: { campaignId_email: { campaignId: campaign.id, email } },
    create: {
      campaignId: campaign.id,
      email,
      leadId: lead.id,
      level,
      stepIndex: 0,
      status: "ACTIVE",
      nextSendAt: addDays(new Date(), firstOffset),
      metaJson: { name: lead.name, phone: lead.phone ?? null, source: lead.source ?? null } as Prisma.InputJsonValue
    },
    update: {
      leadId: lead.id,
      level,
      status: "ACTIVE",
      metaJson: { name: lead.name, phone: lead.phone ?? null, source: lead.source ?? null } as Prisma.InputJsonValue,
      nextSendAt: undefined
    }
  });

  // Se já existia matrícula completa, reinicia só se estava COMPLETED
  if (enrollment.status !== "ACTIVE" || enrollment.stepIndex > 0) {
    const refreshed = await prisma.marketingCampaignEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: "ACTIVE",
        stepIndex: enrollment.status === "COMPLETED" ? 0 : enrollment.stepIndex,
        nextSendAt:
          enrollment.status === "COMPLETED" || !enrollment.nextSendAt
            ? addDays(new Date(), firstOffset)
            : enrollment.nextSendAt,
        level
      }
    });
    log?.info({ enrollmentId: refreshed.id, kind, level }, "Lead matriculado em campanha drip");
    return refreshed;
  }

  log?.info({ enrollmentId: enrollment.id, kind, level }, "Lead matriculado em campanha drip");
  return enrollment;
}

export async function enrollAllLeadsByLevel(
  campaignId: string,
  options?: { level?: MarketingAudienceLevel; limit?: number },
  log?: FastifyBaseLogger
) {
  const campaign = await prisma.marketingCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) return { ok: false as const, message: "Campanha não encontrada.", enrolled: 0 };

  const level =
    options?.level ??
    (campaign.kind === "ACQUISITION"
      ? "FIRST_CONTACT"
      : campaign.kind === "REMARKETING"
        ? "REMARKETING"
        : campaign.kind === "FOLLOW_UP"
          ? "FOLLOW_UP"
          : "ALL");

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(options?.limit ?? 2000, 1), 5000),
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      source: true,
      status: true,
      liveAttended: true,
      createdAt: true
    }
  });

  const contacts = await prisma.marketingContactProfile.findMany({
    select: { email: true, createdAt: true }
  });
  const contactCreated = new Map(contacts.map((c) => [c.email.toLowerCase(), c.createdAt.getTime()]));

  const sequence = parseSequenceJson(campaign.sequenceJson);
  const firstOffset = sequence[0]?.dayOffset ?? 0;
  let enrolled = 0;

  for (const lead of leads) {
    const email = lead.email.trim().toLowerCase();
    const contactTs = contactCreated.get(email);
    const hadContactBefore = contactTs != null && contactTs < lead.createdAt.getTime() - 60_000;
    const classified = classifyLeadAudienceLevel({
      hadContactBefore,
      status: lead.status,
      liveAttended: lead.liveAttended,
      source: lead.source
    });
    if (level !== "ALL" && classified !== level) continue;

    await prisma.marketingCampaignEnrollment.upsert({
      where: { campaignId_email: { campaignId, email } },
      create: {
        campaignId,
        email,
        leadId: lead.id,
        level: classified,
        stepIndex: 0,
        status: "ACTIVE",
        nextSendAt: addDays(new Date(), firstOffset),
        metaJson: { name: lead.name, phone: lead.phone ?? null, source: lead.source ?? null } as Prisma.InputJsonValue
      },
      update: {
        leadId: lead.id,
        level: classified,
        status: "ACTIVE",
        metaJson: { name: lead.name, phone: lead.phone ?? null, source: lead.source ?? null } as Prisma.InputJsonValue
      }
    });
    enrolled += 1;
  }

  if (campaign.status === "DRAFT") {
    await prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status: "SCHEDULED", scheduledAt: new Date() }
    });
  }

  log?.info({ campaignId, enrolled, level }, "Leads matriculados na campanha");
  return { ok: true as const, message: `${enrolled} lead(s) matriculado(s) · nível ${level}.`, enrolled, level };
}

async function dispatchStep(
  step: ParsedSequenceStep,
  contact: { email: string; name: string; phone?: string | null },
  log?: FastifyBaseLogger
) {
  const body = personalize(step.bodyHtml, contact);
  const subject = personalize(step.subject ?? "Ederson Programador", contact);
  if (step.channel === "email") {
    return sendTransactionalMessage(
      { to: contact.email, name: contact.name, subject, html: body },
      { provider: "auto" },
      log
    );
  }
  if (step.channel === "whatsapp") {
    const phone = contact.phone?.trim();
    if (!phone) return { ok: false, skipped: true, detail: "sem telefone" };
    return sendWhatsAppMessage({ phone, text: body, name: contact.name }, { provider: "auto" }, log);
  }
  const phone = contact.phone?.trim();
  if (!phone) return { ok: false, skipped: true, detail: "sem telefone" };
  return sendSmsMessage({ phone, content: body }, { provider: "auto" }, log);
}

export async function processDueCampaignEnrollments(log?: FastifyBaseLogger) {
  const due = await prisma.marketingCampaignEnrollment.findMany({
    where: { status: "ACTIVE", nextSendAt: { lte: new Date() } },
    take: 40,
    orderBy: { nextSendAt: "asc" },
    include: { campaign: true }
  });

  let processed = 0;
  for (const enrollment of due) {
    const sequence = parseSequenceJson(enrollment.campaign.sequenceJson);
    if (!sequence.length) {
      await prisma.marketingCampaignEnrollment.update({
        where: { id: enrollment.id },
        data: { status: "COMPLETED", nextSendAt: null }
      });
      continue;
    }

    const step = sequence[enrollment.stepIndex];
    if (!step) {
      await prisma.marketingCampaignEnrollment.update({
        where: { id: enrollment.id },
        data: { status: "COMPLETED", nextSendAt: null }
      });
      continue;
    }

    const meta = (enrollment.metaJson ?? {}) as Record<string, unknown>;
    const name = typeof meta.name === "string" && meta.name ? meta.name : enrollment.email;
    const phone = typeof meta.phone === "string" ? meta.phone : null;
    const res = await dispatchStep(step, { email: enrollment.email, name, phone }, log);
    processed += 1;

    const nextIndex = enrollment.stepIndex + 1;
    if (nextIndex >= sequence.length) {
      await prisma.marketingCampaignEnrollment.update({
        where: { id: enrollment.id },
        data: {
          status: "COMPLETED",
          stepIndex: nextIndex,
          lastSentAt: new Date(),
          nextSendAt: null,
          metaJson: {
            ...meta,
            lastResult: res.ok ? "ok" : res.skipped ? "skipped" : "failed",
            lastDetail: res.detail ?? null
          } as Prisma.InputJsonValue
        }
      });
      continue;
    }

    const currentDay = step.dayOffset;
    const nextStep = sequence[nextIndex];
    const deltaDays = Math.max(0, nextStep.dayOffset - currentDay);
    await prisma.marketingCampaignEnrollment.update({
      where: { id: enrollment.id },
      data: {
        stepIndex: nextIndex,
        lastSentAt: new Date(),
        nextSendAt: addDays(new Date(), deltaDays || 0),
        metaJson: {
          ...meta,
          lastResult: res.ok ? "ok" : res.skipped ? "skipped" : "failed",
          lastDetail: res.detail ?? null
        } as Prisma.InputJsonValue
      }
    });
  }

  return { processed, due: due.length };
}
