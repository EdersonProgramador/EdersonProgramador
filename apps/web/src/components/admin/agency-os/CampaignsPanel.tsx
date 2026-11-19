import { Link } from "react-router-dom";
import { AGENCY_APP_BASE } from "@ederson-agencia/shared";

const ADMIN = `${AGENCY_APP_BASE}/admin`;

export function CampaignsPanel({
  campaignsActive,
  enrollmentsDue,
  withProjectQuery,
  onProcessDue,
  busy,
  msg
}: {
  campaignsActive: number;
  enrollmentsDue: number;
  withProjectQuery: (path: string) => string;
  onProcessDue: () => void;
  busy: boolean;
  msg: string | null;
}) {
  return (
    <section className="agency-os-panel">
      <header className="agency-os-panel__head">
        <h2>Campanhas</h2>
        <p>Nutrição drip e disparos — agentes Campaign runner geram sequências.</p>
      </header>
      <div className="agency-os-camp-kpis">
        <div>
          <span className="agency-os-kpi-label">Ativas / drip</span>
          <strong>{campaignsActive}</strong>
        </div>
        <div>
          <span className="agency-os-kpi-label">Disparos vencidos</span>
          <strong>{enrollmentsDue}</strong>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link className="btn-primary" to={withProjectQuery(`${ADMIN}/comercial/nutricao`)}>
          Abrir Nutrição
        </Link>
        <button type="button" className="btn-secondary" disabled={busy} onClick={onProcessDue}>
          Processar fila
        </button>
      </div>
      {msg ? <p className="mt-2 text-sm text-[var(--app-text-muted)]">{msg}</p> : null}
    </section>
  );
}
