import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  AGENCY_CONTRACT_VERSION,
  contractSummaryForTier,
  sanitizeContractCompany,
  normalizePartyDetails,
  validatePartyDetails,
  type AgencyContractPartyDetails,
  PACKAGE_TIER_CONFIG,
  PACKAGE_TIER_IDS,
  nextUpgradeTier,
  parsePackageTier,
  type PackageTierId
} from "@ederson-agencia/shared";
import { assertAgencySession } from "../auth-access.js";
import { getAuthUser, requireClientRole, requireRole, toAuthUser } from "../auth.js";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import {
  activateProjectAfterCheckout,
  applyApprovedUpgrade,
  createProjectFromPackage,
  projectInclude,
  recordContractSignature,
  resolvePackageTier
} from "./agency-project.js";
import { ensureClientFunnelLead, resolveClientFunnelState } from "../agency/client-funnel.js";
import {
  applyInstitutionalFunnelConfig,
  funnelConfigPublicDto,
  getAgencyFunnelConfigRow,
  resolveFunnelPackages,
  tierPricingFromConfig
} from "../agency/funnel-config.js";
import { notifyAgencyUser } from "../agency/notifications.js";
import {
  loadProjectWorkspace,
  patchProjectWorkspaceField,
  patchProjectWorkspaceTask
} from "../agency/project-workspace-persist.js";
import { saveBrandingUpload } from "../uploads/project-branding-storage.js";
import { ensureProjectWebhookToken } from "../agency/webhook-ingress.js";
import {
  extractBrandingFields,
  projectWorkspaceFeedProjections,
  projectWorkspaceSummary,
  buildLaunchKitExport,
  buildLeadloversBlueprint,
  buildHotmartProductDraft,
  renderAllLaunchTemplates
} from "@ederson-agencia/shared";
import { env } from "../env.js";
import { buildLaunchPageSnapshot, slugifyLaunchTitle } from "../agency/launch-page.js";
import { sendLaunchTemplateEmail } from "../mail/send-launch-template-email.js";
import { pushHotmartProductDraft } from "../agency/hotmart-sync.js";
import type { LaunchTemplateId } from "@ederson-agencia/shared";

const leadStatusSchema = z.enum(["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"]);
const phaseStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "WAITING_APPROVAL", "APPROVED", "DONE"]);
const deliverableStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "DONE"]);
const tierSchema = z.enum(PACKAGE_TIER_IDS);

const contractAddressSchema = z.object({
  street: z.string().trim().min(1, "Informe o logradouro."),
  number: z.string().trim().min(1, "Informe o número."),
  complement: z.string().trim().optional().nullable(),
  district: z.string().trim().min(1, "Informe o bairro."),
  city: z.string().trim().min(1, "Informe a cidade."),
  state: z.string().trim().min(2, "Informe a UF.").max(2),
  zip: z.string().trim().min(8, "Informe o CEP completo.")
});

const contractPartyDetailsSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("pf"),
    email: z.string().email("Informe um e-mail válido."),
    phone: z.string().trim().max(40).optional().nullable(),
    fullName: z.string().trim().min(3, "Informe o nome completo."),
    cpf: z.string().trim().min(11, "Informe o CPF completo."),
    rg: z.string().trim().min(2, "Informe o RG."),
    profession: z.string().trim().optional().nullable(),
    maritalStatus: z.string().trim().optional().nullable(),
    address: contractAddressSchema
  }),
  z.object({
    kind: z.literal("pj"),
    email: z.string().email("Informe um e-mail válido."),
    phone: z.string().trim().max(40).optional().nullable(),
    corporateName: z.string().trim().min(3, "Informe a razão social."),
    cnpj: z.string().trim().min(14, "Informe o CNPJ completo."),
    stateRegistration: z.string().trim().optional().nullable(),
    municipalRegistration: z.string().trim().optional().nullable(),
    hqAddress: contractAddressSchema,
    representativeName: z.string().trim().min(3, "Informe o nome do representante legal."),
    representativeCpf: z.string().trim().min(11, "Informe o CPF do representante."),
    representativeRg: z.string().trim().min(2, "Informe o RG do representante."),
    representativeRole: z.string().trim().min(2, "Informe o cargo do representante.")
  })
]);

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
    const pathOnly = request.url.split("?")[0] ?? "";
    if (pathOnly === "/agency/canva/oauth/callback") return;
    const tokenUser = await getAuthUser(request);
    if (!tokenUser) {
      return reply.code(401).send({ message: "Faça login para continuar." });
    }
    const context = tokenUser.authContext ?? "agency";
    const dbUser = await prisma.user.findUnique({ where: { id: tokenUser.id } });
    if (!dbUser || dbUser.status !== "ACTIVE") {
      return reply.code(401).send({ message: "Sessão expirada. Faça login novamente." });
    }
    const user = toAuthUser(dbUser, context);
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
    if (user.role !== "ADMIN") {
      return { projects };
    }
    return {
      projects: projects.map((project) => ({
        ...project,
        operationSummary: projectWorkspaceSummary(loadProjectWorkspace(project))
      }))
    };
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

  app.get("/agency/projects/:id/launch-operation", async (request) => {
    const user = request.agencyUser!;
    const params = z.object({ id: z.string() }).parse(request.params);
    await assertProjectAccess(user, params.id);
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        projectWorkspaceJson: true,
        brandingWorkspaceJson: true,
        launchOpCheckedJson: true
      }
    });
    if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
    const workspace = loadProjectWorkspace(project);
    return {
      projectId: project.id,
      projectTitle: project.title,
      checked: workspace.checklist
    };
  });

  app.patch("/agency/projects/:id/launch-operation", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        taskId: z.string().min(3).max(120),
        done: z.boolean()
      })
      .parse(request.body);
    await assertProjectAccess(request.agencyUser!, params.id);
    const workspace = await patchProjectWorkspaceTask(params.id, body.taskId, body.done);
    return { checked: workspace.checklist };
  });

  app.get("/agency/projects/:id/workspace", async (request) => {
    const user = request.agencyUser!;
    const params = z.object({ id: z.string() }).parse(request.params);
    await assertProjectAccess(user, params.id);
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        projectWorkspaceJson: true,
        brandingWorkspaceJson: true,
        launchOpCheckedJson: true
      }
    });
    if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
    const workspace = loadProjectWorkspace(project);
    return {
      projectId: project.id,
      projectTitle: project.title,
      workspace,
      summary: projectWorkspaceSummary(workspace),
      projections: projectWorkspaceFeedProjections(workspace.fields)
    };
  });

  app.patch("/agency/projects/:id/workspace", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        fieldId: z.string().regex(/^(branding|product|integration|marketing|formula):[a-z0-9:-]+$/i).max(120).optional(),
        value: z.unknown().optional(),
        taskId: z.string().min(3).max(120).optional(),
        done: z.boolean().optional()
      })
      .refine(
        (b) =>
          (b.fieldId != null && b.value !== undefined) ||
          (b.taskId != null && typeof b.done === "boolean"),
        { message: "Informe fieldId+value ou taskId+done." }
      )
      .parse(request.body);
    await assertProjectAccess(request.agencyUser!, params.id);

    let workspace;
    if (body.fieldId != null) {
      workspace = await patchProjectWorkspaceField(
        params.id,
        body.fieldId,
        body.value === undefined ? null : (body.value as import("@ederson-agencia/shared").BrandingFieldValue)
      );
    } else {
      workspace = await patchProjectWorkspaceTask(params.id, body.taskId!, body.done!);
    }

    return {
      workspace,
      summary: projectWorkspaceSummary(workspace),
      projections: projectWorkspaceFeedProjections(workspace.fields),
      data: extractBrandingFields(workspace),
      checked: workspace.checklist
    };
  });

  app.get("/agency/projects/:id/integrations", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    await assertProjectAccess(request.agencyUser!, params.id);
    const token = await ensureProjectWebhookToken(params.id);
    const proto = String(request.headers["x-forwarded-proto"] ?? request.protocol ?? "https");
    const host = String(request.headers["x-forwarded-host"] ?? request.hostname);
    const baseUrl = `${proto}://${host}`.replace(/\/$/, "");
    const providers = ["hotmart", "kiwify", "monetizze", "leadlovers"] as const;
    const webhooks = Object.fromEntries(
      providers.map((provider) => [provider, `${baseUrl}/public/webhooks/${provider}/${token}`])
    ) as Record<(typeof providers)[number], string>;
    return { ingressToken: token, webhooks };
  });

  app.get("/agency/projects/:id/external-events", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const query = z.object({ limit: z.coerce.number().min(1).max(50).default(20) }).parse(request.query);
    await assertProjectAccess(request.agencyUser!, params.id);
    const events = await prisma.projectExternalEvent.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: "desc" },
      take: query.limit,
      select: { id: true, provider: true, eventType: true, createdAt: true }
    });
    return { events };
  });

  app.get("/agency/projects/:id/launch-kit", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    await assertProjectAccess(request.agencyUser!, params.id);
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        projectWorkspaceJson: true,
        brandingWorkspaceJson: true,
        launchOpCheckedJson: true
      }
    });
    if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
    const workspace = loadProjectWorkspace(project);
    return {
      projectId: project.id,
      projectTitle: project.title,
      export: buildLaunchKitExport(workspace, project.title),
      templates: renderAllLaunchTemplates(workspace.fields),
      leadlovers: buildLeadloversBlueprint(workspace.fields),
      hotmart: buildHotmartProductDraft(workspace.fields)
    };
  });

  app.post("/agency/projects/:id/launch-page/publish", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        slug: z.string().min(3).max(80).regex(/^[a-z0-9-]+$/).optional(),
        unpublish: z.boolean().optional()
      })
      .parse(request.body ?? {});
    await assertProjectAccess(request.agencyUser!, params.id);

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        launchPublicSlug: true,
        projectWorkspaceJson: true,
        brandingWorkspaceJson: true,
        launchOpCheckedJson: true
      }
    });
    if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });

    if (body.unpublish) {
      await prisma.project.update({
        where: { id: params.id },
        data: { launchPagePublished: false }
      });
      return { published: false, slug: project.launchPublicSlug };
    }

    const workspace = loadProjectWorkspace(project);
    const snapshot = buildLaunchPageSnapshot(workspace);
    const slug = body.slug ?? project.launchPublicSlug ?? slugifyLaunchTitle(project.title, project.id);

    const clash = await prisma.project.findFirst({
      where: { launchPublicSlug: slug, NOT: { id: params.id } }
    });
    if (clash) {
      throw Object.assign(new Error("Slug já em uso por outro projeto."), { statusCode: 409 });
    }

    await prisma.project.update({
      where: { id: params.id },
      data: {
        launchPublicSlug: slug,
        launchPagePublished: true,
        launchPageJson: snapshot as Prisma.InputJsonValue
      }
    });

    const origin = env.WEB_ORIGIN.split(",")[0]?.trim() || "http://localhost:5174";
    return {
      published: true,
      slug,
      publicPath: `/l/${slug}`,
      publicUrl: `${origin.replace(/\/$/, "")}/l/${slug}`,
      snapshot
    };
  });

  app.post("/agency/projects/:id/launch-kit/send-email", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        templateId: z.enum(["email-ppl-confirm", "email-cpl1-invite", "email-cart-open"]),
        to: z.string().email()
      })
      .parse(request.body);
    await assertProjectAccess(request.agencyUser!, params.id);
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { projectWorkspaceJson: true, brandingWorkspaceJson: true, launchOpCheckedJson: true }
    });
    if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
    const workspace = loadProjectWorkspace(project);
    const result = await sendLaunchTemplateEmail({
      to: body.to,
      templateId: body.templateId as LaunchTemplateId,
      fields: workspace.fields,
      log: request.log
    });
    return reply.send(result);
  });

  app.post("/agency/projects/:id/sync/hotmart", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    await assertProjectAccess(request.agencyUser!, params.id);
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { projectWorkspaceJson: true, brandingWorkspaceJson: true, launchOpCheckedJson: true }
    });
    if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
    const workspace = loadProjectWorkspace(project);
    try {
      const result = await pushHotmartProductDraft(workspace.fields);
      return result;
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode ?? 502;
      return reply.code(statusCode).send({ message: (err as Error).message });
    }
  });

  app.post("/agency/projects/:id/sync/leadlovers", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    await assertProjectAccess(request.agencyUser!, params.id);
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        projectWorkspaceJson: true,
        brandingWorkspaceJson: true,
        launchOpCheckedJson: true
      }
    });
    if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
    const workspace = loadProjectWorkspace(project);
    const blueprint = buildLeadloversBlueprint(workspace.fields);
    const token =
      typeof workspace.fields["integration:leadlovers:api-token"] === "string"
        ? workspace.fields["integration:leadlovers:api-token"].trim()
        : "";

    const apiUrl = env.LEADLOVERS_API_URL?.trim();
    if (!apiUrl || !token) {
      return {
        mode: "dry_run" as const,
        message:
          "Configure integration:leadlovers:api-token no workspace e LEADLOVERS_API_URL no servidor para push real.",
        blueprint
      };
    }

    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, "")}/automations/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(blueprint)
      });
      if (!res.ok) {
        const text = await res.text();
        return reply.code(502).send({
          message: "Leadlovers recusou o sync.",
          status: res.status,
          body: text.slice(0, 500)
        });
      }
      const data = await res.json().catch(() => ({}));
      return { mode: "pushed" as const, blueprint, response: data };
    } catch (err) {
      return reply.code(502).send({ message: (err as Error).message });
    }
  });

  app.get("/agency/projects/:id/branding-workspace", async (request) => {
    const user = request.agencyUser!;
    const params = z.object({ id: z.string() }).parse(request.params);
    await assertProjectAccess(user, params.id);
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        projectWorkspaceJson: true,
        brandingWorkspaceJson: true,
        launchOpCheckedJson: true
      }
    });
    if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
    const workspace = loadProjectWorkspace(project);
    return {
      projectId: project.id,
      projectTitle: project.title,
      data: extractBrandingFields(workspace)
    };
  });

  app.patch("/agency/projects/:id/branding-workspace", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        fieldId: z.string().regex(/^(branding|product|integration):[a-z0-9:-]+$/i).max(120),
        value: z.unknown()
      })
      .parse(request.body);
    await assertProjectAccess(request.agencyUser!, params.id);
    const workspace = await patchProjectWorkspaceField(
      params.id,
      body.fieldId,
      body.value === null ? null : (body.value as import("@ederson-agencia/shared").BrandingFieldValue)
    );
    return { data: extractBrandingFields(workspace) };
  });

  app.post("/agency/projects/:id/branding-workspace/upload", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    await assertProjectAccess(request.agencyUser!, params.id);

    let fieldId = "";
    let filePart: Awaited<ReturnType<typeof request.file>> | null = null;

    for await (const part of request.parts()) {
      if (part.type === "file" && part.fieldname === "file") {
        filePart = part;
      } else if (part.type === "field" && part.fieldname === "fieldId") {
        fieldId = String(part.value ?? "");
      }
    }

    if (!filePart) {
      return reply.code(400).send({ message: "Envie um arquivo (campo file)." });
    }
    if (!/^branding:[a-z0-9:-]+$/i.test(fieldId)) {
      return reply.code(400).send({ message: "fieldId inválido." });
    }

    try {
      const asset = await saveBrandingUpload(
        params.id,
        fieldId,
        filePart.mimetype,
        filePart.filename,
        filePart.file
      );
      return { asset };
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode ?? 400;
      return reply.code(statusCode).send({ message: (error as Error).message });
    }
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
    requireClientRole(request.agencyUser ?? null);
    const user = request.agencyUser!;
    return resolveClientFunnelState(user.id, user.email, user.name);
  });

  app.post("/agency/client/funnel/sync-lead", async (request) => {
    requireClientRole(request.agencyUser ?? null);
    const user = request.agencyUser!;
    const lead = await ensureClientFunnelLead(user.id, user.email, user.name);
    return {
      ok: true,
      lead: {
        id: lead.id,
        source: lead.source,
        liveAttended: lead.liveAttended,
        email: lead.email
      }
    };
  });

  app.post("/agency/client/confirm-live", async (request, reply) => {
    requireClientRole(request.agencyUser ?? null);
    const user = request.agencyUser!;
    z.object({ attendedLiveConfirm: z.literal(true) }).parse(request.body);

    let lead = await ensureClientFunnelLead(user.id, user.email, user.name);
    const funnelConfig = await getAgencyFunnelConfigRow();
    if (
      !funnelConfig.livePublished &&
      lead.source !== "seed_launch" &&
      lead.source !== "cadastro" &&
      lead.source !== "portal"
    ) {
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
    requireClientRole(request.agencyUser ?? null);
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
    requireClientRole(request.agencyUser ?? null);
    const user = request.agencyUser!;
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        acceptTerms: z.literal(true, { errorMap: () => ({ message: "Aceite os termos do contrato." }) }),
        partyDetails: contractPartyDetailsSchema
      })
      .parse(request.body);

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project || project.clientId !== user.id) {
      return reply.code(404).send({ message: "Projeto não encontrado." });
    }
    if (project.contractStatus !== "PENDING_SIGNATURE") {
      return reply.code(400).send({ message: "Este projeto não está aguardando assinatura." });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const email = (dbUser?.email ?? user.email).trim().toLowerCase();
    const partyDetails = normalizePartyDetails({
      ...body.partyDetails,
      email,
      phone: body.partyDetails.phone?.trim() || null
    });
    const validationError = validatePartyDetails(partyDetails);
    if (validationError) {
      return reply.code(400).send({ message: validationError });
    }

    const funnelConfigRow = await getAgencyFunnelConfigRow();
    const funnelPublic = funnelConfigPublicDto(funnelConfigRow);
    const tier = parsePackageTier(project.packageTier) ?? "professional";
    const fallbackClauses = contractSummaryForTier(tier).clauses;

    const updated = await recordContractSignature(project.id, partyDetails, {
      intro: funnelPublic.contract.intro,
      clauses: funnelPublic.contract.clauses.length ? funnelPublic.contract.clauses : fallbackClauses
    });

    if (dbUser && partyDetails.phone?.trim() && !dbUser.phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone: partyDetails.phone.trim() }
      });
    }
    if (dbUser && partyDetails.kind === "pj") {
      const company = sanitizeContractCompany(partyDetails.corporateName);
      if (company && !sanitizeContractCompany(dbUser.company)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { company }
        });
      }
    }
    try {
      await notifyAgencyUser({
        userId: user.id,
        projectId: project.id,
        kind: "contract",
        title: "Contrato assinado",
        body: "Prossiga para o checkout (entrada) para liberar a jornada de desenvolvimento."
      });
    } catch (notifyError) {
      request.log.warn({ err: notifyError, projectId: project.id }, "Falha ao criar notificação pós-assinatura");
    }
    return {
      project: updated,
      contractVersion: AGENCY_CONTRACT_VERSION,
      message: "Contrato assinado. Continue para o checkout."
    };
  });

  app.post("/agency/projects/:id/complete-checkout", async (request, reply) => {
    requireClientRole(request.agencyUser ?? null);
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

  app.post("/agency/admin/funnel-config/apply-institutional", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = z.object({ force: z.boolean().optional() }).parse(request.body ?? {});
    const row = await applyInstitutionalFunnelConfig(body.force === true);
    return {
      config: row,
      public: funnelConfigPublicDto(row),
      packages: resolveFunnelPackages(row),
      message: body.force
        ? "Funil substituído pelos dados da página institucional."
        : "Campos vazios preenchidos com dados da página institucional."
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
        packagesJson:
          body.packagesJson === null ? Prisma.DbNull : body.packagesJson === undefined ? undefined : body.packagesJson,
        contractIntro: body.contractIntro,
        contractClausesJson:
          body.contractClausesJson === null
            ? Prisma.DbNull
            : body.contractClausesJson === undefined
              ? undefined
              : body.contractClausesJson,
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

  const { registerCanvaRoutes } = await import("../integrations/canva.routes.js");
  await registerCanvaRoutes(app);
}

declare module "fastify" {
  interface FastifyRequest {
    agencyUser?: import("@ederson-agencia/shared").AuthUser;
  }
}
