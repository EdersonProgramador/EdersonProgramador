import { prisma } from "../prisma.js";
import { projectInclude } from "../modules/agency-project.js";

export async function linkLeadToUser(userId: string, email: string) {
  const normalized = email.trim().toLowerCase();
  const lead = await prisma.lead.findFirst({
    where: { email: normalized, userId: null },
    orderBy: { createdAt: "desc" }
  });
  if (!lead) return null;
  return prisma.lead.update({
    where: { id: lead.id },
    data: { userId, status: lead.status === "NEW" ? "QUALIFIED" : lead.status }
  });
}

export async function findLeadForClient(userId: string, email: string) {
  const normalized = email.trim().toLowerCase();
  return prisma.lead.findFirst({
    where: {
      OR: [{ userId }, { email: normalized }]
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function resolveClientFunnelState(userId: string, email: string) {
  const lead = await findLeadForClient(userId, email);
  const projects = await prisma.project.findMany({
    where: { clientId: userId },
    orderBy: { updatedAt: "desc" },
    include: projectInclude
  });

  const pendingContract = projects.find((p) => p.contractStatus === "PENDING_SIGNATURE") ?? null;
  const activeProject =
    projects.find((p) => p.status === "ACTIVE" && p.contractStatus === "SIGNED") ?? null;

  const liveOk = Boolean(lead?.liveAttended);
  const hasOpenProject = Boolean(pendingContract || activeProject);
  const canSelectPackage = liveOk && !hasOpenProject;

  return {
    lead: lead
      ? {
          id: lead.id,
          source: lead.source,
          status: lead.status,
          liveAttended: lead.liveAttended,
          packageTier: lead.packageTier
        }
      : null,
    liveOk,
    canSelectPackage,
    pendingContractProject: pendingContract,
    activeProject,
    step: !lead
      ? ("register" as const)
      : !liveOk
        ? ("live" as const)
        : pendingContract
          ? ("contract" as const)
          : activeProject
            ? ("delivery" as const)
            : ("package" as const)
  };
}
