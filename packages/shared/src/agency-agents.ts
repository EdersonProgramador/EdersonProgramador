/**
 * Agentes especialistas Agency OS (modelo Viva + skills avançadas de branding/marketing).
 * Produzem material da proposta (landing START/BUSINESS/ENTERPRISE) com aprovação humana.
 */

import {
  PACKAGE_TIER_CONFIG,
  PACKAGE_TIER_SALES_IDS,
  allDeliverablesForTier,
  type PackageTierId
} from "./project-journey.js";

export type AgencyAgentDomain =
  | "branding"
  | "comercial"
  | "nutricao"
  | "vendas"
  | "relacionamento"
  | "formula"
  | "desenvolvimento"
  | "conteudo"
  | "proposta";

export type AgencyAgentDeliverableKind =
  | "message"
  | "branding_patch"
  | "campaign_sequence"
  | "proposal_pack"
  | "sales_script"
  | "loyalty_message"
  | "launch_plan"
  | "stack_pick"
  | "code_snippet"
  | "content_draft";

export type AgencyAgentTemplateId =
  | "brand_discovery"
  | "brand_strategist"
  | "brand_naming"
  | "brand_verbal"
  | "brand_visual"
  | "brand_guidelines"
  | "proposal_architect"
  | "receptionist"
  | "marketer"
  | "campaign_runner"
  | "sales_closer"
  | "loyalty_keeper"
  | "launch_planner"
  | "stack_architect"
  | "code_studio_pair"
  | "content_writer"
  | "review_responder";

export type AgencyAgentSkill = {
  id: string;
  label: string;
  description: string;
};

export type AgencyAgentTemplate = {
  id: AgencyAgentTemplateId;
  label: string;
  role: string;
  domain: AgencyAgentDomain;
  deliverableKind: AgencyAgentDeliverableKind;
  description: string;
  defaultGuardrails: string;
  defaultPrompt: string;
  skills: readonly AgencyAgentSkill[];
  channels: readonly ("email" | "sms" | "whatsapp" | "inbox")[];
  /** Incluir no bootstrap padrão por cliente. */
  bootstrapDefault?: boolean;
};

