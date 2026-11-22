import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  MARKETING_AUDIENCE_LEVEL_OPTIONS,
  MARKETING_CAMPAIGN_KINDS,
  MARKETING_INTEGRATION_CATALOG,
  MARKETING_LEAD_SOURCE_OPTIONS,
  MARKETING_PLATFORM_CHANNELS,
  defaultSequenceForKind,
  marketingAudienceTierOptions,
  type MarketingCampaignKind
} from "@ederson-agencia/shared";
import { Prisma } from "@prisma/client";
import { requireRole } from "../auth.js";
import { prisma } from "../prisma.js";
import { messagingStatus, sendSmsMessage, sendTransactionalMessage, sendWhatsAppMessage } from "../integrations/messaging/hub.js";
import { env } from "../env.js";
import {
  countCampaignAudience,
  executeCampaignSend,
  processDueScheduledCampaigns
} from "../marketing/campaign-send.js";
import {
  ensureDefaultDripCampaigns,
  enrollAllLeadsByLevel,
  parseSequenceJson,
  processDueCampaignEnrollments
} from "../marketing/campaign-drip.js";
import { syncMarketingContactsFromLeads } from "../marketing/sync-contacts-from-leads.js";
import { getLoyaltyRules } from "../marketing/loyalty.js";
import { evaluateMarketingSetup, missingAutomationTriggers } from "../marketing/marketing-setup.js";
import { ensureDefaultMarketingAutomations } from "../automation/ensure-defaults.js";

const campaignChannelSchema = z.enum(["email", "sms", "whatsapp", "push"]);
const campaignStatusSchema = z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "CANCELLED"]);
const campaignKindSchema = z.enum(["BLAST", "ACQUISITION", "REMARKETING", "FOLLOW_UP"]);
const audienceLevelSchema = z.enum(["FIRST_CONTACT", "REMARKETING", "FOLLOW_UP", "ALL"]);
const dripStepSchema = z.object({
  dayOffset: z.number().int().min(0).max(365),
  channel: z.enum(["email", "whatsapp", "sms"]),
  subject: z.string().max(200).optional(),
  bodyHtml: z.string().min(1).max(50_000)
});

