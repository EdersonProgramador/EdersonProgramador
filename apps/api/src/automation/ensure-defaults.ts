import { DEFAULT_MARKETING_AUTOMATION_FACTORIES } from "@ederson-agencia/shared";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";

/** Instala fluxos profissionais ausentes (por nome + trigger), sem sobrescrever edições. */
export async function ensureDefaultMarketingAutomations() {
  for (const factory of DEFAULT_MARKETING_AUTOMATION_FACTORIES) {
    const def = factory();
    const exists = await prisma.marketingAutomation.findFirst({
      where: { trigger: def.trigger, name: def.name }
    });
    if (exists) continue;
    await prisma.marketingAutomation.create({
      data: {
        name: def.name,
        description: def.description,
        enabled: def.enabled,
        trigger: def.trigger,
        triggerFilterJson: def.triggerFilter ?? undefined,
        stepsJson: def.steps as Prisma.InputJsonValue
      }
    });
  }
}
