import {
  JOURNEY_PHASES,
  PACKAGE_TIER_CONFIG,
  deliverablesForTierPhase,
  entryValueCentsForTier,
  parsePackageTier,
  type JourneyPhaseKey,
  type PackageTierId
} from "@ederson-agencia/shared";
import { prisma } from "../prisma.js";

export function resolvePackageTier(value: unknown, fallback: PackageTierId = "professional"): PackageTierId {
  return parsePackageTier(value) ?? fallback;
}

export async function createProjectFromPackage(
  clientId: string,
  title: string,
  tier: PackageTierId,
  description?: string
) {
  const cfg = PACKAGE_TIER_CONFIG[tier];
  const phasesData = JOURNEY_PHASES.map((phase, index) => {
    const labels = deliverablesForTierPhase(tier, phase.key);
    return {
      phaseKey: phase.key,
      label: phase.label,
      sortOrder: index,
      daysPlanned: phase.daysPlanned,
      status: index === 0 ? "IN_PROGRESS" : "PENDING",
      deliverables: {
        create: labels.map((label, sortOrder) => ({
          label,
          sortOrder,
          status: "PENDING"
        }))
      }
    };
  });

  return prisma.project.create({
    data: {
      title,
      description,
      clientId,
      packageTier: tier,
      status: "ACTIVE",
      totalValueCents: cfg.totalValueCents,
      entryValueCents: entryValueCentsForTier(tier),
      phases: { create: phasesData }
    },
    include: projectInclude
  });
}

export const projectInclude = {
  phases: {
    orderBy: { sortOrder: "asc" as const },
    include: { deliverables: { orderBy: { sortOrder: "asc" as const } } }
  },
  client: { select: { id: true, name: true, email: true, company: true } },
  freelancer: { select: { id: true, name: true, email: true } },
  upgradeRequests: { orderBy: { createdAt: "desc" as const }, take: 5 }
};

export async function appendTierDeliverables(projectId: string, tier: PackageTierId) {
  const phases = await prisma.projectPhase.findMany({
    where: { projectId },
    include: { deliverables: true }
  });

  for (const phase of phases) {
    const phaseKey = phase.phaseKey as JourneyPhaseKey;
    const wanted = deliverablesForTierPhase(tier, phaseKey);
    const existing = new Set(phase.deliverables.map((d) => d.label));
    const toAdd = wanted.filter((label) => !existing.has(label));
    if (toAdd.length === 0) continue;
    const baseOrder = phase.deliverables.length;
    await prisma.projectPhaseDeliverable.createMany({
      data: toAdd.map((label, i) => ({
        phaseId: phase.id,
        label,
        sortOrder: baseOrder + i,
        status: "PENDING"
      }))
    });
  }
}

export async function applyApprovedUpgrade(projectId: string, toTier: PackageTierId) {
  const cfg = PACKAGE_TIER_CONFIG[toTier];
  await prisma.project.update({
    where: { id: projectId },
    data: {
      packageTier: toTier,
      totalValueCents: cfg.totalValueCents,
      entryValueCents: entryValueCentsForTier(toTier)
    }
  });
  await appendTierDeliverables(projectId, toTier);
}
