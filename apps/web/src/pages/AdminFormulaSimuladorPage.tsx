import {
  computeLaunchRevenueProjection,
  findFormulaOperationNavContext,
  FORMULA_SIMULATOR_FIELDS,
  formulaSimulatorProgress
} from "@ederson-agencia/shared";
import { AdminWorkspaceFieldsPage } from "../components/admin/AdminWorkspaceFieldsPage";
import { WorkspaceBarChart } from "../components/admin/WorkspaceBarChart";

export function AdminFormulaSimuladorPage() {
  const navCtx = findFormulaOperationNavContext("operacao/formula-lancamento/simulador");

  return (
    <AdminWorkspaceFieldsPage
      sections={[
        {
          id: "sim",
          title: "Premissas do lançamento",
          intro: "Lista, conversões e ticket — gera cenários conservador, base e agressivo.",
          fields: [...FORMULA_SIMULATOR_FIELDS]
        }
      ]}
      computeProgress={formulaSimulatorProgress}
      header={
        <header className="agency-admin-page-head">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-200">
            {navCtx ? (
              <>
                {navCtx.pillarLabel} · {navCtx.sectionLabel} · {navCtx.itemLabel}
              </>
            ) : (
              "Fórmula de Lançamento"
            )}
          </p>
          <h1>Simulador de receita</h1>
          <p>Projeção de faturamento do lançamento a partir dos números do projeto.</p>
        </header>
      }
      renderAnalytics={(data) => {
        const sim = computeLaunchRevenueProjection(data);
        return (
          <div className="space-y-4">
            <WorkspaceBarChart title="Faturamento por cenário" bars={sim.chart} />
            <div className="panel overflow-x-auto p-4 sm:p-5">
              <table className="w-full min-w-[20rem] text-left text-sm">
                <thead>
                  <tr className="text-xs text-[var(--app-text-muted)]">
                    <th className="pb-2 pr-4">Cenário</th>
                    <th className="pb-2 pr-4">Na live</th>
                    <th className="pb-2 pr-4">Compradores</th>
                    <th className="pb-2 pr-4">Receita</th>
                    <th className="pb-2">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {sim.scenarios.map((row) => (
                    <tr key={row.id} className="border-t border-[var(--app-border)]">
                      <td className="py-2 pr-4 font-medium">{row.label}</td>
                      <td className="py-2 pr-4">{row.leads.toLocaleString("pt-BR")}</td>
                      <td className="py-2 pr-4">{row.buyers.toLocaleString("pt-BR")}</td>
                      <td className="py-2 pr-4 font-mono">R$ {row.revenue.toLocaleString("pt-BR")}</td>
                      <td className="py-2">{row.roas != null ? row.roas.toFixed(2) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }}
    />
  );
}
