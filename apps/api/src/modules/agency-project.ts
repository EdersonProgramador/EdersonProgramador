import {
  AGENCY_CONTRACT_VERSION,
  JOURNEY_PHASES,
  PACKAGE_TIER_CONFIG,
  composeAgencyContractDocument,
  contractDocumentToPlainText,
  contractKindForTier,
  contractSummaryForTier,
  deliverablesForTierPhase,
  legalNameFromPartyDetails,
  sanitizeContractCompany,
  type AgencyContractPartyDetails,
  entryValueCentsForTier,
  parsePackageTier,
  type AgencyContractPartySnapshot,
  type JourneyPhaseKey,
  type PackageTierId
} from "@ederson-agencia/shared";
import { prisma } from "../prisma.js";

export function resolvePackageTier(value: unknown, fallback: PackageTierId = "professional"): PackageTierId {
  return parsePackageTier(value) ?? fallback;
}

export type ProjectActivationMode = "await_contract" | "immediate";

export async function createProjectFromPackage(
  clientId: string,
  title: string,
  tier: PackageTierId,
  description?: string,
  activation: ProjectActivationMode = "await_contract"
) {
  const cfg = PACKAGE_TIER_CONFIG[tier];
  const immediate = activation === "immediate";
  const phasesData = JOURNEY_PHASES.map((phase, index) => {
    const labels = deliverablesForTierPhase(tier, phase.key);
    return {
      phaseKey: phase.key,
      label: phase.label,
      sortOrder: index,
      daysPlanned: phase.daysPlanned,
      status: immediate && index === 0 ? "IN_PROGRESS" : "PENDING",
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
      status: immediate ? "ACTIVE" : "DRAFT",
      contractStatus: immediate ? "SIGNED" : "PENDING_SIGNATURE",
      contractSignedAt: immediate ? new Date() : null,
      contractVersion: "app-zero-v1",
      totalValueCents: cfg.totalValueCents,
      entryValueCents: entryValueCentsForTier(tier),
      phases: { create: phasesData }
    },
    include: projectInclude
  });
}

export async function recordContractSignature(
  projectId: string,
  partyDetails: AgencyContractPartyDetails,
  options?: { clauses?: string[]; intro?: string | null }
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
  if (project.contractStatus === "SIGNED") {
    throw Object.assign(new Error("Contrato já assinado."), { statusCode: 409 });
  }

  const tier = parsePackageTier(project.packageTier) ?? "professional";
  const summary = contractSummaryForTier(tier);
  const signedAt = new Date();
  const legalName = legalNameFromPartyDetails(partyDetails);
  const email = partyDetails.email.trim().toLowerCase();
  const company =
    partyDetails.kind === "pj"
      ? sanitizeContractCompany(partyDetails.corporateName)
      : null;
  const phone = partyDetails.phone?.trim() || null;
  const contractVersion = project.contractVersion || AGENCY_CONTRACT_VERSION;
  const contractKind = contractKindForTier(tier);

  const clauses =
    options?.clauses?.length ? options.clauses : summary.clauses;

  const document = composeAgencyContractDocument({
    contractKind,
    packageTier: tier,
    partyDetails,
    packageLabel: summary.tierLabel,
    totalValueCents: project.totalValueCents,
    entryValueCents: project.entryValueCents,
    phasesSummary: summary.phasesSummary,
    contractVersion,
    intro: options?.intro,
    clauses
  });

  const snapshot: AgencyContractPartySnapshot = {
    legalName,
    email,
    company,
    phone,
    contractKind,
    partyDetails,
    contractVersion,
    packageTier: tier,
    packageLabel: summary.tierLabel,
    totalValueCents: project.totalValueCents,
    entryValueCents: project.entryValueCents,
    phasesSummary: summary.phasesSummary,
    signedAt: signedAt.toISOString(),
    documentPlain: contractDocumentToPlainText(document)
  };

  return prisma.project.update({
    where: { id: projectId },
    data: {
      contractStatus: "SIGNED",
      contractSignedAt: signedAt,
      contractAcceptedName: snapshot.legalName,
      contractPartyJson: snapshot,
      status: "AWAITING_CHECKOUT",
      paymentStatus: "PENDING"
    },
    include: projectInclude
  });
}

export async function activateProjectAfterCheckout(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { phases: true } });
  if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
  if (project.contractStatus !== "SIGNED") {
    throw Object.assign(new Error("Assine o contrato antes do checkout."), { statusCode: 400 });
  }
  if (project.status === "ACTIVE") {
    throw Object.assign(new Error("Projeto já ativo."), { statusCode: 409 });
  }

  const firstPhase = project.phases.sort((a, b) => a.sortOrder - b.sortOrder)[0];

  return prisma.$transaction(async (tx) => {
    if (firstPhase) {
      await tx.projectPhase.update({
        where: { id: firstPhase.id },
        data: { status: "IN_PROGRESS" }
      });
    }
    return tx.project.update({
      where: { id: projectId },
      data: {
        status: "ACTIVE",
        paymentStatus: "PARTIAL"
      },
      include: projectInclude
    });
  });
}

/** @deprecated use recordContractSignature + activateProjectAfterCheckout */
export async function activateProjectAfterContract(
  projectId: string,
  partyDetails: AgencyContractPartyDetails
) {
  await recordContractSignature(projectId, partyDetails);
  return activateProjectAfterCheckout(projectId);
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
