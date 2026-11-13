import { PACKAGE_TIER_IDS, packageTierLabel } from "./project-journey.js";

/** Fontes conhecidas de lead (CDP / campanhas). */
export const MARKETING_LEAD_SOURCE_OPTIONS = [
  { id: "", label: "Todas as fontes" },
  { id: "landing", label: "Landing principal" },
  { id: "lead_popup", label: "Popup do funil" },
  { id: "academy_sales", label: "Academia / cursos" },
  { id: "launch_lp", label: "LP de lançamento" },
  { id: "client_hire", label: "Contratação (funil)" },
  { id: "lead_convert", label: "Conversão manual de lead" },
  { id: "client_account", label: "Conta de cliente" },
  { id: "loyalty", label: "Programa de fidelidade" },
  { id: "admin_project", label: "Projeto criado pelo admin" }
] as const;

export function marketingAudienceTierOptions() {
  return [
    { id: "", label: "Todos os pacotes" },
    ...PACKAGE_TIER_IDS.map((id) => ({ id, label: packageTierLabel(id) }))
  ];
}
