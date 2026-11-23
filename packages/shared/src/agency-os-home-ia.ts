/**
 * Home da agência Ederson Programador — sistema principal
 * (Negócios · Operações · Recursos · Crescimento · Sistema)
 *
 * Links abrem o CRM em `/agencia/admin/?view=…` (app padrão, sem iframe).
 */

import { AGENCY_APP_BASE } from "./auth-context.js";

export type AgencyOsHomePillarId =
  | "negocios"
  | "operacoes"
  | "recursos"
  | "crescimento"
  | "sistema";

export type AgencyOsHomeLink = {
  id: string;
  label: string;
  /** Path relativo a /agencia/admin, ou absoluto começando com / */
  adminPath: string;
  purpose: string;
};

export type AgencyOsHomePillar = {
  id: AgencyOsHomePillarId;
  label: string;
  purpose: string;
  links: readonly AgencyOsHomeLink[];
};

export const AGENCY_OS_HOME_COPY = {
  brand: "Ederson Programador",
  product: "Agência Ederson Programador",
  headline: "Sistema principal da agência Ederson Programador",
  subhead:
    "CRM e operação em um só lugar: clientes, projetos, equipe, finanças e recursos — sem planilhas nem caos de abas.",
  startHere: "Começar",
  pains: [] as string[],
  solutions: [
    "Captura e nutrição de leads",
    "Gestão de relacionamento com clientes",
    "Portais, projetos e tarefas",
    "Desenvolvimento de negócios e serviços",
    "Biblioteca de POPs, recursos e assets",
    "Performance da equipe",
    "Controle financeiro e faturamento"
  ],
  outcomes: [
    "Onboarding de clientes mais rápido",
    "Tudo centralizado em um workspace",
    "Tarefas atribuídas com clareza",
    "Propostas em minutos",
    "Portal do cliente com suporte",
    "Gestão de projetos mais forte",
    "Visão financeira clara",
    "Escala de freelancer à agência"
  ]
} as const;

/** Path do Studio de código dentro do workspace admin. */
export const AGENCY_OS_STUDIO_ADMIN_PATH = "studio";

/** Views do CRM (`/agencia/admin/?view=`). */
export const AMPLIFICA_CRM_VIEWS = [
  "dashboard",
  "agency_kpis",
  "leads",
  "clients",
  "finance",
  "social_posts",
  "design",
  "videos",
  "recordings",
  "demands",
  "prospecting",
  "productivity",
  "drive",
  "partners",
  "tickets",
  "personalization",
  "academy",
  "admin"
] as const;

export type AmplificaCrmView = (typeof AMPLIFICA_CRM_VIEWS)[number];

export function amplificaCrmAdminPath(view: AmplificaCrmView): string {
  return `${AGENCY_APP_BASE}/admin/?view=${encodeURIComponent(view)}`;
}

