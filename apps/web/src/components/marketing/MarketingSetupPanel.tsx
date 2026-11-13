import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AGENCY_APP_BASE } from "@ederson-agencia/shared";
import { ApiError, apiGet, apiPost } from "../../api";

const ADMIN = `${AGENCY_APP_BASE}/admin`;

type SetupItem = { id: string; label: string; ok: boolean; detail: string };

type SetupReport = {
  ready: boolean;
  score: number;
  total: number;
  items: SetupItem[];
  missingTriggers?: string[];
};

type Props = {
  withProjectQuery: (path: string) => string;
};

export function MarketingSetupPanel({ withProjectQuery }: Props) {
  const [report, setReport] = useState<SetupReport | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    void apiGet<SetupReport>("/agency/admin/marketing/setup").then(setReport).catch(() => null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function bootstrap() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await apiPost<SetupReport & { message: string }>("/agency/admin/marketing/setup/bootstrap", {});
      setReport(res);
      setMsg(res.message);
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  if (!report) return null;

  const pct = report.total > 0 ? Math.round((report.score / report.total) * 100) : 0;

  return (
    <section className="panel space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--app-text)]">Instalação profissional</h2>
          <p className="text-sm text-[var(--app-text-muted)]">
            Prontidão operacional: <strong className="text-[var(--app-text)]">{pct}%</strong> ({report.score}/
            {report.total} itens obrigatórios)
            {report.ready ? (
              <span className="ml-2 text-emerald-400">· Sistema pronto para operar</span>
            ) : (
              <span className="ml-2 text-amber-400">· Complete os itens abaixo</span>
            )}
          </p>
        </div>
        <button type="button" className="btn-secondary text-sm" disabled={loading} onClick={() => void bootstrap()}>
          {loading ? "Instalando…" : "Instalar fluxos padrão"}
        </button>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {report.items.map((item) => (
          <li
            key={item.id}
            className={`rounded-lg border px-3 py-2 text-sm ${item.ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}
          >
            <div className="font-medium text-[var(--app-text)]">{item.label}</div>
            <div className="text-xs text-[var(--app-text-muted)]">{item.detail}</div>
          </li>
        ))}
      </ul>
      {report.missingTriggers && report.missingTriggers.length > 0 ? (
        <p className="text-xs text-[var(--app-text-muted)]">
          Triggers sem automação ativa: {report.missingTriggers.join(", ")}. Ajuste em{" "}
          <Link className="text-emerald-400 hover:underline" to={withProjectQuery(`${ADMIN}/automacoes`)}>
            Automações
          </Link>
          .
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="text-emerald-400 hover:underline" to={withProjectQuery(`${ADMIN}/marketing/cdp`)}>
          CDP
        </Link>
        <Link className="text-emerald-400 hover:underline" to={withProjectQuery(`${ADMIN}/automacoes`)}>
          Automações
        </Link>
        <Link className="text-emerald-400 hover:underline" to={withProjectQuery(`${ADMIN}/marketing/campanhas`)}>
          Campanhas
        </Link>
        <Link className="text-emerald-400 hover:underline" to={withProjectQuery(`${ADMIN}/marketing/integracoes`)}>
          Integrações
        </Link>
      </div>
      {msg ? <p className="text-sm text-[var(--app-text-muted)]">{msg}</p> : null}
    </section>
  );
}
