import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  AGENCY_CONTRACT_VERSION,
  contractSummaryForTier,
  PACKAGE_TIER_CONFIG,
  PACKAGE_TIER_IDS,
  nextUpgradeTier,
  parsePackageTier,
  type PackageTierId
} from "@ederson-agencia/shared";
import { assertAgencySession } from "../auth-access.js";
import { getAuthUser, requireRole } from "../auth.js";
import { prisma } from "../prisma.js";
import {
  activateProjectAfterCheckout,
  applyApprovedUpgrade,
  createProjectFromPackage,
  projectInclude,
  recordContractSignature,
  resolvePackageTier
} from "./agency-project.js";
import { ensureClientFunnelLead, findLeadForClient, resolveClientFunnelState } from "../agency/client-funnel.js";
import {
  funnelConfigPublicDto,
  getAgencyFunnelConfigRow,
  resolveFunnelPackages,
  tierPricingFromConfig
} from "../agency/funnel-config.js";
import { notifyAgencyUser } from "../agency/notifications.js";

const leadStatusSchema = z.enum(["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"]);
const phaseStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "WAITING_APPROVAL", "APPROVED", "DONE"]);
const deliverableStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "DONE"]);
const tierSchema = z.enum(PACKAGE_TIER_IDS);

async function assertProjectAccess(
  user: NonNullable<import("fastify").FastifyRequest["agencyUser"]>,
  projectId: string
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
  if (user.role === "ADMIN") return project;
  if (user.role === "FREELANCER" && project.freelancerId === user.id) return project;
  if (user.role === "CLIENT" && project.clientId === user.id) return project;
  throw Object.assign(new Error("Acesso negado."), { statusCode: 403 });
}

