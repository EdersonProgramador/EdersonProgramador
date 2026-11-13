import type { AutomationStep, AutomationTriggerFilter } from "@ederson-agencia/shared";
import type { FastifyBaseLogger } from "fastify";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { executeAutomationStep } from "./execute-step.js";
import type { AutomationContext } from "./types.js";

function matchesFilter(filter: AutomationTriggerFilter | null | undefined, ctx: AutomationContext): boolean {
  if (!filter) return true;
  const lead = ctx.lead;
  if (filter.sources?.length && lead?.source && !filter.sources.includes(lead.source)) return false;
  if (filter.packageTiers?.length && lead?.packageTier && !filter.packageTiers.includes(lead.packageTier)) {
    return false;
  }
  return true;
}

type WorkflowRow = {
  id: string;
  triggerFilterJson: unknown;
  stepsJson: unknown;
};

export async function runAutomationWorkflow(
  workflow: WorkflowRow,
  triggerEvent: string,
  context: AutomationContext,
  log?: FastifyBaseLogger
) {
  const filter = workflow.triggerFilterJson as AutomationTriggerFilter | null;
  if (!matchesFilter(filter, context)) return;

  const steps = (workflow.stepsJson as AutomationStep[]) ?? [];
  const run = await prisma.marketingAutomationRun.create({
    data: {
      automationId: workflow.id,
      triggerEvent,
      contextJson: context as Prisma.InputJsonValue,
      status: "RUNNING"
    }
  });

  let failed: string | undefined;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step) continue;
    try {
      const result = await executeAutomationStep(step, context, log);
      await prisma.marketingAutomationLog.create({
        data: {
          runId: run.id,
          stepIndex: i,
          actionType: step.type,
          status: result.status,
          detail: result.detail
        }
      });
      if (result.status === "error") failed = result.detail ?? `erro na etapa ${i}`;
    } catch (err) {
      const detail = err instanceof Error ? err.message : "erro";
      failed = detail;
      await prisma.marketingAutomationLog.create({
        data: {
          runId: run.id,
          stepIndex: i,
          actionType: step.type,
          status: "error",
          detail
        }
      });
    }
  }

  await prisma.marketingAutomationRun.update({
    where: { id: run.id },
    data: {
      status: failed ? "FAILED" : "COMPLETED",
      error: failed,
      finishedAt: new Date()
    }
  });
}
