import type { AutomationTriggerId } from "@ederson-agencia/shared";
import type { FastifyBaseLogger } from "fastify";
import { prisma } from "../prisma.js";
import { runAutomationWorkflow } from "./runner.js";
import type { AutomationContext } from "./types.js";

/** Dispara todos os fluxos ativos para o trigger (não bloqueia a requisição HTTP). */
export function dispatchAutomationEvent(
  trigger: AutomationTriggerId,
  context: AutomationContext,
  log?: FastifyBaseLogger
) {
  void (async () => {
    try {
      const workflows = await prisma.marketingAutomation.findMany({
        where: { enabled: true, trigger }
      });
      for (const wf of workflows) {
        await runAutomationWorkflow(wf, trigger, context, log);
      }
    } catch (err) {
      log?.warn({ err, trigger }, "dispatchAutomationEvent falhou");
    }
  })();
}
