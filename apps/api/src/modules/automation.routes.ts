import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  AUTOMATION_TRIGGER_IDS,
  MARKETING_CAPABILITY_MATRIX,
  MARKETING_INTEGRATION_CATALOG,
  type AutomationStep,
  type AutomationTriggerId
} from "@ederson-agencia/shared";
import { Prisma } from "@prisma/client";
import { requireRole } from "../auth.js";
import { prisma } from "../prisma.js";
import { ensureDefaultMarketingAutomations } from "../automation/ensure-defaults.js";
import { dispatchAutomationEvent } from "../automation/dispatch.js";
import { messagingStatus } from "../integrations/messaging/hub.js";

const stepSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  enabled: z.boolean().optional(),
  config: z.record(z.any()).default({})
});

function rowToDto(row: {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  trigger: string;
  triggerFilterJson: unknown;
  stepsJson: unknown;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    enabled: row.enabled,
    trigger: row.trigger as AutomationTriggerId,
    triggerFilter: (row.triggerFilterJson as Record<string, unknown> | null) ?? null,
    steps: (row.stepsJson as AutomationStep[]) ?? [],
    updatedAt: row.updatedAt.toISOString()
  };
}

export async function registerAutomationRoutes(app: FastifyInstance) {
  app.get("/agency/admin/automations/status", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    await ensureDefaultMarketingAutomations();
    return {
      providers: messagingStatus(),
      integrationCatalog: MARKETING_INTEGRATION_CATALOG,
      capabilities: MARKETING_CAPABILITY_MATRIX
    };
  });

  app.get("/agency/admin/automations", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    await ensureDefaultMarketingAutomations();
    const rows = await prisma.marketingAutomation.findMany({ orderBy: { updatedAt: "desc" } });
    return { automations: rows.map(rowToDto) };
  });

  app.post("/agency/admin/automations", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const body = z
      .object({
        name: z.string().min(2).max(120),
        description: z.string().max(500).optional().nullable(),
        enabled: z.boolean().default(true),
        trigger: z.enum(AUTOMATION_TRIGGER_IDS as unknown as [AutomationTriggerId, ...AutomationTriggerId[]]),
        triggerFilter: z.record(z.any()).optional().nullable(),
        steps: z.array(stepSchema).min(1)
      })
      .parse(request.body);

    const row = await prisma.marketingAutomation.create({
      data: {
        name: body.name,
        description: body.description,
        enabled: body.enabled,
        trigger: body.trigger,
        triggerFilterJson: body.triggerFilter ?? undefined,
        stepsJson: body.steps as Prisma.InputJsonValue
      }
    });
    return reply.code(201).send({ automation: rowToDto(row) });
  });

  app.patch("/agency/admin/automations/:id", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        name: z.string().min(2).max(120).optional(),
        description: z.string().max(500).optional().nullable(),
        enabled: z.boolean().optional(),
        trigger: z.enum(AUTOMATION_TRIGGER_IDS as unknown as [AutomationTriggerId, ...AutomationTriggerId[]]).optional(),
        triggerFilter: z.record(z.any()).optional().nullable(),
        steps: z.array(stepSchema).min(1).optional()
      })
      .parse(request.body);

    const existing = await prisma.marketingAutomation.findUnique({ where: { id: params.id } });
    if (!existing) return reply.code(404).send({ message: "Automação não encontrada." });

    const row = await prisma.marketingAutomation.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        enabled: body.enabled,
        trigger: body.trigger,
        triggerFilterJson:
          body.triggerFilter === undefined
            ? undefined
            : body.triggerFilter === null
              ? Prisma.DbNull
              : (body.triggerFilter as Prisma.InputJsonValue),
        stepsJson: body.steps === undefined ? undefined : (body.steps as Prisma.InputJsonValue)
      }
    });
    return { automation: rowToDto(row) };
  });

  app.delete("/agency/admin/automations/:id", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    await prisma.marketingAutomation.delete({ where: { id: params.id } });
    return reply.code(204).send();
  });

  app.get("/agency/admin/automations/:id/runs", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const exists = await prisma.marketingAutomation.findUnique({ where: { id: params.id } });
    if (!exists) return reply.code(404).send({ message: "Automação não encontrada." });

    const runs = await prisma.marketingAutomationRun.findMany({
      where: { automationId: params.id },
      orderBy: { startedAt: "desc" },
      take: 30,
      include: { logs: { orderBy: { stepIndex: "asc" } } }
    });
    return { runs };
  });

  app.post("/agency/admin/automations/:id/test", async (request, reply) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const row = await prisma.marketingAutomation.findUnique({ where: { id: params.id } });
    if (!row) return reply.code(404).send({ message: "Automação não encontrada." });

    const body = z
      .object({
        email: z.string().email().optional(),
        name: z.string().min(2).optional()
      })
      .parse(request.body ?? {});

    dispatchAutomationEvent(
      "manual.test",
      {
        lead: {
          id: "test-lead",
          name: body.name ?? "Teste Automação",
          email: body.email ?? request.agencyUser!.email,
          source: "manual.test",
          packageTier: "professional",
          message: "Disparo de teste pelo editor."
        }
      },
      request.log
    );
    return { ok: true, message: "Teste enfileirado (background)." };
  });
}