export const AGENCY_AGENT_TEMPLATES: readonly AgencyAgentTemplate[] = [
  {
    id: "brand_discovery",
    label: "Discovery de marca",
    role: "Pesquisa",
    domain: "branding",
    deliverableKind: "branding_patch",
    description: "Brief de discovery: stakeholders, concorrentes, audiência e diagnóstico.",
    defaultGuardrails: "Baseie-se só no brief do cliente. Não invente dados de mercado sem marcar como hipótese.",
    defaultPrompt: "Você é estrategista de discovery. Entregue notas estruturadas para o workspace de branding.",
    skills: [
      { id: "stakeholder_map", label: "Mapa de stakeholders", description: "Quem decide, influencia e usa." },
      { id: "competitor_scan", label: "Varredura competitiva", description: "Posicionamento relativo." },
      { id: "audience_personas", label: "Personas", description: "Público-alvo e jobs-to-be-done." }
    ],
    channels: ["inbox"],
    bootstrapDefault: true
  },
  {
    id: "brand_strategist",
    label: "Estrategista de marca",
    role: "Posicionamento",
    domain: "branding",
    deliverableKind: "branding_patch",
    description: "Posicionamento, proposta de valor, arquitetura e diferenciação.",
    defaultGuardrails: "Uma frase de posicionamento clara. Sem jargão vazio.",
    defaultPrompt: "Você define estratégia de marca alinhada à proposta App do Zero ao Lançamento.",
    skills: [
      { id: "positioning", label: "Posicionamento", description: "Para quem / contra o quê / promessa." },
      { id: "value_prop", label: "Proposta de valor", description: "Benefício mensurável." },
      { id: "brand_architecture", label: "Arquitetura", description: "Marca mãe e ofertas." }
    ],
    channels: ["inbox"],
    bootstrapDefault: true
  },
  {
    id: "brand_naming",
    label: "Naming",
    role: "Nomeação",
    domain: "branding",
    deliverableKind: "branding_patch",
    description: "Opções de nome, tagline e checagem de legibilidade (incl. AI/search).",
    defaultGuardrails: "Liste 3–5 opções com racional. Marque riscos de confusão.",
    defaultPrompt: "Você é especialista em naming e verbal identity.",
    skills: [
      { id: "name_options", label: "Opções de nome", description: "Lista ranqueada." },
      { id: "taglines", label: "Taglines", description: "Linhas de suporte." }
    ],
    channels: ["inbox"],
    bootstrapDefault: true
  },
  {
    id: "brand_verbal",
    label: "Identidade verbal",
    role: "Voz",
    domain: "branding",
    deliverableKind: "branding_patch",
    description: "Tom de voz, do's/don'ts e exemplos certos/errados.",
    defaultGuardrails: "Exemplos concretos. Regras acionáveis para agentes e humanos.",
    defaultPrompt: "Você define a voz da marca para copy e agentes.",
    skills: [
      { id: "voice_rules", label: "Regras de voz", description: "Tom, ritmo, palavras." },
      { id: "anti_examples", label: "Anti-exemplos", description: "O que nunca dizer." }
    ],
    channels: ["inbox"],
    bootstrapDefault: true
  },
  {
    id: "brand_visual",
    label: "Identidade visual",
    role: "Visual",
    domain: "branding",
    deliverableKind: "branding_patch",
    description: "Brief de logo, paleta, tipografia e linguagem visual (tokens texto).",
    defaultGuardrails: "Descreva direção, não finja arquivos binários. Tokens em texto/hex.",
    defaultPrompt: "Você direciona identidade visual para brandbook e Studio.",
    skills: [
      { id: "logo_brief", label: "Brief de logo", description: "Conceitos e restrições." },
      { id: "color_type", label: "Cor e tipo", description: "Paleta e famílias." },
      { id: "design_tokens", label: "Design tokens", description: "Valores machine-readable." }
    ],
    channels: ["inbox"],
    bootstrapDefault: true
  },
  {
    id: "brand_guidelines",
    label: "Brand guidelines",
    role: "Governança",
    domain: "branding",
    deliverableKind: "branding_patch",
    description: "Guidelines, uso correto e checklist de brandbook.",
    defaultGuardrails: "Checklist acionável. Pronto para PDF brandbook.",
    defaultPrompt: "Você consolida guidelines da marca.",
    skills: [
      { id: "usage_rules", label: "Regras de uso", description: "Logo, espaço, fundos." },
      { id: "brandbook_outline", label: "Outline brandbook", description: "Sumário do PDF." }
    ],
    channels: ["inbox"],
    bootstrapDefault: true
  },
  {
    id: "proposal_architect",
    label: "Arquiteto de proposta",
    role: "Proposta comercial",
    domain: "proposta",
    deliverableKind: "proposal_pack",
    description:
      "Pacote completo da proposta da landing: resumo, escopo por pacote START/BUSINESS/ENTERPRISE, cronograma, entregáveis e condições.",
    defaultGuardrails:
      "Use apenas valores e entregáveis oficiais dos pacotes. Não invente preços. Aprovação humana obrigatória antes de enviar ao cliente.",
    defaultPrompt:
      "Você monta a proposta formal alinhada à página App do Zero ao Lançamento e ao contrato.",
    skills: [
      { id: "exec_summary", label: "Sumário executivo", description: "1 página clara." },
      { id: "scope_tiers", label: "Escopo por pacote", description: "START / BUSINESS / ENTERPRISE." },
      { id: "timeline_payment", label: "Cronograma e pagamento", description: "Fases e entrada." },
      { id: "deliverables_list", label: "Lista de entregáveis", description: "Por fase do projeto." }
    ],
    channels: ["email", "inbox"],
    bootstrapDefault: true
  },
  {
    id: "receptionist",
    label: "Recepcionista",
    role: "Atende e qualifica",
    domain: "comercial",
    deliverableKind: "message",
    description: "Responde leads 24/7 e encaminha para proposta.",
    defaultGuardrails: "Não invente preços. Encaminhe decisão comercial ao humano.",
    defaultPrompt: "Você é a recepcionista da agência.",
    skills: [{ id: "qualify", label: "Qualificação", description: "Perguntas mínimas." }],
    channels: ["email", "whatsapp", "inbox"],
    bootstrapDefault: true
  },
  {
    id: "marketer",
    label: "Marketer",
    role: "Capta e nutre",
    domain: "comercial",
    deliverableKind: "message",
    description: "Outreach e follow-ups na voz da marca até a proposta.",
    defaultGuardrails: "Sem spam. Máx. 1 follow-up/48h. Respeite opt-out.",
    defaultPrompt: "Você é o marketer do cliente.",
    skills: [
      { id: "outreach", label: "Outreach", description: "Primeiro contato." },
      { id: "follow_up", label: "Follow-up", description: "Reengajamento." }
    ],
    channels: ["email", "sms", "whatsapp"],
    bootstrapDefault: true
  },
  {
    id: "campaign_runner",
    label: "Campaign runner",
    role: "Campanhas drip",
    domain: "nutricao",
    deliverableKind: "campaign_sequence",
    description: "Sequências de aquisição/remarketing alinhadas à proposta.",
    defaultGuardrails: "Só sugere; não dispara sem aprovação. Máx. 5 passos.",
    defaultPrompt: "Você opera campanhas drip do funil comercial.",
    skills: [
      { id: "drip_seq", label: "Sequência drip", description: "dayOffset + copy." },
      { id: "audience", label: "Audiência", description: "Quem matricular." }
    ],
    channels: ["email"],
    bootstrapDefault: true
  },
  {
    id: "sales_closer",
    label: "Closer de vendas",
    role: "Fecha",
    domain: "vendas",
    deliverableKind: "sales_script",
    description: "Script de call e próximos passos CRM até contrato.",
    defaultGuardrails: "Sem pressão antiética. Ofereça START/BUSINESS/ENTERPRISE com clareza.",
    defaultPrompt: "Você é closer alinhado ao funil da agência.",
    skills: [
      { id: "call_script", label: "Script de call", description: "Abertura → objeções → close." },
      { id: "objection_map", label: "Objeções", description: "Respostas padrão." }
    ],
    channels: ["inbox"],
    bootstrapDefault: true
  },
  {
    id: "loyalty_keeper",
    label: "Fidelização",
    role: "Relacionamento",
    domain: "relacionamento",
    deliverableKind: "loyalty_message",
    description: "Mensagens pós-venda e upsell responsável.",
    defaultGuardrails: "Tom de parceria. Upsell só se fizer sentido no tier.",
    defaultPrompt: "Você cuida do relacionamento pós-contrato.",
    skills: [{ id: "retention", label: "Retenção", description: "Check-ins e valor." }],
    channels: ["email", "whatsapp"],
    bootstrapDefault: true
  },
  {
    id: "launch_planner",
    label: "Planner de lançamento",
    role: "Fórmula",
    domain: "formula",
    deliverableKind: "launch_plan",
    description: "Plano de fases de lançamento alinhado ao pacote vendido.",
    defaultGuardrails: "Checklist realista. Sem prometer datas sem buffer.",
    defaultPrompt: "Você planeja o lançamento do produto do cliente.",
    skills: [
      { id: "phase_plan", label: "Plano por fase", description: "Pré / live / pós." },
      { id: "assets_needed", label: "Assets necessários", description: "Lista para o cliente." }
    ],
    channels: ["inbox"],
    bootstrapDefault: true
  },
  {
    id: "stack_architect",
    label: "Arquiteto de stack",
    role: "Tecnologia",
    domain: "desenvolvimento",
    deliverableKind: "stack_pick",
    description: "Sugestão de stack por camada para o projeto contratado.",
    defaultGuardrails: "Preferir stack da agência (React/Vite, Node, Postgres) salvo requisito explícito.",
    defaultPrompt: "Você escolhe stack técnica para entrega.",
    skills: [{ id: "layer_pick", label: "Escolha por camada", description: "Front/back/dados/infra." }],
    channels: ["inbox"],
    bootstrapDefault: true
  },
  {
    id: "code_studio_pair",
    label: "Pair no Studio",
    role: "Código",
    domain: "desenvolvimento",
    deliverableKind: "code_snippet",
    description: "Snippets e estrutura de arquivos para o Studio de código.",
    defaultGuardrails: "Código mínimo viável. Sem secrets. Pronto para colar no Studio.",
    defaultPrompt: "Você gera protótipos e snippets no Studio.",
    skills: [{ id: "scaffold", label: "Scaffold", description: "Arquivo + conteúdo." }],
    channels: ["inbox"],
    bootstrapDefault: true
  },
  {
    id: "content_writer",
    label: "Content writer",
    role: "Copy",
    domain: "conteudo",
    deliverableKind: "content_draft",
    description: "Copy de landing, one-pager e posts na voz da marca.",
    defaultGuardrails: "Benefício concreto. CTA alinhado à proposta.",
    defaultPrompt: "Você é copywriter do projeto.",
    skills: [
      { id: "landing_copy", label: "Copy de landing", description: "Hero + prova + CTA." },
      { id: "one_pager", label: "One-pager", description: "Proposta resumida." }
    ],
    channels: ["inbox"],
    bootstrapDefault: true
  },
  {
    id: "review_responder",
    label: "Review responder",
    role: "Reputação",
    domain: "conteudo",
    deliverableKind: "message",
    description: "Respostas a avaliações e feedback.",
    defaultGuardrails: "Nunca discuta em público. Ofereça próximo passo offline.",
    defaultPrompt: "Você responde avaliações com empatia.",
    skills: [{ id: "review_reply", label: "Resposta", description: "Tom alinhado." }],
    channels: ["inbox"]
  }
] as const;

