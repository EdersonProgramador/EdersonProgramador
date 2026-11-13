/**
 * Automação de marketing — triggers + etapas no seu sistema.
 * Provedores externos (Brevo, Resend, n8n, Leadlovers, etc.) são plugáveis por ação.
 */

export const MESSAGING_CONTACT_PROVIDERS = ["auto", "brevo", "leadlovers", "webhook", "none"] as const;
export const MESSAGING_EMAIL_PROVIDERS = ["auto", "resend", "brevo", "smtp", "none"] as const;
export const MESSAGING_EVENT_PROVIDERS = ["auto", "brevo", "webhook", "none"] as const;

export type MessagingContactProvider = (typeof MESSAGING_CONTACT_PROVIDERS)[number];
export type MessagingEmailProvider = (typeof MESSAGING_EMAIL_PROVIDERS)[number];
export type MessagingEventProvider = (typeof MESSAGING_EVENT_PROVIDERS)[number];

export const AUTOMATION_TRIGGER_IDS = [
  "lead.created",
  "lead.popup",
  "client.hired",
  "contract.signed",
  "checkout.completed",
  "upgrade.requested",
  "upgrade.resolved",
  "webhook.purchase",
  "phase.updated",
  "deliverable.done",
  "manual.test"
] as const;

export type AutomationTriggerId = (typeof AUTOMATION_TRIGGER_IDS)[number];

/** IDs canônicos (agnósticos de fornecedor). */
export const AUTOMATION_ACTION_IDS = [
  "contact.sync",
  "message.send",
  "message.sms",
  "message.whatsapp",
  "event.track",
  "webhook.call",
  "notify.admins",
  "notify.user",
  "lead.set_status",
  /** @deprecated compatibilidade — mapeados no executor */
  "brevo.upsert_contact",
  "brevo.send_transactional",
  "brevo.track_event",
  "email.resend",
  "n8n.webhook"
] as const;

export type AutomationActionId = (typeof AUTOMATION_ACTION_IDS)[number];

export type AutomationStep = {
  id: string;
  type: AutomationActionId;
  enabled?: boolean;
  config: Record<string, unknown>;
};

export type AutomationTriggerFilter = {
  sources?: string[];
  packageTiers?: string[];
};

export type MarketingAutomationDto = {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  trigger: AutomationTriggerId;
  triggerFilter: AutomationTriggerFilter | null;
  steps: AutomationStep[];
  updatedAt: string;
};

/** Equivalentes de mercado (Brevo é só um exemplo entre vários). */
export const MARKETING_INTEGRATION_CATALOG = [
  { role: "Contatos / listas", examples: "Brevo, Mailchimp, ActiveCampaign, RD Station, Leadlovers" },
  { role: "E-mail transacional", examples: "Resend, Brevo, SendGrid, Amazon SES, Postmark" },
  { role: "Orquestração", examples: "n8n, Make, Zapier, webhooks custom" },
  { role: "CRM / vendas", examples: "Seu Prisma (leads/projetos), Pipedrive, HubSpot (via webhook)" },
  { role: "Eventos / CDP", examples: "Brevo events, Segment, pixel + webhook próprio" }
] as const;

export const MARKETING_CAPABILITY_MATRIX = [
  {
    pillar: "Campanhas e automação",
    inApp: "Editor de fluxos, triggers, filtros e histórico",
    external: "Campanhas pesadas podem ficar no provedor escolhido (API + webhook)"
  },
  {
    pillar: "Mensagens transacionais",
    inApp: "Ação message.send com provider auto/resend/brevo",
    external: "SMTP/API do fornecedor configurado no ambiente"
  },
  {
    pillar: "Gestão de vendas",
    inApp: "Leads, projetos, funil — fonte da verdade interna",
    external: "contact.sync espelha contatos no provedor"
  },
  {
    pillar: "Canais",
    inApp: "E-mail, webhook, notificação in-app",
    external: "SMS/WhatsApp/chat conforme conta do provedor"
  }
] as const;

/** @deprecated use MARKETING_CAPABILITY_MATRIX */
export const BREVO_CAPABILITY_MATRIX = MARKETING_CAPABILITY_MATRIX;

