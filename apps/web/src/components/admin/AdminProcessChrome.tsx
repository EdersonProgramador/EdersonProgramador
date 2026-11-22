import { Link, useLocation } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  ADMIN_COMERCIAL_STEPS,
  adminComercialStepLabel,
  findAdminNavByAdminPath,
  findBrandingOperationNavContext,
  findDevelopmentOperationNavContext,
  findFormulaOperationNavContext,
  findMarketingOperationNavContext
} from "@ederson-agencia/shared";
import { useAdminProjectScope } from "./admin-project-scope";

const ADMIN = `${AGENCY_APP_BASE}/admin`;

function useAdminRelativePath() {
  const location = useLocation();
  return location.pathname.replace(new RegExp(`^${ADMIN}/?`), "").replace(/\/$/, "");
}

/** Breadcrumb global do admin (todas as páginas sob o shell). */
export function AdminProcessBreadcrumb() {
  const { withProjectQuery } = useAdminProjectScope();
  const relative = useAdminRelativePath();
  const ctx = findAdminNavByAdminPath(relative);

  const pillar =
    findBrandingOperationNavContext(relative) ??
    findDevelopmentOperationNavContext(relative) ??
    findFormulaOperationNavContext(relative) ??
    findMarketingOperationNavContext(relative);

  const showPillarDetail =
    pillar &&
    (!ctx?.link.adminPath ||
      relative !== ctx.link.adminPath ||
      ctx.block.id === "operacoes");

  return (
    <nav className="admin-process__crumb mb-3" aria-label="Processo">
      <Link to={withProjectQuery(ADMIN)} className="admin-process__crumb-link">
        Amplifica CRM
      </Link>
      {ctx ? (
        <>
          <span className="admin-process__crumb-sep" aria-hidden>
            /
          </span>
          <span className="admin-process__crumb-current">{ctx.block.label}</span>
          {ctx.link.adminPath && ctx.link.id !== "inicio" ? (
            <>
              <span className="admin-process__crumb-sep" aria-hidden>
                /
              </span>
              <span className="admin-process__crumb-current">
                {ctx.link.stepNumber ? adminComercialStepLabel(ctx.link) : ctx.link.label}
              </span>
            </>
          ) : null}
        </>
      ) : relative ? (
        <>
          <span className="admin-process__crumb-sep" aria-hidden>
            /
          </span>
          <span className="admin-process__crumb-current">{relative}</span>
        </>
      ) : null}
      {showPillarDetail && pillar ? (
        <>
          <span className="admin-process__crumb-sep" aria-hidden>
            /
          </span>
          <span className="admin-process__crumb-current">
            {pillar.sectionLabel} · {pillar.itemLabel}
          </span>
        </>
      ) : null}
    </nav>
  );
}

export function AdminProcessChrome({
  title,
  description,
  children,
  showBreadcrumb = false
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Quando true, renderiza crumb local (layout já tem o global por padrão). */
  showBreadcrumb?: boolean;
}) {
  const { withProjectQuery } = useAdminProjectScope();
  const relative = useAdminRelativePath();
  const isComercial = relative === "comercial" || relative.startsWith("comercial/");

  return (
    <div className="admin-process space-y-5">
      {showBreadcrumb ? <AdminProcessBreadcrumb /> : null}

      {isComercial ? (
        <ol className="admin-process__steps">
          {ADMIN_COMERCIAL_STEPS.map((step) => {
            const active = relative === step.adminPath || relative.startsWith(`${step.adminPath}/`);
            return (
              <li key={step.id}>
                <Link
                  to={withProjectQuery(`${ADMIN}/${step.adminPath}`)}
                  className={`admin-process__step${active ? " is-active" : ""}`}
                >
                  <span className="admin-process__step-num">{step.stepNumber}</span>
                  <span className="admin-process__step-label">{step.label}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : null}

      <header className="admin-process__head">
        <h1 className="admin-process__title">{title}</h1>
        {description ? <p className="admin-process__desc">{description}</p> : null}
      </header>

      {children}
    </div>
  );
}
