import { randomBytes } from "node:crypto";
import { prisma } from "../prisma.js";

export function generateWebhookIngressToken(): string {
  return `wh_${randomBytes(24).toString("hex")}`;
}

export async function ensureProjectWebhookToken(projectId: string): Promise<string> {
  const row = await prisma.project.findUnique({
    where: { id: projectId },
    select: { webhookIngressToken: true }
  });
  if (!row) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
  if (row.webhookIngressToken) return row.webhookIngressToken;
  const token = generateWebhookIngressToken();
  await prisma.project.update({
    where: { id: projectId },
    data: { webhookIngressToken: token }
  });
  return token;
}

export type WebhookProviderId = "hotmart" | "kiwify" | "monetizze" | "leadlovers";

export function inferWebhookEventType(provider: WebhookProviderId, body: unknown): string {
  if (body == null || typeof body !== "object") return `${provider}.unknown`;
  const b = body as Record<string, unknown>;
  switch (provider) {
    case "hotmart":
      return String(b.event ?? b.status ?? "hotmart.event");
    case "kiwify":
      return String(b.order_status ?? b.type ?? b.event ?? "kiwify.event");
    case "monetizze":
      return String(b.tipo ?? b.event ?? b.status ?? "monetizze.event");
    case "leadlovers":
      return String(b.event ?? b.action ?? "leadlovers.event");
    default:
      return "unknown";
  }
}

export function isPurchaseLikeEvent(eventType: string): boolean {
  const t = eventType.toLowerCase();
  return (
    t.includes("purchase") ||
    t.includes("approved") ||
    t.includes("paid") ||
    t.includes("compra") ||
    t.includes("aprovad")
  );
}
