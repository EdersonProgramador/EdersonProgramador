import { normalizeAutomationActionType } from "@ederson-agencia/shared";
import type { AutomationStep } from "@ederson-agencia/shared";
import type { FastifyBaseLogger } from "fastify";
import { prisma } from "../prisma.js";
import { env } from "../env.js";
import { notifyAdminsOfNewLead, notifyAgencyAdmins, notifyAgencyUser } from "../agency/notifications.js";
import { notifyN8nLeadWebhook } from "../integrations/n8n-lead-webhook.js";
import { upsertMarketingContactProfile } from "../marketing/cdp-contact.js";
import {
  sendSmsMessage,
  sendTransactionalMessage,
  sendWhatsAppMessage,
  syncContact,
  trackMarketingEvent
} from "../integrations/messaging/hub.js";
import { interpolateTemplate } from "./template-vars.js";
import type { AutomationContext } from "./types.js";

export async function executeAutomationStep(
  step: AutomationStep,
  ctx: AutomationContext,
  log?: FastifyBaseLogger
): Promise<{ status: "ok" | "skipped" | "error"; detail?: string }> {
  if (step.enabled === false) return { status: "skipped", detail: "etapa desativada" };

  const type = normalizeAutomationActionType(step.type);
  const cfg = { ...step.config };
  if (type === "message.send" && !cfg.provider && step.type === "email.resend") {
    cfg.provider = "resend";
  }
  if (type === "webhook.call" && step.type === "n8n.webhook") {
    cfg.preset = cfg.preset ?? "n8n_lead";
  }

  switch (type) {
    case "contact.sync": {
      const email = ctx.lead?.email ?? ctx.user?.email;
      if (email) {
        try {
          await upsertMarketingContactProfile({
            email,
            name: ctx.lead?.name ?? ctx.user?.name,
            phone: ctx.lead?.phone,
            source: ctx.lead?.source,
            packageTier: ctx.lead?.packageTier
          });
        } catch (err) {
          log?.warn({ err }, "CDP upsert falhou");
        }
      }
      const res = await syncContact(ctx, cfg, log);
      return res.skipped ? { status: "skipped", detail: res.detail } : res.ok ? { status: "ok" } : { status: "error", detail: res.detail };
    }
    case "message.send": {
      const email = ctx.lead?.email ?? ctx.user?.email;
      if (!email) return { status: "skipped", detail: "sem e-mail" };
      const subject = interpolateTemplate(String(cfg.subject ?? "Mensagem"), ctx);
      const html = interpolateTemplate(String(cfg.html ?? "<p></p>"), ctx);
      const templateId = Number(cfg.templateId ?? 0);
      const res = await sendTransactionalMessage(
        { to: email, name: ctx.lead?.name ?? ctx.user?.name, subject, html, templateId: templateId > 0 ? templateId : undefined },
        cfg,
        log
      );
      return res.skipped ? { status: "skipped", detail: res.detail } : res.ok ? { status: "ok" } : { status: "error", detail: res.detail };
    }
    case "message.sms": {
      const phone = ctx.lead?.phone ?? (ctx.meta?.phone as string | undefined);
      if (!phone?.trim()) return { status: "skipped", detail: "sem telefone" };
      const content = interpolateTemplate(String(cfg.content ?? cfg.text ?? ""), ctx);
      if (!content.trim()) return { status: "skipped", detail: "conteúdo vazio" };
      const res = await sendSmsMessage({ phone, content }, cfg, log);
      return res.skipped ? { status: "skipped", detail: res.detail } : res.ok ? { status: "ok" } : { status: "error", detail: res.detail };
    }
    case "message.whatsapp": {
      const phone = ctx.lead?.phone ?? (ctx.meta?.phone as string | undefined);
      if (!phone?.trim()) return { status: "skipped", detail: "sem telefone" };
      const text = interpolateTemplate(String(cfg.text ?? cfg.content ?? ""), ctx);
      if (!text.trim()) return { status: "skipped", detail: "texto vazio" };
      const res = await sendWhatsAppMessage(
        { phone, text, name: ctx.lead?.name ?? ctx.user?.name },
        cfg,
        log
      );
      return res.skipped ? { status: "skipped", detail: res.detail } : res.ok ? { status: "ok" } : { status: "error", detail: res.detail };
    }
    case "event.track": {
      const email = ctx.lead?.email ?? ctx.user?.email;
      if (!email) return { status: "skipped", detail: "sem e-mail" };
      const eventName = String(cfg.eventName ?? "custom_event");
      const res = await trackMarketingEvent(
        {
          email,
          eventName,
          props: {
            lead_id: ctx.lead?.id,
            project_id: ctx.project?.id,
            source: ctx.lead?.source,
            package: ctx.lead?.packageTier
          }
        },
        cfg,
        log
      );
      return res.skipped ? { status: "skipped", detail: res.detail } : res.ok ? { status: "ok" } : { status: "error", detail: res.detail };
    }
    case "webhook.call": {
      const preset = String(cfg.preset ?? "");
      const customUrl = String(cfg.url ?? "").trim();
      if (preset === "n8n_lead" || !customUrl) {
        if (!ctx.lead) return { status: "skipped", detail: "apenas com lead" };
        void notifyN8nLeadWebhook(
          {
            id: ctx.lead.id,
            name: ctx.lead.name,
            email: ctx.lead.email,
            phone: ctx.lead.phone,
            source: ctx.lead.source ?? null,
            packageTier: ctx.lead.packageTier ?? null,
            message: ctx.lead.message ?? "",
            createdAt: new Date()
          },
          log
        );
        return env.N8N_LEAD_WEBHOOK_URL ? { status: "ok" } : { status: "skipped", detail: "N8N_LEAD_WEBHOOK_URL ausente" };
      }
      try {
        const res = await fetch(customUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trigger: ctx, at: new Date().toISOString() }),
          signal: AbortSignal.timeout(12_000)
        });
        if (!res.ok) return { status: "error", detail: (await res.text()).slice(0, 300) };
        return { status: "ok" };
      } catch (err) {
        return { status: "error", detail: err instanceof Error ? err.message : "webhook falhou" };
      }
    }
    case "notify.admins": {
      const title = interpolateTemplate(String(cfg.title ?? "Evento"), ctx);
      const body = interpolateTemplate(String(cfg.body ?? ""), ctx);
      if (ctx.lead) {
        void notifyAdminsOfNewLead(
          {
            name: ctx.lead.name,
            email: ctx.lead.email,
            source: ctx.lead.source ?? null,
            packageTier: ctx.lead.packageTier ?? null
          },
          log
        );
        return { status: "ok", detail: title };
      }
      void notifyAgencyAdmins({ kind: "automation", title, body, projectId: ctx.project?.id }, log);
      return { status: "ok" };
    }
    case "notify.user": {
      const userId = ctx.user?.id ?? ctx.project?.clientId;
      if (!userId) return { status: "skipped", detail: "sem usuário" };
      const title = interpolateTemplate(String(cfg.title ?? "Atualização"), ctx);
      const body = interpolateTemplate(String(cfg.body ?? ""), ctx);
      await notifyAgencyUser({
        userId,
        projectId: ctx.project?.id,
        kind: "automation",
        title,
        body
      });
      return { status: "ok" };
    }
    case "lead.set_status": {
      if (!ctx.lead?.id || ctx.lead.id.startsWith("test-")) return { status: "skipped", detail: "sem lead real" };
      const status = String(cfg.status ?? "QUALIFIED");
      await prisma.lead.update({ where: { id: ctx.lead.id }, data: { status } });
      return { status: "ok", detail: status };
    }
    default:
      return { status: "skipped", detail: `ação desconhecida: ${type}` };
  }
}
