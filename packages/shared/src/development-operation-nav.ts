/** Desenvolvimento — trilhas técnicas do lançamento (front, back, dados, infra). */

import {
  findOperationSectionNavByAdminPath,
  operationSectionNavFlatItems,
  type OperationSectionNav,
  type OperationSectionNavItem
} from "./operation-pillar-section-nav.js";

export type DevelopmentNavItem = OperationSectionNavItem;
export type DevelopmentNavSection = OperationSectionNav;

export const DEVELOPMENT_OPERATION_NAV: readonly DevelopmentNavSection[] = [
  {
    id: "analisar",
    sectionLabel: "Analisar",
    items: [
      {
        id: "estatistica",
        label: "Estatística",
        adminPath: "operacao/desenvolvimento/estatistica",
        description: "Checklist técnico e progresso do pilar desenvolvimento."
      }
    ]
  },
  {
    id: "interface",
    sectionLabel: "Interface",
    items: [
      {
        id: "front-end",
        label: "Front-end",
        adminPath: "operacao/desenvolvimento/front-end",
        description: "LPs, CPLs, checkout e performance (Web Vitals, pixels)."
      }
    ]
  },
  {
    id: "servicos",
    sectionLabel: "Serviços",
    items: [
      {
        id: "back-end",
        label: "Back-end",
        adminPath: "operacao/desenvolvimento/back-end",
        description: "API, automações, integrações e filas."
      }
    ]
  },
  {
    id: "dados",
    sectionLabel: "Dados",
    items: [
      {
        id: "banco-de-dados",
        label: "Banco de dados",
        adminPath: "operacao/desenvolvimento/banco-de-dados",
        description: "Modelagem, migrações e persistência do funil."
      }
    ]
  },
  {
    id: "publicar",
    sectionLabel: "Publicar",
    items: [
      {
        id: "infra",
        label: "Infra & captação",
        adminPath: "operacao/desenvolvimento/infra",
        description: "Infra PPL, automação de captação e tráfego (playbook Fase 3)."
      }
    ]
  }
] as const;

export const DEVELOPMENT_LEGACY_PATH_ALIASES: Record<string, string> = {
  "operacao/marketing/front-end": "operacao/desenvolvimento/front-end",
  "operacao/marketing/back-end": "operacao/desenvolvimento/back-end",
  "operacao/marketing/banco-de-dados": "operacao/desenvolvimento/banco-de-dados",
  "operacao/fase-3": "operacao/desenvolvimento/infra"
};

export function developmentNavFlatItems(): DevelopmentNavItem[] {
  return operationSectionNavFlatItems(DEVELOPMENT_OPERATION_NAV);
}

export function findDevelopmentNavByAdminPath(adminPath: string): {
  section: DevelopmentNavSection;
  item: DevelopmentNavItem;
} | null {
  return findOperationSectionNavByAdminPath(DEVELOPMENT_OPERATION_NAV, adminPath);
}

/** IDs de stack técnica (front-end, back-end, banco-de-dados). */
export function developmentStackIdFromAdminPath(adminPath: string): string | null {
  const normalized = adminPath.replace(/^\/+/, "");
  const canonical = DEVELOPMENT_LEGACY_PATH_ALIASES[normalized] ?? normalized;
  const prefix = "operacao/desenvolvimento/";
  if (!canonical.startsWith(prefix)) return null;
  const id = canonical.slice(prefix.length);
  if (id === "estatistica" || id === "infra") return null;
  return id;
}
