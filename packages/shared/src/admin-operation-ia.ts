/**
 * Informação de arquitetura do admin — sistema operacional por processo.
 * Fonte única para sidebar, hubs, breadcrumbs e redirects.
 */

export type AdminNavBlockId = "comando" | "comercial" | "entrega" | "sistema";

export type AdminNavLink = {
  id: string;
  label: string;
  /** Caminho relativo a `/agencia/admin` (sem barra inicial). */
  adminPath: string;
  purpose: string;
  /** Número da etapa no processo do bloco (quando aplicável). */
  stepNumber?: number;
};

export type AdminNavBlock = {
  id: AdminNavBlockId;
  label: string;
  purpose: string;
  links: readonly AdminNavLink[];
};

/** Processo comercial único — captura → nutrição → vendas → relacionamento. */
export const ADMIN_COMERCIAL_STEPS: readonly AdminNavLink[] = [
  {
    id: "captura",
    label: "Captura",
    adminPath: "comercial/captura",
    stepNumber: 1,
    purpose: "Leads novos, CDP e fontes de entrada."
  },
  {
    id: "nutricao",
    label: "Nutrição",
    adminPath: "comercial/nutricao",
    stepNumber: 2,
    purpose: "Campanhas de aquisição, re-marketing e follow-up."
  },
  {
    id: "vendas",
    label: "Vendas",
    adminPath: "comercial/vendas",
    stepNumber: 3,
    purpose: "Pipeline, funil e conversão em projeto."
  },
  {
    id: "relacionamento",
    label: "Relacionamento",
    adminPath: "comercial/relacionamento",
    stepNumber: 4,
    purpose: "Clientes ativos e fidelização."
  }
] as const;

export const ADMIN_OPERATION_BLOCKS: readonly AdminNavBlock[] = [
  {
    id: "comando",
    label: "Comando",
    purpose: "O que precisa de atenção agora.",
    links: [
      {
        id: "inicio",
        label: "Início",
        adminPath: "",
        purpose: "Multi-client dashboard, campanhas e agentes."
      },
      {
        id: "agentes",
        label: "Agentes IA",
        adminPath: "agentes",
        purpose: "Especialistas de branding, proposta, marketing e entrega."
      },
      {
        id: "projetos",
        label: "Projetos",
        adminPath: "projetos",
        purpose: "Carteira de projetos da agência."
      }
    ]
  },
  {
    id: "comercial",
    label: "Comercial",
    purpose: "Pipeline comercial em 4 etapas.",
    links: ADMIN_COMERCIAL_STEPS
  },
  {
    id: "entrega",
    label: "Entrega",
    purpose: "Produção por projeto (branding, código, fórmula).",
    links: [
      {
        id: "branding",
        label: "Branding (ferramenta)",
        adminPath: "operacao/branding/estatistica",
        purpose: "Workspace de marca — operação diária via Agentes."
      },
      {
        id: "desenvolvimento",
        label: "Stack / Studio",
        adminPath: "operacao/desenvolvimento/stack",
        purpose: "Stack técnica e Studio de código."
      },
      {
        id: "formula",
        label: "Fórmula (ferramenta)",
        adminPath: "operacao/formula-lancamento/simulador",
        purpose: "Simulador — planejamento via agente Launch planner."
      }
    ]
  },
  {
    id: "sistema",
    label: "Sistema",
    purpose: "Configuração — não é operação diária.",
    links: [
      {
        id: "automacoes",
        label: "Automações",
        adminPath: "automacoes",
        purpose: "Triggers e passos técnicos."
      },
      {
        id: "integracoes",
        label: "Integrações",
        adminPath: "marketing/integracoes",
        purpose: "Provedores de e-mail, WhatsApp e webhooks."
      },
      {
        id: "transacional",
        label: "Testes de envio",
        adminPath: "marketing/transacional",
        purpose: "Prova de e-mail, SMS e WhatsApp."
      }
    ]
  }
] as const;

/** Rotas legadas → caminho canônico sob /agencia/admin. */
export const ADMIN_LEGACY_PATH_ALIASES: Record<string, string> = {
  leads: "comercial/captura",
  "marketing/cdp": "comercial/captura",
  "marketing/campanhas": "comercial/nutricao",
  "marketing/crm": "comercial/vendas",
  funil: "comercial/vendas",
  clientes: "comercial/relacionamento",
  "marketing/fidelidade": "comercial/relacionamento",
  marketing: ""
};

export function findAdminNavByAdminPath(adminPath: string): {
  block: AdminNavBlock;
  link: AdminNavLink;
} | null {
  const normalized = adminPath.replace(/^\/+/, "").replace(/\/+$/, "");
  for (const block of ADMIN_OPERATION_BLOCKS) {
    for (const link of block.links) {
      if (link.adminPath === normalized) return { block, link };
      if (link.adminPath && normalized.startsWith(`${link.adminPath}/`)) return { block, link };
    }
  }
  const aliased = ADMIN_LEGACY_PATH_ALIASES[normalized];
  if (aliased !== undefined) return findAdminNavByAdminPath(aliased);
  return null;
}

export function adminComercialStepLabel(step: AdminNavLink): string {
  return step.stepNumber ? `${step.stepNumber}. ${step.label}` : step.label;
}

export function resolveAdminCanonicalPath(adminPath: string): string {
  const normalized = adminPath.replace(/^\/+/, "").replace(/\/+$/, "");
  return ADMIN_LEGACY_PATH_ALIASES[normalized] ?? normalized;
}
