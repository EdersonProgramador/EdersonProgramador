/** Marketing — mesmas faixas Agency Ops (marketingagencyops pattern). */

import {
  agencyOpsDefaultAdminPath,
  agencyOpsLaneAdminPath,
  buildAgencyOpsLaneNavSections
} from "./agency-ops-process-lanes.js";
import {
  findOperationSectionNavByAdminPath,
  operationSectionNavFlatItems,
  type OperationSectionNav,
  type OperationSectionNavItem
} from "./operation-pillar-section-nav.js";

export type MarketingNavItem = OperationSectionNavItem;
export type MarketingNavSection = OperationSectionNav;

export const MARKETING_OPERATION_NAV: readonly MarketingNavSection[] = [
  ...buildAgencyOpsLaneNavSections("marketing")
] as unknown as readonly MarketingNavSection[];

export function marketingNavFlatItems(): MarketingNavItem[] {
  return operationSectionNavFlatItems(MARKETING_OPERATION_NAV);
}

export function findMarketingNavByAdminPath(adminPath: string): {
  section: MarketingNavSection;
  item: MarketingNavItem;
} | null {
  return findOperationSectionNavByAdminPath(MARKETING_OPERATION_NAV, adminPath);
}

export const MARKETING_LEGACY_PATH_ALIASES: Record<string, string> = {
  leads: "comercial/captura",
  "marketing/cdp": "comercial/captura",
  "marketing/campanhas": "comercial/nutricao",
  "marketing/crm": agencyOpsLaneAdminPath("marketing", "pipeline"),
  funil: agencyOpsLaneAdminPath("marketing", "pipeline"),
  clientes: "comercial/relacionamento",
  "marketing/fidelidade": "comercial/relacionamento",
  "operacao/marketing/estatistica": agencyOpsDefaultAdminPath("marketing"),
  "operacao/marketing/planejamento": agencyOpsLaneAdminPath("marketing", "entrega"),
  "operacao/marketing/sequencia": agencyOpsLaneAdminPath("marketing", "entrega"),
  "operacao/marketing/automacoes": "automacoes",
  "operacao/marketing/captacao-trafego": agencyOpsLaneAdminPath("marketing", "pipeline"),
  "operacao/marketing/conteudo-seo": agencyOpsLaneAdminPath("marketing", "entrega"),
  "operacao/marketing/paginas": agencyOpsLaneAdminPath("marketing", "entrega"),
  "operacao/marketing/formularios": agencyOpsLaneAdminPath("marketing", "pipeline"),
  "operacao/marketing/popups": agencyOpsLaneAdminPath("marketing", "pipeline"),
  "operacao/marketing/contatos": agencyOpsLaneAdminPath("marketing", "pipeline"),
  "operacao/marketing/historico": agencyOpsLaneAdminPath("marketing", "relatorios")
};