export async function registerAgencyRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    if (!request.url.startsWith("/agency")) return;
    const user = await getAuthUser(request);
    if (!user) {
      return reply.code(401).send({ message: "Faça login para continuar." });
    }
    try {
      assertAgencySession(user);
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode ?? 403;
      return reply.code(statusCode).send({ message: (error as Error).message });
    }
    request.agencyUser = user;
  });

  app.get("/agency/packages", async () => ({
    tiers: PACKAGE_TIER_IDS.map((id) => ({
      id,
      ...PACKAGE_TIER_CONFIG[id]
    }))
  }));

  app.get("/agency/dashboard", async (request) => {
    const user = request.agencyUser!;
    if (user.role === "ADMIN") {
      const [leads, projects, freelancers, clients, clientAccounts] = await Promise.all([
        prisma.lead.count(),
        prisma.project.count(),
        prisma.user.count({ where: { role: "FREELANCER" } }),
        prisma.user.count({ where: { role: "CLIENT" } }),
        prisma.user.findMany({
          where: { role: "CLIENT" },
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, email: true, company: true, createdAt: true }
        })
      ]);
      return {
        role: user.role,
        stats: { leads, projects, freelancers, clients },
        clientAccounts
      };
    }

    if (user.role === "FREELANCER") {
      const projects = await prisma.project.count({ where: { freelancerId: user.id } });
      const inProgress = await prisma.projectPhase.count({
        where: { project: { freelancerId: user.id }, status: "IN_PROGRESS" }
      });
      return { role: user.role, stats: { projects, inProgress } };
    }

    const projects = await prisma.project.count({ where: { clientId: user.id } });
    const awaitingApproval = await prisma.projectPhase.count({
      where: { project: { clientId: user.id }, status: "WAITING_APPROVAL" }
    });
    return { role: user.role, stats: { projects, awaitingApproval } };
  });

  app.get("/agency/leads", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { assignee: { select: { id: true, name: true, email: true } }, project: true }
    });
    return { leads };
  });

  app.patch("/agency/leads/:id", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        status: leadStatusSchema.optional(),
        assigneeId: z.string().nullable().optional(),
        packageTier: tierSchema.optional(),
        liveAttended: z.boolean().optional()
      })
      .parse(request.body);

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        status: body.status,
        assigneeId: body.assigneeId,
        packageTier: body.packageTier,
        liveAttended: body.liveAttended,
        liveAttendedAt: body.liveAttended === true ? new Date() : body.liveAttended === false ? null : undefined
      }
    });
    return { lead };
  });

  app.post("/agency/leads/:id/convert", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        clientEmail: z.string().email(),
        projectTitle: z.string().min(3).default("Projeto de desenvolvimento"),
        packageTier: tierSchema.optional()
      })
      .parse(request.body ?? {});

    const lead = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!lead) return reply.code(404).send({ message: "Lead não encontrado." });
    if (lead.projectId) return reply.code(409).send({ message: "Lead já convertido em projeto." });

    const client = await prisma.user.findUnique({ where: { email: body.clientEmail.toLowerCase() } });
    if (!client) {
      return reply.code(400).send({
        message: "Cliente não encontrado. Peça para o cliente criar conta ou crie manualmente."
      });
    }

    const tier = resolvePackageTier(body.packageTier ?? lead.packageTier, "professional");
    const project = await createProjectFromPackage(
      client.id,
      body.projectTitle,
      tier,
      lead.message,
      "immediate"
    );
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "WON", projectId: project.id, packageTier: tier }
    });

    return { project };
  });

  app.get("/agency/projects", async (request) => {
    const user = request.agencyUser!;
    const where =
      user.role === "ADMIN"
        ? {}
        : user.role === "FREELANCER"
          ? { freelancerId: user.id }
          : { clientId: user.id };

    const projects = await prisma.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: projectInclude
    });
    return { projects };
  });

  app.get("/agency/projects/:id", async (request) => {
    const user = request.agencyUser!;
    const params = z.object({ id: z.string() }).parse(request.params);
    await assertProjectAccess(user, params.id);
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: projectInclude
    });
    if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
    return { project };
  });

  app.post("/agency/projects", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = z
      .object({
        clientId: z.string(),
        title: z.string().min(3),
        description: z.string().optional(),
        freelancerId: z.string().optional(),
        packageTier: tierSchema.default("professional")
      })
      .parse(request.body);

    let project = await createProjectFromPackage(
      body.clientId,
      body.title,
      body.packageTier,
      body.description,
      "immediate"
    );
    if (body.freelancerId) {
      project = await prisma.project.update({
        where: { id: project.id },
        data: { freelancerId: body.freelancerId },
        include: projectInclude
      });
    }
    return reply.code(201).send({ project });
  });

  app.patch("/agency/projects/:id", async (request) => {
    const user = request.agencyUser!;
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
        paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID"]).optional(),
        freelancerId: z.string().nullable().optional()
      })
      .parse(request.body);

    await assertProjectAccess(user, params.id);
    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });

    if (user.role === "FREELANCER" && project.freelancerId !== user.id) {
      throw Object.assign(new Error("Acesso negado."), { statusCode: 403 });
    }
    if (user.role === "CLIENT" && project.clientId !== user.id) {
      throw Object.assign(new Error("Acesso negado."), { statusCode: 403 });
    }
    if (user.role !== "ADMIN" && (body.freelancerId !== undefined || body.paymentStatus !== undefined)) {
      throw Object.assign(new Error("Acesso negado."), { statusCode: 403 });
    }

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: body,
      include: projectInclude
    });
    return { project: updated };
  });

  app.post("/agency/projects/:id/upgrade-requests", async (request, reply) => {
    const user = request.agencyUser!;
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        toTier: tierSchema,
        clientMessage: z.string().max(2000).optional()
      })
      .parse(request.body);

    const project = await assertProjectAccess(user, params.id);
    if (user.role !== "CLIENT" || project.clientId !== user.id) {
      return reply.code(403).send({ message: "Somente o cliente pode solicitar upgrade." });
    }

    const current = resolvePackageTier(project.packageTier, "professional");
    const allowed = nextUpgradeTier(current);
    if (!allowed || body.toTier !== allowed) {
      return reply.code(400).send({
        message: allowed
          ? `Upgrade disponível apenas para o pacote ${PACKAGE_TIER_CONFIG[allowed].name}.`
          : "Seu pacote já é o mais completo."
      });
    }

    const pending = await prisma.projectUpgradeRequest.findFirst({
      where: { projectId: project.id, status: "PENDING" }
    });
    if (pending) {
      return reply.code(409).send({ message: "Já existe uma solicitação de upgrade em análise." });
    }

    const upgrade = await prisma.projectUpgradeRequest.create({
      data: {
        projectId: project.id,
        fromTier: current,
        toTier: body.toTier,
        clientMessage: body.clientMessage?.trim()
      }
    });
    return reply.code(201).send({ upgrade });
  });

  app.patch("/agency/upgrade-requests/:id", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        status: z.enum(["APPROVED", "REJECTED"]),
        adminNote: z.string().max(2000).optional()
      })
      .parse(request.body);

    const row = await prisma.projectUpgradeRequest.findUnique({ where: { id: params.id } });
    if (!row) return reply.code(404).send({ message: "Solicitação não encontrada." });
    if (row.status !== "PENDING") return reply.code(409).send({ message: "Solicitação já foi analisada." });

    if (body.status === "APPROVED") {
      await applyApprovedUpgrade(row.projectId, row.toTier as PackageTierId);
    }

    const upgrade = await prisma.projectUpgradeRequest.update({
      where: { id: params.id },
      data: { status: body.status, adminNote: body.adminNote?.trim() }
    });
    const project = await prisma.project.findUnique({
      where: { id: row.projectId },
      include: projectInclude
    });
    return { upgrade, project };
  });

  app.patch("/agency/phases/:id", async (request) => {
    const user = request.agencyUser!;
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        status: phaseStatusSchema.optional(),
        notes: z.string().optional()
      })
      .parse(request.body);

    const phase = await prisma.projectPhase.findUnique({
      where: { id: params.id },
      include: { project: true }
    });
    if (!phase) throw Object.assign(new Error("Fase não encontrada."), { statusCode: 404 });

    const { project } = phase;
    const isAdmin = user.role === "ADMIN";
    const isFreelancer = user.role === "FREELANCER" && project.freelancerId === user.id;
    const isClient = user.role === "CLIENT" && project.clientId === user.id;

    if (!isAdmin && !isFreelancer && !isClient) {
      throw Object.assign(new Error("Acesso negado."), { statusCode: 403 });
    }

    if (isClient && body.status && !["WAITING_APPROVAL", "APPROVED"].includes(body.status)) {
      throw Object.assign(new Error("Cliente só pode aprovar fases em validação."), { statusCode: 403 });
    }
    if (isClient && body.status === "APPROVED") {
      if (phase.status !== "WAITING_APPROVAL") {
        throw Object.assign(new Error("Esta fase não está aguardando aprovação."), { statusCode: 400 });
      }
    }
    if ((isFreelancer || isAdmin) && body.status === "WAITING_APPROVAL") {
      const open = await prisma.projectPhaseDeliverable.count({
        where: { phaseId: phase.id, status: { not: "DONE" } }
      });
      if (open > 0) {
        throw Object.assign(new Error("Conclua os entregáveis antes de solicitar aprovação."), {
          statusCode: 400
        });
      }
    }

    const updated = await prisma.projectPhase.update({
      where: { id: params.id },
      data: {
        status: body.status,
        notes: body.notes,
        approvedAt: body.status === "APPROVED" ? new Date() : undefined
      },
      include: { deliverables: { orderBy: { sortOrder: "asc" } } }
    });

    if (body.status && (isAdmin || isFreelancer) && project.clientId) {
      await notifyAgencyUser({
        userId: project.clientId,
        projectId: project.id,
        kind: "phase",
        title: `Etapa atualizada: ${phase.label}`,
        body: `Nova situação: ${body.status.replace(/_/g, " ")}.`
      });
    }

    if (body.status === "APPROVED") {
      const next = await prisma.projectPhase.findFirst({
        where: { projectId: project.id, sortOrder: phase.sortOrder + 1 }
      });
      if (next && next.status === "PENDING") {
        await prisma.projectPhase.update({
          where: { id: next.id },
          data: { status: "IN_PROGRESS" }
        });
      }
    }

    return { phase: updated };
  });

  app.patch("/agency/deliverables/:id", async (request) => {
    const user = request.agencyUser!;
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        status: deliverableStatusSchema.optional(),
        feedbackNote: z.string().max(2000).optional()
      })
      .parse(request.body);

    const deliverable = await prisma.projectPhaseDeliverable.findUnique({
      where: { id: params.id },
      include: { phase: { include: { project: true } } }
    });
    if (!deliverable) throw Object.assign(new Error("Entregável não encontrado."), { statusCode: 404 });

    const { project } = deliverable.phase;
    const isAdmin = user.role === "ADMIN";
    const isFreelancer = user.role === "FREELANCER" && project.freelancerId === user.id;

    if (!isAdmin && !isFreelancer) {
      throw Object.assign(new Error("Acesso negado."), { statusCode: 403 });
    }

    const updated = await prisma.projectPhaseDeliverable.update({
      where: { id: params.id },
      data: {
        status: body.status,
        feedbackNote: body.feedbackNote?.trim(),
        completedAt: body.status === "DONE" ? new Date() : undefined
      }
    });

    if (body.status === "DONE" && project.clientId) {
      await notifyAgencyUser({
        userId: project.clientId,
        projectId: project.id,
        kind: "deliverable",
        title: "Entregável concluído",
        body: `${deliverable.label} foi marcado como concluído pela equipe.`
      });
    }

    return { deliverable: updated };
  });

  async function listAgencyAccounts(roleFilter?: "CLIENT" | "FREELANCER") {
    return prisma.user.findMany({
      where: roleFilter ? { role: roleFilter } : { role: { in: ["CLIENT", "FREELANCER"] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, company: true, github: true, createdAt: true }
    });
  }

  app.get("/agency/clients", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const clients = await listAgencyAccounts("CLIENT");
    return { clients };
  });

  app.get("/agency/users", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const role = z.enum(["CLIENT", "FREELANCER"]).optional().parse((request.query as { role?: string }).role);
    const users = await listAgencyAccounts(role);
    return { users };
  });

  app.get("/agency/client/funnel", async (request) => {
    requireRole(request.agencyUser ?? null, ["CLIENT"]);
    const user = request.agencyUser!;
    return resolveClientFunnelState(user.id, user.email, user.name);
  });

  app.post("/agency/client/confirm-live", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["CLIENT"]);
    const user = request.agencyUser!;
    z.object({ attendedLiveConfirm: z.literal(true) }).parse(request.body);

    let lead = await ensureClientFunnelLead(user.id, user.email, user.name);
    const funnelConfig = await getAgencyFunnelConfigRow();
    if (lead.source !== "seed_launch" && !funnelConfig.livePublished) {
      return reply.code(403).send({
        message: "A live ainda não foi publicada pelo administrador. Peça liberação ou aguarde a aula."
      });
    }

    lead = await prisma.lead.update({
      where: { id: lead.id },
      data: {
        userId: user.id,
        liveAttended: true,
        liveAttendedAt: new Date(),
        status: lead.status === "NEW" ? "QUALIFIED" : lead.status
      }
    });

    return { ok: true, lead: { id: lead.id, liveAttended: lead.liveAttended } };
  });

  app.post("/agency/client/hire", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["CLIENT"]);
    const user = request.agencyUser!;
    const body = z.object({ packageTier: tierSchema }).parse(request.body);

    const lead = await ensureClientFunnelLead(user.id, user.email, user.name);

    if (!lead.liveAttended) {
      return reply.code(403).send({
        message:
          "Participação na live ainda não confirmada. Confirme na área do cliente ou peça liberação ao administrador."
      });
    }

    const existingOpen = await prisma.project.findFirst({
      where: {
        clientId: user.id,
        OR: [
          { contractStatus: "PENDING_SIGNATURE" },
          { status: "AWAITING_CHECKOUT" },
          { status: "ACTIVE" }
        ]
      }
    });
    if (existingOpen) {
      return reply.code(409).send({
        message: "Você já tem uma contratação em andamento.",
        projectId: existingOpen.id
      });
    }

    const configRow = await getAgencyFunnelConfigRow();
    const pricing = tierPricingFromConfig(configRow, body.packageTier);
    const tier = pricing.tier;
    const title = `App do Zero ao Lançamento — ${user.company ?? user.name}`;
    let project = await createProjectFromPackage(user.id, title, tier, lead.message, "await_contract");
    project = await prisma.project.update({
      where: { id: project.id },
      data: {
        totalValueCents: pricing.totalValueCents,
        entryValueCents: pricing.entryValueCents
      },
      include: projectInclude
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: { packageTier: tier, status: "WON", projectId: project.id }
    });

    const pkg = resolveFunnelPackages(configRow).find((p) => p.id === tier);
    return reply.code(201).send({
      project,
      contractSummary: pkg?.contractSummary ?? contractSummaryForTier(tier)
    });
  });

  app.post("/agency/projects/:id/sign-contract", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["CLIENT"]);
    const user = request.agencyUser!;
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        acceptedName: z.string().min(3),
        acceptTerms: z.literal(true)
      })
      .parse(request.body);

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project || project.clientId !== user.id) {
      return reply.code(404).send({ message: "Projeto não encontrado." });
    }
    if (project.contractStatus !== "PENDING_SIGNATURE") {
      return reply.code(400).send({ message: "Este projeto não está aguardando assinatura." });
    }

    const updated = await recordContractSignature(project.id, body.acceptedName);
    await notifyAgencyUser({
      userId: user.id,
      projectId: project.id,
      kind: "contract",
      title: "Contrato assinado",
      body: "Prossiga para o checkout (entrada) para liberar a jornada de desenvolvimento."
    });
    return {
      project: updated,
      contractVersion: AGENCY_CONTRACT_VERSION,
      message: "Contrato assinado. Continue para o checkout."
    };
  });

  app.post("/agency/projects/:id/complete-checkout", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["CLIENT"]);
    const user = request.agencyUser!;
    const params = z.object({ id: z.string() }).parse(request.params);
    z.object({ acknowledgePayment: z.literal(true) }).parse(request.body);

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project || project.clientId !== user.id) {
      return reply.code(404).send({ message: "Projeto não encontrado." });
    }

    const updated = await activateProjectAfterCheckout(project.id);
    await notifyAgencyUser({
      userId: user.id,
      projectId: project.id,
      kind: "checkout",
      title: "Checkout registrado",
      body: "Sua jornada de desenvolvimento foi liberada. Acompanhe as etapas abaixo."
    });
    return {
      project: updated,
      message: "Checkout concluído. Projeto ativo."
    };
  });

  app.get("/agency/notifications", async (request) => {
    const user = request.agencyUser!;
    const rows = await prisma.agencyNotification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 40
    });
    return { notifications: rows };
  });

  app.post("/agency/notifications/mark-all-read", async (request) => {
    const user = request.agencyUser!;
    await prisma.agencyNotification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() }
    });
    return { ok: true };
  });

  app.patch("/agency/notifications/:id/read", async (request, reply) => {
    const user = request.agencyUser!;
    const params = z.object({ id: z.string() }).parse(request.params);
    const row = await prisma.agencyNotification.findUnique({ where: { id: params.id } });
    if (!row || row.userId !== user.id) {
      return reply.code(404).send({ message: "Notificação não encontrada." });
    }
    const updated = await prisma.agencyNotification.update({
      where: { id: params.id },
      data: { readAt: new Date() }
    });
    return { notification: updated };
  });

  const funnelConfigPatchSchema = z.object({
    livePublished: z.boolean().optional(),
    liveTitle: z.string().min(3).max(200).optional(),
    liveSubtitle: z.string().max(500).optional().nullable(),
    liveScheduledAt: z.string().datetime().optional().nullable(),
    liveStreamUrl: z.string().url().optional().nullable().or(z.literal("")),
    liveReplayUrl: z.string().url().optional().nullable().or(z.literal("")),
    packagesJson: z.record(z.any()).optional().nullable(),
    contractIntro: z.string().max(2000).optional().nullable(),
    contractClausesJson: z.array(z.string()).optional().nullable(),
    checkoutTitle: z.string().max(200).optional().nullable(),
    checkoutBody: z.string().max(4000).optional().nullable(),
    checkoutPixKey: z.string().max(200).optional().nullable()
  });

  app.get("/agency/admin/funnel-config", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const row = await getAgencyFunnelConfigRow();
    return {
      config: row,
      public: funnelConfigPublicDto(row),
      packages: resolveFunnelPackages(row)
    };
  });

  app.patch("/agency/admin/funnel-config", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = funnelConfigPatchSchema.parse(request.body);
    const row = await prisma.agencyFunnelConfig.update({
      where: { id: "default" },
      data: {
        livePublished: body.livePublished,
        liveTitle: body.liveTitle,
        liveSubtitle: body.liveSubtitle,
        liveScheduledAt: body.liveScheduledAt ? new Date(body.liveScheduledAt) : body.liveScheduledAt === null ? null : undefined,
        liveStreamUrl: body.liveStreamUrl === "" ? null : body.liveStreamUrl,
        liveReplayUrl: body.liveReplayUrl === "" ? null : body.liveReplayUrl,
        packagesJson: body.packagesJson === null ? null : body.packagesJson,
        contractIntro: body.contractIntro,
        contractClausesJson: body.contractClausesJson === null ? null : body.contractClausesJson,
        checkoutTitle: body.checkoutTitle,
        checkoutBody: body.checkoutBody,
        checkoutPixKey: body.checkoutPixKey
      }
    });
    return {
      config: row,
      public: funnelConfigPublicDto(row),
      packages: resolveFunnelPackages(row)
    };
  });
}

declare module "fastify" {
  interface FastifyRequest {
    agencyUser?: import("@ederson-agencia/shared").AuthUser;
  }
}
