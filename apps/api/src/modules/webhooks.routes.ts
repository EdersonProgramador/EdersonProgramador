import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma.js";
import {
  inferWebhookEventType,
  isPurchaseLikeEvent,
  type WebhookProviderId
} from "../agency/webhook-ingress.js";
import { notifyAgencyUser } from "../agency/notifications.js";
import { loadProjectWorkspace } from "../agency/project-workspace-persist.js";
import { verifyInboundWebhookAuth } from "../agency/webhook-auth.js";

const providerSchema = z.enum(["hotmart", "kiwify", "monetizze", "leadlovers"]);

export async function registerInboundWebhookRoutes(app: FastifyInstance) {
  app.post("/public/webhooks/:provider/:ingressToken", async (request, reply) => {
    const params = z
      .object({
        provider: providerSchema,
        ingressToken: z.string().min(20).max(80)
      })
      .parse(request.params);

    const project = await prisma.project.findFirst({
      where: { webhookIngressToken: params.ingressToken },
      select: {
        id: true,
        title: true,
        clientId: true,
        projectWorkspaceJson: true,
        brandingWorkspaceJson: true,
        launchOpCheckedJson: true
      }
    });
    if (!project) {
      return reply.code(404).send({ message: "Webhook não reconhecido." });
    }

    const body = request.body ?? {};
    const workspace = loadProjectWorkspace(project);
    const auth = verifyInboundWebhookAuth({
      provider: params.provider as WebhookProviderId,
      fields: workspace.fields,
      body,
      headers: request.headers as Record<string, string | string[] | undefined>
    });
    if (!auth.ok) {
      return reply.code(401).send({ message: "Assinatura do webhook inválida.", reason: auth.reason });
    }
    const eventType = inferWebhookEventType(params.provider as WebhookProviderId, body);

    const event = await prisma.projectExternalEvent.create({
      data: {
        projectId: project.id,
        provider: params.provider,
        eventType,
        payloadJson: body as object
      }
    });

    if (isPurchaseLikeEvent(eventType)) {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN", status: "ACTIVE" },
        select: { id: true }
      });
      for (const admin of admins) {
        await notifyAgencyUser({
          userId: admin.id,
          projectId: project.id,
          kind: "webhook_purchase",
          title: `Venda (${params.provider}) — ${project.title}`,
          body: `Evento ${eventType} registrado no workspace do projeto.`
        });
      }
    }

    return { received: true, eventId: event.id, eventType };
  });
}
