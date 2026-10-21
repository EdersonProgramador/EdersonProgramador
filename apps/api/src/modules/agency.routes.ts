import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { CONTRACT_DEFAULTS } from "@ederson-agencia/shared";
import { getAuthUser, requireRole } from "../auth.js";
import { prisma } from "../prisma.js";

const leadStatusSchema = z.enum(["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"]);
const phaseStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "WAITING_APPROVAL", "APPROVED", "DONE"]);

async function createProjectFromContract(clientId: string, title: string, description?: string) {
  return prisma.project.create({
    data: {
      title,
      description,
      clientId,
      totalValueCents: CONTRACT_DEFAULTS.totalValueCents,
      entryValueCents: CONTRACT_DEFAULTS.entryValueCents,
      phases: {
        create: CONTRACT_DEFAULTS.phases.map((phase, index) => ({
          phaseKey: phase.key,
          label: phase.label,
          sortOrder: index,
          daysPlanned: phase.days
        }))
      }
    },
    include: { phases: { orderBy: { sortOrder: "asc" } }, client: true, freelancer: true }
  });
}

export async function registerAgencyRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    if (!request.url.startsWith("/agency")) return;
    const user = await getAuthUser(request);
    if (!user) {
      return reply.code(401).send({ message: "Faça login para continuar." });
    }
    request.agencyUser = user;
  });

  app.get("/agency/dashboard", async (request) => {
    const user = request.agencyUser!;
    if (user.role === "ADMIN") {
      const [leads, projects, freelancers, clients] = await Promise.all([
        prisma.lead.count(),
        prisma.project.count(),
        prisma.user.count({ where: { role: "FREELANCER" } }),
        prisma.user.count({ where: { role: "CLIENT" } })
      ]);
      return { role: user.role, stats: { leads, projects, freelancers, clients } };
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
        assigneeId: z.string().nullable().optional()
      })
      .parse(request.body);

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        status: body.status,
        assigneeId: body.assigneeId
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
        projectTitle: z.string().min(3).default("Projeto de desenvolvimento")
      })
      .parse(request.body ?? {});

    const lead = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!lead) return reply.code(404).send({ message: "Lead não encontrado." });
    if (lead.projectId) return reply.code(409).send({ message: "Lead já convertido em projeto." });

    let client = await prisma.user.findUnique({ where: { email: body.clientEmail.toLowerCase() } });
    if (!client) {
      return reply.code(400).send({
        message: "Cliente não encontrado. Peça para o cliente criar conta ou crie manualmente."
      });
    }

    const project = await createProjectFromContract(client.id, body.projectTitle, lead.message);
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "WON", projectId: project.id }
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
      include: {
        phases: { orderBy: { sortOrder: "asc" } },
        client: { select: { id: true, name: true, email: true, company: true } },
        freelancer: { select: { id: true, name: true, email: true } }
      }
    });
    return { projects };
  });

  app.post("/agency/projects", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = z
      .object({
        clientId: z.string(),
        title: z.string().min(3),
        description: z.string().optional(),
        freelancerId: z.string().optional()
      })
      .parse(request.body);

    const project = await createProjectFromContract(body.clientId, body.title, body.description);
    if (body.freelancerId) {
      await prisma.project.update({
        where: { id: project.id },
        data: { freelancerId: body.freelancerId, status: "ACTIVE" }
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
      include: { phases: { orderBy: { sortOrder: "asc" } }, client: true, freelancer: true }
    });
    return { project: updated };
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
      throw Object.assign(new Error("Cliente só pode solicitar aprovação ou aprovar fases."), { statusCode: 403 });
    }

    const updated = await prisma.projectPhase.update({
      where: { id: params.id },
      data: {
        status: body.status,
        notes: body.notes,
        approvedAt: body.status === "APPROVED" ? new Date() : undefined
      }
    });
    return { phase: updated };
  });

  app.get("/agency/users", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const role = z.enum(["CLIENT", "FREELANCER"]).optional().parse((request.query as { role?: string }).role);
    const users = await prisma.user.findMany({
      where: role ? { role } : { role: { in: ["CLIENT", "FREELANCER"] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, company: true, github: true, createdAt: true }
    });
    return { users };
  });
}

declare module "fastify" {
  interface FastifyRequest {
    agencyUser?: import("@ederson-agencia/shared").AuthUser;
  }
}