export async function registerMarketingPlatformRoutes(app: FastifyInstance) {
  app.get("/agency/admin/marketing/setup", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const report = await evaluateMarketingSetup();
    return {
      ...report,
      missingTriggers: missingAutomationTriggers(report.automationsByTrigger)
    };
  });

  app.post("/agency/admin/marketing/setup/bootstrap", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    await ensureDefaultMarketingAutomations();
    const report = await evaluateMarketingSetup();
    return { message: "Fluxos padrão instalados (somente os que faltavam).", ...report };
  });

  app.get("/agency/admin/marketing/overview", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const [leadCounts, campaigns, contacts, loyalty] = await Promise.all([
      prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.marketingCampaign.count(),
      prisma.marketingContactProfile.count(),
      prisma.loyaltyProgramConfig.findUnique({ where: { id: "default" } })
    ]);
    return {
      pipeline: leadCounts.map((r) => ({ status: r.status, count: r._count._all })),
      campaignsTotal: campaigns,
      contactsTotal: contacts,
      loyaltyEnabled: loyalty?.enabled ?? false,
      channels: MARKETING_PLATFORM_CHANNELS,
      providers: messagingStatus()
    };
  });

  app.get("/agency/admin/ops/overview", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const now = new Date();
    const [
      leadsNew,
      leadsTotal,
      enrollmentsDue,
      campaignsActive,
      contactsTotal,
      projectsOpen,
      setup,
      agentApprovalsPending,
      agentsDeployed
    ] = await Promise.all([
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.lead.count(),
      prisma.marketingCampaignEnrollment.count({
        where: { status: "ACTIVE", nextSendAt: { lte: now } }
      }),
      prisma.marketingCampaign.count({
        where: { OR: [{ status: "ACTIVE" }, { kind: { in: ["ACQUISITION", "REMARKETING", "FOLLOW_UP"] } }] }
      }),
      prisma.marketingContactProfile.count(),
      prisma.project.count(),
      evaluateMarketingSetup(),
      prisma.agencyAgentJob.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.agencyAgentDeployment.count({ where: { status: "ACTIVE" } })
    ]);
    return {
      leadsNew,
      leadsTotal,
      enrollmentsDue,
      campaignsActive,
      contactsTotal,
      projectsOpen,
      clientsCount: projectsOpen,
      agentApprovalsPending,
      agentsDeployed,
      setupReady: setup.ready,
      setupScore: `${setup.score}/${setup.total}`
    };
  });

  app.get("/agency/admin/marketing/contacts", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const query = z.object({ q: z.string().optional(), limit: z.coerce.number().max(100).default(50) }).parse(request.query);
    const where = query.q
      ? {
          OR: [
            { email: { contains: query.q, mode: "insensitive" as const } },
            { name: { contains: query.q, mode: "insensitive" as const } }
          ]
        }
      : {};
    const contacts = await prisma.marketingContactProfile.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: query.limit
    });
    return { contacts };
  });

  app.get("/agency/admin/marketing/campaigns", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    void processDueScheduledCampaigns(request.log);
    void processDueCampaignEnrollments(request.log);
    const rows = await prisma.marketingCampaign.findMany({
      orderBy: { updatedAt: "desc" },
      take: 80,
      include: {
        _count: { select: { enrollments: true } }
      }
    });
    return {
      campaigns: rows,
      kinds: MARKETING_CAMPAIGN_KINDS,
      levels: MARKETING_AUDIENCE_LEVEL_OPTIONS
    };
  });

  app.post("/agency/admin/marketing/campaigns/bootstrap-drip", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const result = await ensureDefaultDripCampaigns(request.log);
    const rows = await prisma.marketingCampaign.findMany({
      where: { kind: { in: ["ACQUISITION", "REMARKETING", "FOLLOW_UP"] } },
      orderBy: { kind: "asc" }
    });
    return { message: "Campanhas de aquisição / remarketing / follow-up prontas.", ...result, campaigns: rows };
  });

  app.post("/agency/admin/marketing/campaigns", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = z
      .object({
        name: z.string().min(2).max(120),
        channel: campaignChannelSchema.default("email"),
        kind: campaignKindSchema.default("BLAST"),
        subject: z.string().max(200).optional(),
        bodyHtml: z.string().max(50_000).optional(),
        scheduledAt: z.string().datetime().optional().nullable(),
        sequence: z.array(dripStepSchema).max(30).optional(),
        audienceFilter: z
          .object({
            source: z.string().optional(),
            packageTier: z.string().optional(),
            limit: z.number().int().min(1).max(2000).optional(),
            selectAll: z.boolean().optional(),
            level: audienceLevelSchema.optional()
          })
          .optional()
      })
      .parse(request.body);

    const sequence =
      body.sequence ??
      (body.kind !== "BLAST" ? defaultSequenceForKind(body.kind as MarketingCampaignKind) : undefined);

    const row = await prisma.marketingCampaign.create({
      data: {
        name: body.name,
        channel: body.channel,
        kind: body.kind,
        subject: body.subject,
        bodyHtml: body.bodyHtml,
        sequenceJson: sequence ? (sequence as unknown as Prisma.InputJsonValue) : undefined,
        audienceFilterJson: (body.audienceFilter ?? {}) as Prisma.InputJsonValue,
        status: body.scheduledAt || body.kind !== "BLAST" ? "SCHEDULED" : "DRAFT",
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : body.kind !== "BLAST" ? new Date() : null
      }
    });
    return reply.code(201).send({ campaign: row });
  });

  app.patch("/agency/admin/marketing/campaigns/:id", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        name: z.string().min(2).max(120).optional(),
        channel: campaignChannelSchema.optional(),
        kind: campaignKindSchema.optional(),
        status: campaignStatusSchema.optional(),
        subject: z.string().max(200).optional().nullable(),
        bodyHtml: z.string().max(50_000).optional().nullable(),
        scheduledAt: z.string().datetime().optional().nullable(),
        sequence: z.array(dripStepSchema).max(30).optional().nullable(),
        audienceFilter: z
          .object({
            source: z.string().optional(),
            packageTier: z.string().optional(),
            limit: z.number().int().min(1).max(2000).optional(),
            selectAll: z.boolean().optional(),
            level: audienceLevelSchema.optional()
          })
          .optional()
      })
      .parse(request.body);

    const existing = await prisma.marketingCampaign.findUnique({ where: { id: params.id } });
    if (!existing) return reply.code(404).send({ message: "Campanha não encontrada." });

    const row = await prisma.marketingCampaign.update({
      where: { id: params.id },
      data: {
        name: body.name,
        channel: body.channel,
        kind: body.kind,
        status: body.status,
        subject: body.subject,
        bodyHtml: body.bodyHtml,
        sequenceJson:
          body.sequence === undefined
            ? undefined
            : body.sequence === null
              ? Prisma.JsonNull
              : (body.sequence as unknown as Prisma.InputJsonValue),
        audienceFilterJson:
          body.audienceFilter === undefined ? undefined : (body.audienceFilter as Prisma.InputJsonValue),
        scheduledAt: body.scheduledAt === undefined ? undefined : body.scheduledAt ? new Date(body.scheduledAt) : null,
        sentAt: body.status === "SENT" ? new Date() : undefined
      }
    });
    return { campaign: row, sequence: parseSequenceJson(row.sequenceJson) };
  });

  app.post("/agency/admin/marketing/campaigns/:id/enroll-leads", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        level: audienceLevelSchema.optional(),
        limit: z.number().int().min(1).max(5000).optional()
      })
      .parse(request.body ?? {});
    await syncMarketingContactsFromLeads(Math.min(body.limit ?? 2000, 2000));
    const result = await enrollAllLeadsByLevel(params.id, body, request.log);
    if (!result.ok) return reply.code(404).send({ message: result.message });
    return result;
  });

  app.get("/agency/admin/marketing/campaigns/:id/enrollments", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const query = z
      .object({
        status: z.string().optional(),
        level: audienceLevelSchema.optional(),
        limit: z.coerce.number().int().min(1).max(500).default(100)
      })
      .parse(request.query);
    const campaign = await prisma.marketingCampaign.findUnique({ where: { id: params.id } });
    if (!campaign) return reply.code(404).send({ message: "Campanha não encontrada." });
    const enrollments = await prisma.marketingCampaignEnrollment.findMany({
      where: {
        campaignId: params.id,
        ...(query.status ? { status: query.status } : {}),
        ...(query.level && query.level !== "ALL" ? { level: query.level } : {})
      },
      orderBy: [{ status: "asc" }, { nextSendAt: "asc" }],
      take: query.limit
    });
    const byLevel = await prisma.marketingCampaignEnrollment.groupBy({
      by: ["level"],
      where: { campaignId: params.id },
      _count: { _all: true }
    });
    return {
      enrollments,
      sequence: parseSequenceJson(campaign.sequenceJson),
      byLevel: byLevel.map((r) => ({ level: r.level, count: r._count._all }))
    };
  });

  app.post("/agency/admin/marketing/campaigns/process-due", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const scheduled = await processDueScheduledCampaigns(request.log);
    const drip = await processDueCampaignEnrollments(request.log);
    return { message: "Fila de disparos processada.", drip, scheduled: scheduled ?? null };
  });

  app.get("/agency/admin/marketing/campaigns/:id/audience", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const query = z
      .object({
        channel: campaignChannelSchema.optional(),
        source: z.string().optional(),
        packageTier: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(2000).optional()
      })
      .parse(request.query);
    const row = await prisma.marketingCampaign.findUnique({ where: { id: params.id } });
    if (!row) return reply.code(404).send({ message: "Campanha não encontrada." });
    const channel = query.channel ?? row.channel;
    const base =
      row.audienceFilterJson && typeof row.audienceFilterJson === "object"
        ? { ...(row.audienceFilterJson as Record<string, unknown>) }
        : {};
    const merged = {
      ...base,
      ...(query.source !== undefined ? { source: query.source || undefined } : {}),
      ...(query.packageTier !== undefined ? { packageTier: query.packageTier || undefined } : {}),
      ...(query.limit !== undefined ? { limit: query.limit } : {})
    };
    const count = await countCampaignAudience(merged, channel);
    return { count, filter: merged, channel };
  });

  app.get("/agency/admin/marketing/audience/meta", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const bySource = await prisma.lead.groupBy({
      by: ["source"],
      _count: { _all: true }
    });
    return {
      sources: MARKETING_LEAD_SOURCE_OPTIONS,
      tiers: marketingAudienceTierOptions(),
      leadCountsBySource: bySource.map((r) => ({ source: r.source, count: r._count._all }))
    };
  });

  app.post("/agency/admin/marketing/campaigns/:id/send", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const result = await executeCampaignSend(params.id, request.log);
    if (!result.ok) return reply.code(400).send({ message: result.message, stats: result.stats });
    return result;
  });

  app.post("/agency/admin/marketing/contacts/sync", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = z.object({ limit: z.number().int().max(1000).default(500) }).parse(request.body ?? {});
    const result = await syncMarketingContactsFromLeads(body.limit);
    return result;
  });

  app.post("/agency/admin/marketing/transactional/test", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = z
      .object({
        to: z.string().email(),
        subject: z.string().min(1).max(200),
        html: z.string().min(1).max(50_000),
        name: z.string().max(120).optional()
      })
      .parse(request.body);
    const res = await sendTransactionalMessage(
      { to: body.to, name: body.name, subject: body.subject, html: body.html },
      { provider: "auto" },
      request.log
    );
    if (!res.ok && !res.skipped) return reply.code(502).send({ message: res.detail ?? "Falha no envio." });
    if (res.skipped) return reply.code(400).send({ message: res.detail ?? "Provedor não configurado." });
    return { ok: true, message: "E-mail de teste enviado." };
  });

  app.post("/agency/admin/marketing/transactional/test-sms", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = z
      .object({
        phone: z.string().min(10).max(20),
        content: z.string().min(1).max(1600)
      })
      .parse(request.body);
    const res = await sendSmsMessage({ phone: body.phone, content: body.content }, { provider: "auto" }, request.log);
    if (!res.ok && !res.skipped) return reply.code(502).send({ message: res.detail ?? "Falha no SMS." });
    if (res.skipped) return reply.code(400).send({ message: res.detail ?? "Configure BREVO_API_KEY e BREVO_SMS_SENDER." });
    return { ok: true, message: "SMS de teste enviado." };
  });

  app.post("/agency/admin/marketing/transactional/test-whatsapp", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = z
      .object({
        phone: z.string().min(10).max(20),
        text: z.string().min(1).max(4000),
        name: z.string().max(120).optional()
      })
      .parse(request.body);
    const res = await sendWhatsAppMessage(
      { phone: body.phone, text: body.text, name: body.name },
      { provider: "auto" },
      request.log
    );
    if (!res.ok && !res.skipped) return reply.code(502).send({ message: res.detail ?? "Falha no WhatsApp." });
    if (res.skipped) return reply.code(400).send({ message: res.detail ?? "Configure MESSAGING_WHATSAPP_WEBHOOK_URL." });
    return { ok: true, message: "Payload enviado ao conector WhatsApp." };
  });

  app.get("/agency/admin/marketing/crm/pipeline", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const leads = await prisma.lead.findMany({
      orderBy: { updatedAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        packageTier: true,
        source: true,
        updatedAt: true
      }
    });
    const columns = [
      "NEW",
      "QUALIFIED",
      "PROPOSAL",
      "NEGOTIATION",
      "CONTRACT",
      "WON",
      "ACTIVE",
      "LOST"
    ] as const;
    const grouped = Object.fromEntries(columns.map((c) => [c, leads.filter((l) => l.status === c)])) as Record<
      (typeof columns)[number],
      typeof leads
    >;
    return { columns, grouped, all: leads };
  });

  app.get("/agency/admin/marketing/channels", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const providers = messagingStatus();
    const channelState = MARKETING_PLATFORM_CHANNELS.map((ch) => {
      let ready = false;
      let note = "Configure provedor no .env ou automação";
      switch (ch.id) {
        case "email":
          ready = Boolean(providers.resend || providers.brevo);
          note = ready ? "Resend ou Brevo ativo" : "Defina RESEND_* ou BREVO_*";
          break;
        case "sms":
          ready = Boolean(providers.sms);
          note = ready ? "Brevo Transactional SMS (BREVO_SMS_SENDER)" : "BREVO_API_KEY + BREVO_SMS_SENDER";
          break;
        case "whatsapp":
          ready = Boolean(providers.whatsapp);
          note = ready ? "Webhook n8n / BSP (MESSAGING_WHATSAPP_WEBHOOK_URL)" : "MESSAGING_WHATSAPP_WEBHOOK_URL";
          break;
        case "push":
          ready = true;
          note = "Notificações in-app + permissão do navegador";
          break;
        case "chat":
        case "chatbot":
          ready = false;
          note = "Em breve — widget embed";
          break;
        default:
          ready = false;
      }
      return { ...ch, ready, note };
    });
    return { channels: channelState, providers };
  });

  app.get("/agency/admin/marketing/integrations", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const providers = messagingStatus();
    return {
      catalog: MARKETING_INTEGRATION_CATALOG,
      connected: providers,
      envHints: {
        brevo: Boolean(env.BREVO_API_KEY),
        resend: Boolean(env.RESEND_API_KEY),
        sms: Boolean(env.BREVO_API_KEY && env.BREVO_SMS_SENDER),
        whatsapp: Boolean(env.MESSAGING_WHATSAPP_WEBHOOK_URL),
        n8n: Boolean(env.N8N_LEAD_WEBHOOK_URL),
        leadlovers: Boolean(env.LEADLOVERS_API_URL),
        hotmart: Boolean(env.HOTMART_API_URL),
        openai: Boolean(env.OPENAI_API_KEY),
        leadNotify: Boolean(env.LEAD_NOTIFY_EMAIL || env.LEAD_NOTIFY_WHATSAPP || env.ADMIN_EMAIL)
      }
    };
  });

  app.get("/agency/admin/marketing/loyalty", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    let row = await prisma.loyaltyProgramConfig.findUnique({ where: { id: "default" } });
    if (!row) {
      row = await prisma.loyaltyProgramConfig.create({
        data: {
          enabled: false,
          tiersJson: [
            { id: "start", name: "Start", pointsMin: 0 },
            { id: "growth", name: "Growth", pointsMin: 500 },
            { id: "partner", name: "Partner", pointsMin: 2000 }
          ] as Prisma.InputJsonValue,
          rulesJson: { pointsPerCheckout: 100, pointsPerReferral: 50 } as Prisma.InputJsonValue
        }
      });
    }
    const rules = await getLoyaltyRules();
    return { loyalty: row, rules };
  });

  app.patch("/agency/admin/marketing/loyalty", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = z
      .object({
        enabled: z.boolean().optional(),
        name: z.string().min(2).max(80).optional(),
        tiersJson: z.array(z.record(z.any())).optional(),
        rulesJson: z.record(z.any()).optional()
      })
      .parse(request.body);

    const row = await prisma.loyaltyProgramConfig.upsert({
      where: { id: "default" },
      create: {
        enabled: body.enabled ?? false,
        name: body.name ?? "Programa Ederson",
        tiersJson: (body.tiersJson ?? []) as Prisma.InputJsonValue,
        rulesJson: (body.rulesJson ?? {}) as Prisma.InputJsonValue
      },
      update: {
        enabled: body.enabled,
        name: body.name,
        tiersJson: body.tiersJson as Prisma.InputJsonValue | undefined,
        rulesJson: body.rulesJson as Prisma.InputJsonValue | undefined
      }
    });
    return { loyalty: row };
  });
}