export const AGENCY_OS_HOME_PILLARS: readonly AgencyOsHomePillar[] = [
  {
    id: "negocios",
    label: "Business",
    purpose: "Pipeline, clients, and prospecting.",
    links: [
      {
        id: "conteudo",
        label: "Content",
        adminPath: amplificaCrmAdminPath("social_posts"),
        purpose: "Social content scheduling."
      },
      {
        id: "prospects",
        label: "Prospects",
        adminPath: amplificaCrmAdminPath("prospecting"),
        purpose: "Prospecting lists and campaigns."
      },
      {
        id: "leads",
        label: "Leads",
        adminPath: amplificaCrmAdminPath("leads"),
        purpose: "Sales pipeline kanban."
      },
      {
        id: "clientes",
        label: "Clients",
        adminPath: amplificaCrmAdminPath("clients"),
        purpose: "Active client accounts."
      },
      {
        id: "propostas",
        label: "Proposals",
        adminPath: amplificaCrmAdminPath("partners"),
        purpose: "Partners and commercial requests."
      }
    ]
  },
  {
    id: "operacoes",
    label: "Operations",
    purpose: "Delivery workflows and studio.",
    links: [
      {
        id: "projetos",
        label: "Projects",
        adminPath: amplificaCrmAdminPath("demands"),
        purpose: "Demand board."
      },
      {
        id: "tarefas",
        label: "Tasks",
        adminPath: amplificaCrmAdminPath("design"),
        purpose: "Design workflow."
      },
      {
        id: "reunioes",
        label: "Meetings",
        adminPath: amplificaCrmAdminPath("dashboard"),
        purpose: "Agency dashboard hub."
      },
      {
        id: "portais",
        label: "Portals",
        adminPath: amplificaCrmAdminPath("videos"),
        purpose: "Video editing workflow."
      },
      {
        id: "servicos",
        label: "Services",
        adminPath: amplificaCrmAdminPath("recordings"),
        purpose: "Recording demands."
      },
      {
        id: "studio",
        label: "Code Studio",
        adminPath: AGENCY_OS_STUDIO_ADMIN_PATH,
        purpose: "In-workspace development studio."
      }
    ]
  },
  {
    id: "recursos",
    label: "Resources",
    purpose: "Files, posts, and brand ops.",
    links: [
      {
        id: "documentos",
        label: "Documents",
        adminPath: amplificaCrmAdminPath("drive"),
        purpose: "Google Drive files."
      },
      {
        id: "pops",
        label: "SOPs",
        adminPath: amplificaCrmAdminPath("demands"),
        purpose: "Operational demands."
      },
      {
        id: "ferramentas",
        label: "Tools & Terms",
        adminPath: amplificaCrmAdminPath("admin"),
        purpose: "Integrations and settings."
      },
      {
        id: "emails-scripts",
        label: "Emails & Scripts",
        adminPath: amplificaCrmAdminPath("social_posts"),
        purpose: "Scheduled posts and outreach."
      },
      {
        id: "branding",
        label: "Branding",
        adminPath: amplificaCrmAdminPath("design"),
        purpose: "Creative / design orders."
      }
    ]
  },
  {
    id: "crescimento",
    label: "Growth",
    purpose: "Team, KPIs, and finance.",
    links: [
      {
        id: "equipe",
        label: "Team",
        adminPath: amplificaCrmAdminPath("productivity"),
        purpose: "Team productivity."
      },
      {
        id: "okrs",
        label: "OKRs",
        adminPath: amplificaCrmAdminPath("agency_kpis"),
        purpose: "Agency KPI snapshots."
      },
      {
        id: "performance",
        label: "Performance",
        adminPath: amplificaCrmAdminPath("dashboard"),
        purpose: "Strategic dashboard."
      },
      {
        id: "contratacao",
        label: "Hiring",
        adminPath: amplificaCrmAdminPath("partners"),
        purpose: "Partners and requests."
      },
      {
        id: "financas",
        label: "Finance",
        adminPath: amplificaCrmAdminPath("finance"),
        purpose: "Receivables and finance."
      }
    ]
  },
  {
    id: "sistema",
    label: "System",
    purpose: "Settings, support, and analytics.",
    links: [
      {
        id: "limpeza",
        label: "Clean Up",
        adminPath: amplificaCrmAdminPath("dashboard"),
        purpose: "Needs-attention overview."
      },
      {
        id: "templates",
        label: "Templates",
        adminPath: amplificaCrmAdminPath("admin"),
        purpose: "Agency configuration."
      },
      {
        id: "analytics",
        label: "Analytics",
        adminPath: amplificaCrmAdminPath("agency_kpis"),
        purpose: "KPI analytics."
      },
      {
        id: "suporte",
        label: "Support",
        adminPath: amplificaCrmAdminPath("tickets"),
        purpose: "Support tickets."
      },
      {
        id: "databases",
        label: "Databases",
        adminPath: amplificaCrmAdminPath("admin"),
        purpose: "Integrations and data."
      },
      {
        id: "automacoes",
        label: "Automations",
        adminPath: amplificaCrmAdminPath("admin"),
        purpose: "Automation settings."
      }
    ]
  }
] as const;

export const AGENCY_OS_START_HERE_PATH = amplificaCrmAdminPath("leads");
