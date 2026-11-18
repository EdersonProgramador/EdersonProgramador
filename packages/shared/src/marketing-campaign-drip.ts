/** Campanhas de aquisição / remarketing / follow-up com sequência por data. */

export const MARKETING_CAMPAIGN_KINDS = [
  {
    id: "ACQUISITION",
    label: "Aquisição",
    description: "Primeiro contato — nutrir leads novos na base.",
    level: "FIRST_CONTACT"
  },
  {
    id: "REMARKETING",
    label: "Re-marketing",
    description: "Quem já esteve na base e ainda não converteu.",
    level: "REMARKETING"
  },
  {
    id: "FOLLOW_UP",
    label: "Follow-up",
    description: "Acompanhamento após contato comercial ou diagnóstico.",
    level: "FOLLOW_UP"
  },
  {
    id: "BLAST",
    label: "Disparo avulso",
    description: "Envio único (sem sequência).",
    level: "ALL"
  }
] as const;

export type MarketingCampaignKind = (typeof MARKETING_CAMPAIGN_KINDS)[number]["id"];
export type MarketingAudienceLevel = "FIRST_CONTACT" | "REMARKETING" | "FOLLOW_UP" | "ALL";

export type MarketingDripStep = {
  dayOffset: number;
  channel: "email" | "whatsapp" | "sms";
  subject?: string;
  bodyHtml: string;
};

export const MARKETING_AUDIENCE_LEVEL_OPTIONS = [
  { id: "FIRST_CONTACT", label: "Primeiro contato" },
  { id: "REMARKETING", label: "Re-marketing" },
  { id: "FOLLOW_UP", label: "Follow-up" },
  { id: "ALL", label: "Todos os leads" }
] as const;

export const DEFAULT_ACQUISITION_SEQUENCE: MarketingDripStep[] = [
  {
    dayOffset: 0,
    channel: "email",
    subject: "Bem-vindo — próximo passo com a Ederson Programador",
    bodyHtml:
      "<p>Olá {{LEAD_NAME}},</p><p>Recebemos seu interesse. Em breve alinhamos o melhor caminho da ideia ao lançamento.</p><p>Enquanto isso, responda este e-mail com o objetivo principal do seu projeto.</p>"
  },
  {
    dayOffset: 2,
    channel: "email",
    subject: "Do zero ao lançamento: o que vem primeiro",
    bodyHtml:
      "<p>Olá {{LEAD_NAME}},</p><p>O primeiro passo é clareza: problema, público e oferta. Depois vem o MVP.</p><p>Se quiser, responda com o maior obstáculo hoje — preparo a próxima recomendação.</p>"
  },
  {
    dayOffset: 2,
    channel: "whatsapp",
    bodyHtml:
      "Olá {{LEAD_NAME}}! Aqui é a Ederson Programador. Vi seu cadastro — posso te enviar o próximo passo do diagnóstico em 1 mensagem?"
  },
  {
    dayOffset: 5,
    channel: "email",
    subject: "Proposta alinhada ao seu momento",
    bodyHtml:
      "<p>Olá {{LEAD_NAME}},</p><p>Com base no seu perfil, o próximo passo é uma proposta objetiva (START / BUSINESS / ENTERPRISE).</p><p>Responda este e-mail ou fale no WhatsApp para agendarmos.</p>"
  }
];

export const DEFAULT_REMARKETING_SEQUENCE: MarketingDripStep[] = [
  {
    dayOffset: 0,
    channel: "email",
    subject: "Ainda dá tempo de retomar seu projeto",
    bodyHtml:
      "<p>Olá {{LEAD_NAME}},</p><p>Notamos que você já esteve em contato conosco. Se a ideia ainda faz sentido, retomamos do ponto em que parou.</p>"
  },
  {
    dayOffset: 3,
    channel: "whatsapp",
    bodyHtml:
      "{{LEAD_NAME}}, passando para lembrar: posso te enviar um resumo rápido do que falta para lançar?"
  },
  {
    dayOffset: 7,
    channel: "email",
    subject: "Última janela desta sequência",
    bodyHtml:
      "<p>Olá {{LEAD_NAME}},</p><p>Esta é a última mensagem automática desta série. Se quiser seguir, responda com “quero retomar”.</p>"
  }
];

export const DEFAULT_FOLLOW_UP_SEQUENCE: MarketingDripStep[] = [
  {
    dayOffset: 0,
    channel: "email",
    subject: "Follow-up do seu diagnóstico",
    bodyHtml:
      "<p>Olá {{LEAD_NAME}},</p><p>Obrigado pelo diagnóstico. Estou revisando objetivos e obstáculos para te devolver o próximo passo.</p>"
  },
  {
    dayOffset: 1,
    channel: "whatsapp",
    bodyHtml:
      "Oi {{LEAD_NAME}}! Recebi seu diagnóstico. Prefere alinharmos por aqui ou por e-mail a proposta?"
  },
  {
    dayOffset: 4,
    channel: "email",
    subject: "Próximo passo comercial",
    bodyHtml:
      "<p>Olá {{LEAD_NAME}},</p><p>Segue o follow-up: podemos avançar para proposta formal ou uma call curta de alinhamento.</p>"
  }
];

export function defaultSequenceForKind(kind: MarketingCampaignKind): MarketingDripStep[] {
  switch (kind) {
    case "ACQUISITION":
      return DEFAULT_ACQUISITION_SEQUENCE.map((s) => ({ ...s }));
    case "REMARKETING":
      return DEFAULT_REMARKETING_SEQUENCE.map((s) => ({ ...s }));
    case "FOLLOW_UP":
      return DEFAULT_FOLLOW_UP_SEQUENCE.map((s) => ({ ...s }));
    default:
      return [];
  }
}

export function defaultCampaignNameForKind(kind: MarketingCampaignKind): string {
  switch (kind) {
    case "ACQUISITION":
      return "Aquisição — sequência padrão";
    case "REMARKETING":
      return "Re-marketing — sequência padrão";
    case "FOLLOW_UP":
      return "Follow-up — sequência padrão";
    default:
      return "Campanha";
  }
}