export const AUTOMATION_TRIGGER_OPTIONS: ReadonlyArray<{ id: AutomationTriggerId; label: string; hint: string }> = [
  { id: "lead.created", label: "Lead criado", hint: "Landing, academia, LP PPL" },
  { id: "lead.popup", label: "Lead popup", hint: "Captura rápida do funil" },
  { id: "client.hired", label: "Contratação (funil)", hint: "Cliente escolhe pacote" },
  { id: "contract.signed", label: "Contrato assinado", hint: "Assinatura digital" },
  { id: "checkout.completed", label: "Checkout concluído", hint: "Projeto ativado" },
  { id: "upgrade.requested", label: "Upgrade solicitado", hint: "Cliente pede pacote maior" },
  { id: "upgrade.resolved", label: "Upgrade analisado", hint: "Admin aprova ou recusa" },
  { id: "webhook.purchase", label: "Venda (webhook)", hint: "Hotmart, Kiwify, etc." },
  { id: "phase.updated", label: "Etapa do projeto", hint: "Mudança de status" },
  { id: "deliverable.done", label: "Entregável concluído", hint: "Equipe marca como feito" },
  { id: "manual.test", label: "Teste manual", hint: "Disparo pelo admin" }
];

export const AUTOMATION_ACTION_OPTIONS: ReadonlyArray<{
  id: AutomationActionId;
  label: string;
  category: "mensageria" | "integracao" | "crm" | "app";
  defaultConfig: Record<string, unknown>;
}> = [
  {
    id: "contact.sync",
    label: "Sincronizar contato (provedor configurável)",
    category: "mensageria",
    defaultConfig: { provider: "auto" as MessagingContactProvider, listIds: [] as number[] }
  },
  {
    id: "message.send",
    label: "Enviar mensagem (e-mail transacional)",
    category: "mensageria",
    defaultConfig: {
      provider: "auto" as MessagingEmailProvider,
      subject: "Recebemos seu contato",
      html: "<p>Olá {{FIRSTNAME}},</p><p>Obrigado pelo interesse.</p>",
      templateId: 0
    }
  },
  {
    id: "message.sms",
    label: "Enviar SMS",
    category: "mensageria",
    defaultConfig: { provider: "auto", content: "Olá {{FIRSTNAME}}, recebemos seu contato. — Ederson Agência" }
  },
  {
    id: "message.whatsapp",
    label: "Enviar WhatsApp (webhook)",
    category: "mensageria",
    defaultConfig: { provider: "auto", text: "Olá {{FIRSTNAME}}, obrigado pelo contato." }
  },
  {
    id: "event.track",
    label: "Registrar evento de marketing",
    category: "mensageria",
    defaultConfig: { provider: "auto" as MessagingEventProvider, eventName: "lead_captured" }
  },
  {
    id: "webhook.call",
    label: "Chamar webhook (n8n, Make, URL custom)",
    category: "integracao",
    defaultConfig: { preset: "n8n_lead", url: "" }
  },
  {
    id: "notify.admins",
    label: "App — notificar administradores",
    category: "app",
    defaultConfig: { title: "Novo evento", body: "Verifique o painel." }
  },
  {
    id: "notify.user",
    label: "App — notificar usuário",
    category: "app",
    defaultConfig: { title: "Atualização", body: "Há novidades no seu projeto." }
  },
  {
    id: "lead.set_status",
    label: "CRM — atualizar status do lead",
    category: "crm",
    defaultConfig: { status: "QUALIFIED" }
  }
];

export function defaultLeadCaptureAutomation(): Omit<MarketingAutomationDto, "id" | "updatedAt"> {
  return {
    name: "Funil — lead capturado",
    description: "Contato, evento, e-mail, webhook e notificação interna — provedores via AUTO.",
    enabled: true,
    trigger: "lead.created",
    triggerFilter: null,
    steps: [
      { id: "s1", type: "contact.sync", enabled: true, config: { provider: "auto", listIds: [] } },
      { id: "s2", type: "event.track", enabled: true, config: { provider: "auto", eventName: "lead_captured" } },
      {
        id: "s3",
        type: "message.send",
        enabled: true,
        config: {
          provider: "auto",
          subject: "Recebemos seu interesse — Ederson Programador",
          html: "<p>Olá {{FIRSTNAME}},</p><p>Recebemos seu pedido. Em breve nossa equipe retorna com o próximo passo.</p>"
        }
      },
      { id: "s4", type: "webhook.call", enabled: true, config: { preset: "n8n_lead" } },
      { id: "s5", type: "notify.admins", enabled: true, config: { title: "Novo lead", body: "{{LEAD_NAME}} · {{LEAD_EMAIL}}" } }
    ]
  };
}

