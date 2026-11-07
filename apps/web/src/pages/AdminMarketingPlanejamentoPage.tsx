import {
  findMarketingOperationNavContext,
  MARKETING_PLANEJAMENTO_SECTIONS,
  marketingBudgetChart,
  marketingPlanejamentoProgress
} from "@ederson-agencia/shared";
import { AdminWorkspaceFieldsPage } from "../components/admin/AdminWorkspaceFieldsPage";
import { WorkspaceBarChart } from "../components/admin/WorkspaceBarChart";

export function AdminMarketingPlanejamentoPage() {
  const navCtx = findMarketingOperationNavContext("operacao/marketing/planejamento");

  return (
    <AdminWorkspaceFieldsPage
      sections={MARKETING_PLANEJAMENTO_SECTIONS}
      computeProgress={marketingPlanejamentoProgress}
      header={
        <header className="agency-admin-page-head">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-300">
            {navCtx ? (
              <>
                {navCtx.pillarLabel} · {navCtx.sectionLabel} · {navCtx.itemLabel}
              </>
            ) : (
              "Marketing"
            )}
          </p>
          <h1>Planejamento de campanha</h1>
          <p>Estratégia, funil e budget — dados que alimentam execução e projeções.</p>
        </header>
      }
      renderAnalytics={(data) => (
        <WorkspaceBarChart
          title="Projeção de budget por canal"
          bars={marketingBudgetChart(data)}
          emptyHint="Adicione linhas em Canais e verba ou informe o budget total."
        />
      )}
    />
  );
}
