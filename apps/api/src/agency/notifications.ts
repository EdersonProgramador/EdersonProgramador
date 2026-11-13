import type { FastifyBaseLogger } from "fastify";
import { packageTierLabel, parsePackageTier } from "@ederson-agencia/shared";
import { prisma } from "../prisma.js";

export type AgencyNotificationInput = {
  projectId?: string;
  kind: string;
  title: string;
  body: string;
};

export async function notifyAgencyUser(input: AgencyNotificationInput & { userId: string }) {
  return prisma.agencyNotification.create({
    data: {
      userId: input.userId,
      projectId: input.projectId,
      kind: input.kind,
      title: input.title,
      body: input.body
    }
  });
}

export async function listActiveAdminIds() {
  const rows = await prisma.user.findMany({
    where: { role: "ADMIN", status: "ACTIVE" },
    select: { id: true }
  });
  return rows.map((r) => r.id);
}

export async function notifyAgencyAdmins(input: AgencyNotificationInput, log?: FastifyBaseLogger) {
  const adminIds = await listActiveAdminIds();
  await Promise.all(
    adminIds.map(async (userId) => {
      try {
        await notifyAgencyUser({ ...input, userId });
      } catch (err) {
        log?.warn({ err, userId, kind: input.kind }, "Falha ao notificar administrador");
      }
    })
  );
}

export function leadNotificationPayload(lead: {
  name: string;
  email: string;
  source: string | null;
  packageTier: string | null;
}): AgencyNotificationInput {
  const tier = parsePackageTier(lead.packageTier ?? undefined);
  const tierLabel = tier ? packageTierLabel(tier) : null;
  const origin = lead.source?.replace(/_/g, " ") ?? "site";
  return {
    kind: "lead",
    title: "Novo lead recebido",
    body: `${lead.name} · ${lead.email}${tierLabel ? ` · ${tierLabel}` : ""} · ${origin}`
  };
}

export async function notifyAdminsOfNewLead(
  lead: {
    name: string;
    email: string;
    source: string | null;
    packageTier: string | null;
  },
  log?: FastifyBaseLogger
) {
  await notifyAgencyAdmins(leadNotificationPayload(lead), log);
}

export async function unreadNotificationCount(userId: string) {
  return prisma.agencyNotification.count({
    where: { userId, readAt: null }
  });
}

export async function listUnreadNotifications(userId: string, limit = 20) {
  return prisma.agencyNotification.findMany({
    where: { userId, readAt: null },
    orderBy: { createdAt: "desc" },
    take: limit
  });
}

export async function listRecentNotifications(userId: string, limit = 30) {
  return prisma.agencyNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit
  });
}
