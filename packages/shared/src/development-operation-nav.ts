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
    id: "stack",
    sectionLabel: "Stack",
    items: [
      {
        id: "stack-visao",
        label: "Visão geral",
        adminPath: "operacao/desenvolvimento/stack",
        description: "Panorama e notas da decisão técnica antes do build."
      },
      {
        id: "stack-front-end",
        label: "Front-end",
        adminPath: "operacao/desenvolvimento/stack-front-end",
        description: "Framework e entrega da interface (LP, checkout, área de membros)."
      },
      {
        id: "stack-back-end",
        label: "Back-end",
        adminPath: "operacao/desenvolvimento/stack-back-end",
        description: "Runtime da API, auth e integrações."
      },
      {
        id: "stack-dados",
        label: "Dados & cache",
        adminPath: "operacao/desenvolvimento/stack-dados",
        description: "Banco principal, cache e filas."
      },
      {
        id: "stack-infra",
        label: "Infra & deploy",
        adminPath: "operacao/desenvolvimento/stack-infra",
        description: "Hospedagem, CDN e pipeline de deploy."
      },
      {
        id: "stack-automacao",
        label: "Automação & filas",
        adminPath: "operacao/desenvolvimento/stack-automacao",
        description: "Webhooks, jobs e orquestração."
      },
      {
        id: "stack-pagamentos",
        label: "Pagamentos",
        adminPath: "operacao/desenvolvimento/stack-pagamentos",
        description: "Gateway e checkout do lançamento."
      },
      {
        id: "stack-email",
        label: "E-mail transacional",
        adminPath: "operacao/desenvolvimento/stack-email",
        description: "Provedor de envio PPL/CPL/carrinho."
      }
    ]
  },
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
  if (id === "estatistica" || id === "infra" || id === "stack" || id.startsWith("stack-")) return null;
  return id;
}