export function defaultLeadPopupAutomation(): Omit<MarketingAutomationDto, "id" | "updatedAt"> {
  return {
    name: "Popup — captura rápida",
    description: "Mesmo fluxo do lead, trigger específico do popup.",
    enabled: true,
    trigger: "lead.popup",
    triggerFilter: null,
    steps: defaultLeadCaptureAutomation().steps
  };
}

export function defaultClientHiredAutomation(): Omit<MarketingAutomationDto, "id" | "updatedAt"> {
  return {
    name: "Contratação — pacote escolhido",
    description: "CDP, e-mail de boas-vindas e notificação interna após hire no funil.",
    enabled: true,
    trigger: "client.hired",
    triggerFilter: null,
    steps: [
      { id: "h1", type: "contact.sync", enabled: true, config: { provider: "auto" } },
      {
        id: "h2",
        type: "message.send",
        enabled: true,
        config: {
          provider: "auto",
          subject: "Próximo passo: contrato — {{PROJECT_TITLE}}",
          html: "<p>Olá {{FIRSTNAME}},</p><p>Você escolheu o pacote {{PACKAGE_TIER}}. Assine o contrato na área do cliente para liberar o checkout.</p>"
        }
      },
      {
        id: "h3",
        type: "notify.admins",
        enabled: true,
        config: { title: "Contratação no funil", body: "{{USER_EMAIL}} · {{PACKAGE_TIER}}" }
      },
      { id: "h4", type: "event.track", enabled: true, config: { provider: "auto", eventName: "client_hired" } }
    ]
  };
}

export function defaultContractSignedAutomation(): Omit<MarketingAutomationDto, "id" | "updatedAt"> {
  return {
    name: "Contrato assinado",
    description: "Confirmação ao cliente e evento de marketing.",
    enabled: true,
    trigger: "contract.signed",
    triggerFilter: null,
    steps: [
      {
        id: "c1",
        type: "message.send",
        enabled: true,
        config: {
          provider: "auto",
          subject: "Contrato recebido — siga para o checkout",
          html: "<p>Olá {{FIRSTNAME}},</p><p>Registramos a assinatura. Conclua o checkout (entrada) para iniciar a jornada de desenvolvimento.</p>"
        }
      },
      {
        id: "c2",
        type: "notify.user",
        enabled: true,
        config: { title: "Contrato OK", body: "Checkout liberado no seu painel." }
      },
      { id: "c3", type: "event.track", enabled: true, config: { provider: "auto", eventName: "contract_signed" } }
    ]
  };
}

export function defaultCheckoutCompletedAutomation(): Omit<MarketingAutomationDto, "id" | "updatedAt"> {
  return {
    name: "Checkout concluído",
    description: "Boas-vindas à jornada ativa + evento.",
    enabled: true,
    trigger: "checkout.completed",
    triggerFilter: null,
    steps: [
      {
        id: "k1",
        type: "message.send",
        enabled: true,
        config: {
          provider: "auto",
          subject: "Jornada liberada — {{PROJECT_TITLE}}",
          html: "<p>Olá {{FIRSTNAME}},</p><p>Pagamento registrado. Acompanhe as etapas do projeto na área do cliente.</p>"
        }
      },
      {
        id: "k2",
        type: "notify.admins",
        enabled: true,
        config: { title: "Projeto ativo", body: "{{PROJECT_TITLE}} — cliente em produção." }
      },
      { id: "k3", type: "event.track", enabled: true, config: { provider: "auto", eventName: "checkout_completed" } }
    ]
  };
}

/** Pacote completo de fluxos padrão (instalação profissional). */
export const DEFAULT_MARKETING_AUTOMATION_FACTORIES = [
  defaultLeadCaptureAutomation,
  defaultLeadPopupAutomation,
  defaultClientHiredAutomation,
  defaultContractSignedAutomation,
  defaultCheckoutCompletedAutomation
] as const;

/** Normaliza tipos legados salvos no banco. */
export function normalizeAutomationActionType(type: string): AutomationActionId {
  const map: Record<string, AutomationActionId> = {
    "brevo.upsert_contact": "contact.sync",
    "brevo.send_transactional": "message.send",
    "brevo.track_event": "event.track",
    "email.resend": "message.send",
    "n8n.webhook": "webhook.call"
  };
  if (map[type]) return map[type];
  if ((AUTOMATION_ACTION_IDS as readonly string[]).includes(type)) return type as AutomationActionId;
  return "webhook.call";
}
