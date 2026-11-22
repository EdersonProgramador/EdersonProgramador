import {
  AGENCY_OPS_DELIVERABLE_STATUSES,
  isAgencyOpsVerticalId,
  type AgencyOpsDeliverableStatus
} from "@ederson-agencia/shared";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireRole } from "../auth.js";
import { prisma } from "../prisma.js";

const statusSchema = z.string().refine(
  (v): v is AgencyOpsDeliverableStatus =>
    (AGENCY_OPS_DELIVERABLE_STATUSES as readonly string[]).includes(v),
  { message: "Status inválido" }
);

export async function registerAgencyOpsRoutes(app: FastifyInstance) {
  app.get("/agency/admin/ops/deliverables", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const query = z
      .object({
        vertical: z.string().optional(),
        projectId: z.string().optional()
      })
      .parse(request.query);

    const vertical =
      query.vertical && isAgencyOpsVerticalId(query.vertical) ? query.vertical : undefined;

    const deliverables = await prisma.agencyOpsDeliverable.findMany({
      where: {
        ...(vertical ? { vertical } : {}),
        ...(query.projectId ? { projectId: query.projectId } : {})
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 200
    });
    return { deliverables };
  });

  app.post("/agency/admin/ops/deliverables", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = z
      .object({
        title: z.string().min(2).max(200),
        vertical: z.string().min(2),
        projectId: z.string().optional(),
        status: statusSchema.optional(),
        notes: z.string().max(4000).optional()
      })
      .parse(request.body);

    if (!isAgencyOpsVerticalId(body.vertical)) {
      return reply.code(400).send({ message: "Vertical inválida." });
    }

    const deliverable = await prisma.agencyOpsDeliverable.create({
      data: {
        title: body.title,
        vertical: body.vertical,
        projectId: body.projectId,
        status: body.status ?? "TODO",
        notes: body.notes
      }
    });
    return { deliverable, message: "Entregável criado." };
  });

  app.patch("/agency/admin/ops/deliverables/:id", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        title: z.string().min(2).max(200).optional(),
        status: statusSchema.optional(),
        approvalStatus: z.enum(["NONE", "PENDING", "APPROVED", "REJECTED"]).optional(),
        timeMinutes: z.number().int().min(0).max(24 * 60).nullable().optional(),
        notes: z.string().max(4000).nullable().optional(),
        projectId: z.string().nullable().optional(),
        agentJobId: z.string().nullable().optional()
      })
      .parse(request.body);

    const existing = await prisma.agencyOpsDeliverable.findUnique({ where: { id } });
    if (!existing) return reply.code(404).send({ message: "Entregável não encontrado." });

    const deliverable = await prisma.agencyOpsDeliverable.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.approvalStatus !== undefined ? { approvalStatus: body.approvalStatus } : {}),
        ...(body.timeMinutes !== undefined ? { timeMinutes: body.timeMinutes } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.projectId !== undefined ? { projectId: body.projectId } : {}),
        ...(body.agentJobId !== undefined ? { agentJobId: body.agentJobId } : {})
      }
    });
    return { deliverable, message: "Entregável atualizado." };
  });
}
