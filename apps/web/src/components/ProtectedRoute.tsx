import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import type { AgencyRole, AuthContext } from "@ederson-agencia/shared";
import {
  ACADEMY_APP_BASE,
  AGENCY_APP_BASE,
  agencyHomePathForRole,
  canAccessAcademy,
  canAccessAgency,
  isAcademyInternalAdmin,
  loginPathForContext
} from "@ederson-agencia/shared";
import { useAcademySession, useAgencySession, useAuthStore } from "../stores/authStore";

export function ProtectedRoute({
  roles,
  realm,
  internalAdminOnly
}: {
  roles?: AgencyRole[];
  realm: AuthContext;
  internalAdminOnly?: boolean;
}) {
  const booting = useAuthStore((s) => s.booting);
  const agencySession = useAgencySession();
  const academySession = useAcademySession();
  const location = useLocation();

  const session = realm === "agency" ? agencySession : academySession;
  const user = session?.user;

  if (booting) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--app-text-muted)]">
        Carregando sessão…
      </div>
    );
  }

  const returnTo = `${location.pathname}${location.search}`;

  if (!user) {
    return <Navigate to={loginPathForContext(realm)} replace state={{ from: returnTo }} />;
  }

  if (realm === "agency" && !canAccessAgency(user)) {
    return <Navigate to="/academia/entrar" replace state={{ from: returnTo, needAgency: true }} />;
  }

  if (realm === "academy" && !canAccessAcademy(user)) {
    return <Navigate to="/login" replace state={{ from: returnTo, needAcademy: true }} />;
  }

  if (roles && !roles.includes(user.role)) {
    const fallback = realm === "agency" ? agencyHomePathForRole(user.role) : ACADEMY_APP_BASE;
    return <Navigate to={fallback} replace />;
  }

  if (internalAdminOnly && !isAcademyInternalAdmin(user)) {
    return <Navigate to={ACADEMY_APP_BASE} replace />;
  }

  return <Outlet />;
}

/** Redireciona /agencia para o painel do papel. */
export function AgencyHomeRedirect() {
  const session = useAgencySession();
  if (!session?.user) return <Navigate to="/login" replace />;
  return <Navigate to={agencyHomePathForRole(session.user.role)} replace />;
}

/** /app/projetos/:id → /agencia/projetos/:id */
export function LegacyProjectRedirect() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return <Navigate to={AGENCY_APP_BASE} replace />;
  return <Navigate to={`${AGENCY_APP_BASE}/projetos/${projectId}`} replace />;
}

/** /app/cursos/* → /academia/cursos/* */
export function LegacyAcademyCursosRedirect() {
  const { "*": rest } = useParams<{ "*": string }>();
  const suffix = rest ? `/${rest.replace(/^\//, "")}` : "";
  return <Navigate to={`${ACADEMY_APP_BASE}/cursos${suffix}`} replace />;
}

/** /app/admin/cursos/* e /agencia/admin/cursos/* → /academia/admin/cursos/* */
export function LegacyAcademyAdminCursosRedirect() {
  const { "*": rest } = useParams<{ "*": string }>();
  const suffix = rest ? `/${rest.replace(/^\//, "")}` : "";
  return <Navigate to={`${ACADEMY_APP_BASE}/admin/cursos${suffix}`} replace />;
}
