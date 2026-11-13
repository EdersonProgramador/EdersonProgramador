import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";

type LoyaltyRules = {
  pointsPerCheckout?: number;
  pointsPerReferral?: number;
};

export async function getLoyaltyRules(): Promise<LoyaltyRules> {
  const row = await prisma.loyaltyProgramConfig.findUnique({ where: { id: "default" } });
  if (!row?.rulesJson || typeof row.rulesJson !== "object") return { pointsPerCheckout: 100, pointsPerReferral: 50 };
  return row.rulesJson as LoyaltyRules;
}

export async function awardLoyaltyPoints(input: {
  email: string;
  name?: string | null;
  points: number;
  reason: string;
}) {
  const config = await prisma.loyaltyProgramConfig.findUnique({ where: { id: "default" } });
  if (!config?.enabled || input.points <= 0) return;

  const email = input.email.trim().toLowerCase();
  const existing = await prisma.marketingContactProfile.findUnique({ where: { email } });
  const attrs = (existing?.attributesJson as Record<string, unknown> | null) ?? {};
  const current = Number(attrs.loyaltyPoints ?? 0);
  const next = current + input.points;
  const history = Array.isArray(attrs.loyaltyHistory) ? [...(attrs.loyaltyHistory as object[])] : [];
  history.push({ at: new Date().toISOString(), points: input.points, reason: input.reason, total: next });

  const sources = new Set<string>(Array.isArray(existing?.sourcesJson) ? (existing.sourcesJson as string[]) : []);
  sources.add("loyalty");

  await prisma.marketingContactProfile.upsert({
    where: { email },
    create: {
      email,
      name: input.name?.trim() ?? null,
      attributesJson: { loyaltyPoints: next, loyaltyHistory: history.slice(-50) } as Prisma.InputJsonValue,
      sourcesJson: [...sources] as Prisma.InputJsonValue,
      lastEventAt: new Date()
    },
    update: {
      name: input.name?.trim() ?? existing?.name,
      attributesJson: {
        ...attrs,
        loyaltyPoints: next,
        loyaltyHistory: history.slice(-50)
      } as Prisma.InputJsonValue,
      sourcesJson: [...sources] as Prisma.InputJsonValue,
      lastEventAt: new Date()
    }
  });
}

export async function onCheckoutLoyalty(email: string, name?: string | null) {
  const rules = await getLoyaltyRules();
  const points = rules.pointsPerCheckout ?? 100;
  await awardLoyaltyPoints({ email, name, points, reason: "checkout.completed" });
}
