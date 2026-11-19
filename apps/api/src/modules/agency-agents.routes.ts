import {
  AGENCY_AGENT_BOOTSTRAP_TEMPLATE_IDS,
  AGENCY_AGENT_TEMPLATES,
  getAgencyAgentTemplate,
  isAgencyAgentTemplateId
} from "@ederson-agencia/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { applyAgentJob } from "../agents/apply-agent-job.js";
import { generateAgentDraft } from "../agents/llm-draft.js";
import { requireRole } from "../auth.js";
import { prisma } from "../prisma.js";
import type { Prisma } from "@prisma/client";

export async function registerAgencyAgentsRoutes(app: FastifyInstance) {
  app.get("/agency/admin/agents/templates", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    return { templates: AGENCY_AGENT_TEMPLATES };
  });

  app.get("/agency/admin/agents/book", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 80,
      include: {
        client: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, status: true, packageTier: true } }
      }
    });

    const projectIds = projects.map((p) => p.id);
    const [deployments, pendingByProject, campaignsActive] = await Promise.all([
      prisma.agencyAgentDeployment.findMany({
        where: { projectId: { in: projectIds }, status: "ACTIVE" },
        include: { agent: { select: { id: true, name: true, templateId: true, status: true } } }
      }),
      prisma.agencyAgentJob.groupBy({
        by: ["projectId"],
        where: { status: "PENDING_APPROVAL", projectId: { in: projectIds } },
        _count: { _all: true }
      }),
      prisma.marketingCampaign.count({
        where: {
          OR: [{ status: "ACTIVE" }, { kind: { in: ["ACQUISITION", "REMARKETING", "FOLLOW_UP"] } }]
        }
      })
    ]);

    const pendingMap = new Map(
      pendingByProject.filter((r) => r.projectId).map((r) => [r.projectId!, r._count._all])
    );
    const deployMap = new Map<string, typeof deployments>();
    for (const d of deployments) {
      const list = deployMap.get(d.projectId) ?? [];
      list.push(d);
      deployMap.set(d.projectId, list);
    }

    const clients = projects.map((p) => {
      const deps = deployMap.get(p.id) ?? [];
      return {
        projectId: p.id,
        title: p.title,
        status: p.status,
        packageTier: p.packageTier,
        clientId: p.client.id,
        clientName: p.client.name,
        clientEmail: p.client.email,
        leadStatus: p.lead?.status ?? null,
        leadPackageTier: p.lead?.packageTier ?? null,
        agentsDeployed: deps.length,
        agents: deps.map((d) => ({
          id: d.agent.id,
          name: d.agent.name,
          templateId: d.agent.templateId,
          status: d.agent.status
        })),
        pendingApprovals: pendingMap.get(p.id) ?? 0,
        scorecard: {
          health:
            deps.length >= 5 ? "ready" : deps.length > 0 ? "partial" : ("needs_bootstrap" as const)
        }
      };
    });

    return {
      clients,
      campaignsActive,
      totals: {
        clients: clients.length,
        agentsDeployed: deployments.length,
        pendingApprovals: [...pendingMap.values()].reduce((a, b) => a + b, 0)
      }
    };
  });

  app.get("/agency/admin/agents/overview", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const [agentsActive, deployments, pendingJobs, projects] = await Promise.all([
      prisma.agencyAgent.count({ where: { status: "ACTIVE" } }),
      prisma.agencyAgentDeployment.count({ where: { status: "ACTIVE" } }),
      prisma.agencyAgentJob.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.project.findMany({
        select: { id: true, title: true, status: true, client: { select: { name: true, email: true } } },
        orderBy: { updatedAt: "desc" },
        take: 80
      })
    ]);
    return {
      agentsActive,
      deployments,
      pendingJobs,
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        clientName: p.client.name,
        clientEmail: p.client.email
      }))
    };
  });

  app.get("/agency/admin/agents/jobs", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const query = z
      .object({
        status: z.enum(["PENDING_APPROVAL", "APPROVED", "REJECTED", "SENT"]).optional(),
        projectId: z.string().optional()
      })
      .parse(request.query);

    const jobs = await prisma.agencyAgentJob.findMany({
      where: {
        ...(query.status ? { status: query.status } : {}),
        ...(query.projectId ? { projectId: query.projectId } : {})
      },
      orderBy: { createdAt: "desc" },
      take: 80,
      include: { agent: { select: { id: true, name: true, templateId: true } } }
    });
    return { jobs };
  });

  app.post("/agency/admin/agents/jobs/:jobId/decide", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const { jobId } = z.object({ jobId: z.string() }).parse(request.params);
    const body = z
      .object({
        decision: z.enum(["APPROVED", "REJECTED", "SENT"]),
        apply: z.boolean().optional()
      })
      .parse(request.body);

    const job = await prisma.agencyAgentJob.findUnique({ where: { id: jobId } });
    if (!job) return reply.code(404).send({ message: "Job não encontrado." });
    if (job.status !== "PENDING_APPROVAL" && body.decision !== "SENT") {
      return reply.code(400).send({ message: "Job já decidido." });
    }

    const shouldApply =
      body.apply !== false && (body.decision === "APPROVED" || body.decision === "SENT");
    let applied: string[] = [];
    if (shouldApply) {
      try {
        const result = await applyAgentJob(jobId);
        applied = result.applied;
      } catch (e) {
        return reply.code(500).send({
          message: e instanceof Error ? e.message : "Falha ao aplicar entregável."
        });
      }
    }

    const updated = await prisma.agencyAgentJob.update({
      where: { id: jobId },
      data: { status: body.decision, decidedAt: new Date() },
      include: { agent: { select: { id: true, name: true, templateId: true } } }
    });
    return {
      job: updated,
      applied,
      message:
        applied.length > 0
          ? `Aprovado e aplicado (${applied.join(", ")}).`
          : `Job marcado como ${body.decision}.`
    };
  });

  app.post("/agency/admin/agents/bootstrap-client", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = z
      .object({
        projectId: z.string().min(1),
        brandVoice: z.string().max(2000).optional(),
        offerSummary: z.string().max(2000).optional()
      })
      .parse(request.body);

    const project = await prisma.project.findUnique({
      where: { id: body.projectId },
      include: { client: { select: { name: true } } }
    });
    if (!project) return reply.code(404).send({ message: "Projeto não encontrado." });

    const existing = await prisma.agencyAgentDeployment.findMany({
      where: { projectId: body.projectId },
      include: { agent: true }
    });
    const existingTemplates = new Set(existing.map((d) => d.agent.templateId));

    const created: string[] = [];
    for (const templateId of AGENCY_AGENT_BOOTSTRAP_TEMPLATE_IDS) {
      if (existingTemplates.has(templateId)) continue;
      const tpl = getAgencyAgentTemplate(templateId)!;
      const agent = await prisma.agencyAgent.create({
        data: {
          name: `${tpl.label} · ${project.client.name}`,
          templateId,
          sourceProjectId: project.id,
          brandVoice: body.brandVoice ?? null,
          offerSummary: body.offerSummary ?? project.title,
          guardrails: tpl.defaultGuardrails,
          systemPrompt: tpl.defaultPrompt,
          status: "ACTIVE",
          configJson: {
            channels: [...tpl.channels],
            domain: tpl.domain,
            skills: tpl.skills
          } satisfies Prisma.InputJsonValue
        }
      });
      await prisma.agencyAgentDeployment.create({
        data: { agentId: agent.id, projectId: project.id, status: "ACTIVE" }
      });
      created.push(agent.id);
    }

    return {
      message:
        created.length > 0
          ? `Bootstrap: ${created.length} agentes especialistas implantados.`
          : "Cliente já tinha o pacote padrão de agentes.",
      createdCount: created.length,
      projectId: project.id
    };
  });

  app.get("/agency/admin/agents", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const agents = await prisma.agencyAgent.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        deployments: true,
        _count: { select: { jobs: true } }
      }
    });
    return { agents, templates: AGENCY_AGENT_TEMPLATES };
  });

  app.post("/agency/admin/agents", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = z
      .object({
        name: z.string().min(2).max(120),
        templateId: z.string().refine(isAgencyAgentTemplateId, "template inválido"),
        sourceProjectId: z.string().optional(),
        brandVoice: z.string().max(2000).optional(),
        offerSummary: z.string().max(2000).optional(),
        guardrails: z.string().max(4000).optional(),
        systemPrompt: z.string().max(4000).optional(),
        activate: z.boolean().optional()
      })
      .parse(request.body);

    const tpl = getAgencyAgentTemplate(body.templateId)!;
    if (body.sourceProjectId) {
      const project = await prisma.project.findUnique({ where: { id: body.sourceProjectId } });
      if (!project) return reply.code(404).send({ message: "Projeto não encontrado." });
    }

    const agent = await prisma.agencyAgent.create({
      data: {
        name: body.name,
        templateId: body.templateId,
        sourceProjectId: body.sourceProjectId,
        brandVoice: body.brandVoice ?? null,
        offerSummary: body.offerSummary ?? null,
        guardrails: body.guardrails ?? tpl.defaultGuardrails,
        systemPrompt: body.systemPrompt ?? tpl.defaultPrompt,
        status: body.activate ? "ACTIVE" : "DRAFT",
        configJson: {
          channels: [...tpl.channels],
          domain: tpl.domain,
          skills: tpl.skills
        } satisfies Prisma.InputJsonValue
      },
      include: { deployments: true }
    });

    if (body.sourceProjectId) {
      await prisma.agencyAgentDeployment.create({
        data: { agentId: agent.id, projectId: body.sourceProjectId, status: "ACTIVE" }
      });
    }

    const full = await prisma.agencyAgent.findUnique({
      where: { id: agent.id },
      include: { deployments: true, _count: { select: { jobs: true } } }
    });
    return { agent: full, message: "Agente criado." };
  });

  app.patch("/agency/admin/agents/:id", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        name: z.string().min(2).max(120).optional(),
        status: z.enum(["DRAFT", "ACTIVE", "PAUSED"]).optional(),
        brandVoice: z.string().max(2000).nullable().optional(),
        offerSummary: z.string().max(2000).nullable().optional(),
        guardrails: z.string().max(4000).nullable().optional(),
        systemPrompt: z.string().max(4000).nullable().optional()
      })
      .parse(request.body);

    const existing = await prisma.agencyAgent.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ message: "Agente não encontrado." });

    const agent = await prisma.agencyAgent.update({
      where: { id },
      data: {
        name: body.name,
        status: body.status,
        brandVoice: body.brandVoice === undefined ? undefined : body.brandVoice,
        offerSummary: body.offerSummary === undefined ? undefined : body.offerSummary,
        guardrails: body.guardrails === undefined ? undefined : body.guardrails,
        systemPrompt: body.systemPrompt === undefined ? undefined : body.systemPrompt
      },
      include: { deployments: true, _count: { select: { jobs: true } } }
    });
    return { agent };
  });

  app.post("/agency/admin/agents/:id/deploy", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        projectIds: z.array(z.string()).min(1).max(100),
        status: z.enum(["ACTIVE", "PAUSED"]).default("ACTIVE")
      })
      .parse(request.body);

    const agent = await prisma.agencyAgent.findUnique({ where: { id } });
    if (!agent) return reply.code(404).send({ message: "Agente não encontrado." });

    const projects = await prisma.project.findMany({
      where: { id: { in: body.projectIds } },
      select: { id: true }
    });
    const found = new Set(projects.map((p) => p.id));
    const missing = body.projectIds.filter((pid) => !found.has(pid));
    if (missing.length) {
      return reply.code(400).send({ message: `Projetos inválidos: ${missing.join(", ")}` });
    }

    await prisma.$transaction(
      body.projectIds.map((projectId) =>
        prisma.agencyAgentDeployment.upsert({
          where: { agentId_projectId: { agentId: id, projectId } },
          create: { agentId: id, projectId, status: body.status },
          update: { status: body.status }
        })
      )
    );

    if (agent.status === "DRAFT") {
      await prisma.agencyAgent.update({ where: { id }, data: { status: "ACTIVE" } });
    }

    const full = await prisma.agencyAgent.findUnique({
      where: { id },
      include: { deployments: true, _count: { select: { jobs: true } } }
    });
    return { agent: full, message: `Implantado em ${body.projectIds.length} projeto(s).` };
  });

  app.post("/agency/admin/agents/:id/run", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        projectId: z.string().optional(),
        kind: z.string().min(2).max(60).optional(),
        title: z.string().min(2).max(160).optional(),
        input: z.record(z.any()).optional()
      })
      .parse(request.body);

    const agent = await prisma.agencyAgent.findUnique({ where: { id } });
    if (!agent) return reply.code(404).send({ message: "Agente não encontrado." });

    const projectId = body.projectId ?? agent.sourceProjectId ?? undefined;
    let clientName: string | undefined;
    let projectTitle: string | undefined;
    let packageTier: string | undefined;
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { client: { select: { name: true } }, lead: { select: { packageTier: true } } }
      });
      clientName = project?.client.name;
      projectTitle = project?.title;
      packageTier = project?.packageTier ?? project?.lead?.packageTier ?? undefined;
    }

    const tpl = getAgencyAgentTemplate(agent.templateId);
    const { draft, source } = await generateAgentDraft({
      templateId: agent.templateId,
      brandVoice: agent.brandVoice,
      offerSummary: agent.offerSummary,
      guardrails: agent.guardrails,
      clientName,
      projectTitle,
      input: {
        ...(body.input ?? {}),
        packageTier: (body.input?.packageTier as string | undefined) ?? packageTier
      }
    });

    const job = await prisma.agencyAgentJob.create({
      data: {
        agentId: id,
        projectId,
        kind: body.kind ?? tpl?.deliverableKind ?? "draft",
        title: body.title ?? `${tpl?.label ?? "Agente"} · ${clientName ?? projectTitle ?? "rascunho"}`,
        status: "PENDING_APPROVAL",
        inputJson: (body.input ?? {}) as Prisma.InputJsonValue,
        draftJson: { ...draft, source } as Prisma.InputJsonValue
      }
    });

    return {
      job,
      source,
      message: "Rascunho gerado — aguardando aprovação (aplica no projeto ao aprovar)."
    };
  });

}
