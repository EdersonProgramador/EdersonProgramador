import { prisma } from "../prisma.js";

export async function notifyAgencyUser(input: {
  userId: string;
  projectId?: string;
  kind: string;
  title: string;
  body: string;
}) {
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
