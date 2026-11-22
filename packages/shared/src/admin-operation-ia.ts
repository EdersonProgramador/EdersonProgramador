/**
 * Amplifica CRM — IA mínima para breadcrumbs (home, sem sidebar).
 */

import {
  AGENCY_OS_HOME_PILLARS,
  AGENCY_OS_STUDIO_ADMIN_PATH,
  type AgencyOsHomePillarId
} from "./agency-os-home-ia.js";
import { agencyOpsDefaultAdminPath, agencyOpsLaneAdminPath } from "./agency-ops-process-lanes.js";

export type AdminNavBlockId = AgencyOsHomePillarId | "comando";

export type AdminNavLink = {
  id: string;
  label: string;
  adminPath: string;
  purpose: string;
  stepNumber?: number;
};

export type AdminNavBlock = {
  id: AdminNavBlockId;
  label: string;
  purpose: string;
  links: readonly AdminNavLink[];
};

export const ADMIN_COMERCIAL_STEPS: readonly AdminNavLink[] = [
  {
    id: "captura",
    label: "Lead",
    adminPath: "comercial/captura",
    stepNumber: 1,
    purpose: "Lead capture."
  },
  {
    id: "qualificacao",
    label: "Qualified",
    adminPath: "comercial/qualificacao",
    stepNumber: 2,
    purpose: "Qualification."
  },
  {
    id: "proposta",
    label: "Proposal",
    adminPath: "comercial/proposta",
    stepNumber: 3,
    purpose: "Proposals."
  },
  {
    id: "negociacao",
    label: "Negotiation",
    adminPath: "comercial/negociacao",
    stepNumber: 4,
    purpose: "Negotiation."
  },
  {
    id: "contrato",
    label: "Contract",
    adminPath: "comercial/contrato",
    stepNumber: 5,
    purpose: "Contract."
  },
  {
    id: "ativo",
    label: "Active",
    adminPath: "comercial/relacionamento",
    stepNumber: 6,
    purpose: "Active clients."
  }
] as const;

/** Sem menu lateral — blocos só para resolver labels/breadcrumbs. */
export const ADMIN_OPERATION_BLOCKS: readonly AdminNavBlock[] = [
  {
    id: "comando",
    label: "Amplifica CRM",
    purpose: "Home workspace.",
    links: [
      { id: "inicio", label: "Home", adminPath: "", purpose: "Amplifica CRM home." },
      {
        id: "studio",
        label: "Code Studio",
        adminPath: AGENCY_OS_STUDIO_ADMIN_PATH,
        purpose: "Development studio."
      }
    ]
  },
  ...AGENCY_OS_HOME_PILLARS.map((pillar) => ({
    id: pillar.id as AdminNavBlockId,
    label: pillar.label,
    purpose: pillar.purpose,
    links: pillar.links.map((l) => ({
      id: l.id,
      label: l.label,
      adminPath: l.adminPath,
      purpose: l.purpose
    }))
  }))
] as const;

export const ADMIN_LEGACY_PATH_ALIASES: Record<string, string> = {
  leads: "comercial/captura",
  "marketing/cdp": "comercial/captura",
  "marketing/campanhas": "comercial/nutricao",
  "comercial/nutricao": agencyOpsLaneAdminPath("marketing", "pipeline"),
  "comercial/vendas": agencyOpsLaneAdminPath("marketing", "pipeline"),
  "marketing/crm": agencyOpsLaneAdminPath("marketing", "pipeline"),
  funil: agencyOpsLaneAdminPath("marketing", "pipeline"),
  clientes: "comercial/relacionamento",
  "marketing/fidelidade": "comercial/relacionamento",
  marketing: agencyOpsDefaultAdminPath("marketing"),
  "operacao/desenvolvimento/editor": AGENCY_OS_STUDIO_ADMIN_PATH,
  "operacao/desenvolvimento/stack": AGENCY_OS_STUDIO_ADMIN_PATH
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
