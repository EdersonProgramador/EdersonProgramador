/** Marketing — navegação em seções (Analisar · Nutrir · Capturar · Configurações). */

import {
  findOperationSectionNavByAdminPath,
  operationSectionNavFlatItems,
  type OperationSectionNav,
  type OperationSectionNavItem
} from "./operation-pillar-section-nav.js";

export type MarketingNavItem = OperationSectionNavItem;
export type MarketingNavSection = OperationSectionNav;

export const MARKETING_OPERATION_NAV: readonly MarketingNavSection[] = [
  {
    id: "analisar",
    sectionLabel: "Analisar",
    items: [
      {
        id: "estatistica",
        label: "Estatística",
        adminPath: "operacao/marketing/estatistica",
        description: "Progresso do workspace, projeções e checklist de captação."
      }
    ]
  },
  {
    id: "nutrir",
    sectionLabel: "Nutrir",
    items: [
      {
        id: "sequencia",
        label: "Sequência",
        adminPath: "operacao/marketing/sequencia",
        description: "Blueprint de sequências (Leadlovers / automação FL)."
      },
      {
        id: "automacoes",
        label: "Automações",
        adminPath: "operacao/marketing/automacoes",
        description: "Gatilhos, tags e e-mails da régua de nutrição."
      },
      {
        id: "historico",
        label: "Histórico",
        adminPath: "operacao/marketing/historico",
        description: "Webhooks e eventos Hotmart, Kiwify, Leadlovers."
      }
    ]
  },
  {
    id: "planejar",
    sectionLabel: "Planejar",
    items: [
      {
        id: "planejamento",
        label: "Planejamento",
        adminPath: "operacao/marketing/planejamento",
        description: "Estratégia, funil e budget com gráficos a partir dos dados do cliente."
      }
    ]
  },
  {
    id: "capturar",
    sectionLabel: "Capturar",
    items: [
      {
        id: "paginas",
        label: "Páginas",
        adminPath: "operacao/marketing/paginas",
        description: "LP de captação publicada e templates hero."
      },
      {
        id: "formularios",
        label: "Formulários",
        adminPath: "operacao/marketing/formularios",
        description: "Conteúdo, SEO e aquecimento (checklist PPL)."
      },
      {
        id: "popups",
        label: "Pop-ups",
        adminPath: "operacao/marketing/popups",
        description: "Exit intent e overlays de captação."
      },
      {
        id: "contatos",
        label: "Contatos",
        adminPath: "operacao/marketing/contatos",
        description: "Leads e inscritos do lançamento."
      }
    ]
  },
  {
    id: "configuracoes",
    sectionLabel: "Configurações",
    items: [
      {
        id: "contas-envio",
        label: "Contas de envio",
        adminPath: "operacao/marketing/contas-envio",
        description: "Resend, webhooks e tokens de integração."
      },
      {
        id: "ajustes",
        label: "Ajustes do projeto",
        adminPath: "operacao/marketing/ajustes",
        description: "Produto, checkout e gateway."
      }
    ]
  }
] as const;

export function marketingNavFlatItems(): MarketingNavItem[] {
  return operationSectionNavFlatItems(MARKETING_OPERATION_NAV);
}

export function findMarketingNavByAdminPath(adminPath: string): {
  section: MarketingNavSection;
  item: MarketingNavItem;
} | null {
  return findOperationSectionNavByAdminPath(MARKETING_OPERATION_NAV, adminPath);
}

/** Rotas legadas ainda usadas pelo playbook. */
export const MARKETING_LEGACY_PATH_ALIASES: Record<string, string> = {
  "operacao/marketing/conteudo-seo": "operacao/marketing/formularios",
  "operacao/marketing/captacao-trafego": "operacao/marketing/automacoes",
  "operacao/produto-oferta": "operacao/marketing/ajustes",
  "operacao/launch-kit": "operacao/marketing/paginas"
};
