import { prisma } from "../prisma.js";
import { funnelConfigPublicDto, getAgencyFunnelConfigRow, resolveFunnelPackages } from "./funnel-config.js";
import { listRecentNotifications, listUnreadNotifications } from "./notifications.js";
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

/** Conta cliente + inscrição lançamento (mesmo e-mail) → lead único no funil interno. */
export async function ensureClientFunnelLead(userId: string, email: string, name: string) {
  const normalized = email.trim().toLowerCase();
  await linkLeadToUser(userId, normalized);

  let lead = await findLeadForClient(userId, normalized);
  if (lead && !lead.userId) {
    lead = await prisma.lead.update({
      where: { id: lead.id },
      data: { userId, status: lead.status === "NEW" ? "QUALIFIED" : lead.status }
    });
    return lead;
  }
  if (lead) return lead;

  return prisma.lead.create({
    data: {
      name: name.trim() || normalized,
      email: normalized,
      message: "[Funil] Cliente com conta — funil interno de contratação.",
      source: "portal",
      userId,
      status: "QUALIFIED"
    }
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

export async function resolveClientFunnelState(userId: string, email: string, name: string) {
  const lead = await ensureClientFunnelLead(userId, email, name);
  const projects = await prisma.project.findMany({
    where: { clientId: userId },
    orderBy: { updatedAt: "desc" },
    include: projectInclude
  });

  const pendingContract = projects.find((p) => p.contractStatus === "PENDING_SIGNATURE") ?? null;
  const awaitingCheckout =
    projects.find((p) => p.contractStatus === "SIGNED" && p.status === "AWAITING_CHECKOUT") ?? null;
  const activeProject =
    projects.find((p) => p.status === "ACTIVE" && p.contractStatus === "SIGNED") ?? null;

  const liveOk = Boolean(lead?.liveAttended);
  const blockingProject = Boolean(pendingContract || awaitingCheckout || activeProject);
  const canSelectPackage = liveOk && !blockingProject;

  const configRow = await getAgencyFunnelConfigRow();
  const config = funnelConfigPublicDto(configRow);
  const tiers = resolveFunnelPackages(configRow);

  let step: "live" | "package" | "contract" | "checkout" | "delivery" = "live";
  if (activeProject) step = "delivery";
  else if (awaitingCheckout) step = "checkout";
  else if (pendingContract) step = "contract";
  else if (liveOk) step = "package";

  const [unreadNotifications, notifications] = await Promise.all([
    listUnreadNotifications(userId, 10),
    listRecentNotifications(userId, 15)
  ]);

  return {
    config,
    tiers,
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
    awaitingCheckoutProject: awaitingCheckout,
    activeProject,
    deliveryProgress: activeProject
      ? {
          projectId: activeProject.id,
          phases: activeProject.phases.map((ph) => ({
            id: ph.id,
            phaseKey: ph.phaseKey,
            label: ph.label,
            status: ph.status,
            sortOrder: ph.sortOrder,
            deliverablesDone: ph.deliverables.filter((d) => d.status === "DONE").length,
            deliverablesTotal: ph.deliverables.length
          }))
        }
      : null,
    unreadNotificationCount: unreadNotifications.length,
    notifications,
    step
  };
}