/** Pacote padrão implantado no onboard do cliente (Viva passo 2). */
export const AGENCY_AGENT_BOOTSTRAP_TEMPLATE_IDS: readonly AgencyAgentTemplateId[] =
  AGENCY_AGENT_TEMPLATES.filter((t) => t.bootstrapDefault).map((t) => t.id);

export function getAgencyAgentTemplate(id: string): AgencyAgentTemplate | undefined {
  return AGENCY_AGENT_TEMPLATES.find((t) => t.id === id);
}

export function agencyAgentTemplatesByDomain(domain: AgencyAgentDomain): AgencyAgentTemplate[] {
  return AGENCY_AGENT_TEMPLATES.filter((t) => t.domain === domain);
}

export function isAgencyAgentTemplateId(id: string): id is AgencyAgentTemplateId {
  return AGENCY_AGENT_TEMPLATES.some((t) => t.id === id);
}

/** Material oficial da proposta da página (pacotes + entregáveis). */
export function proposalPackFromTier(tier: PackageTierId = "professional") {
  const cfg = PACKAGE_TIER_CONFIG[tier];
  const entry = Math.round((cfg.totalValueCents * cfg.entryPercent) / 100);
  const deliverables = allDeliverablesForTier(tier);
  return {
    tier,
    packageName: cfg.name,
    tagline: cfg.tagline,
    totalValueCents: cfg.totalValueCents,
    entryValueCents: entry,
    balanceCents: Math.max(0, cfg.totalValueCents - entry),
    entryPercent: cfg.entryPercent,
    deliverables: deliverables.map((d) => ({ phase: d.phaseKey, label: d.label })),
    salesTiers: PACKAGE_TIER_SALES_IDS.map((id) => ({
      id,
      name: PACKAGE_TIER_CONFIG[id].name,
      tagline: PACKAGE_TIER_CONFIG[id].tagline,
      totalValueCents: PACKAGE_TIER_CONFIG[id].totalValueCents
    }))
  };
}
