export type AuthContext = "agency" | "academy";

type AgencyRole = "ADMIN" | "CLIENT" | "FREELANCER";

/** Prefixos de URL — Agência e Academia são apps internos separados. */
export const AGENCY_APP_BASE = "/agencia";
export const ACADEMY_APP_BASE = "/academia";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AgencyRole;
  company?: string | null;
  github?: string | null;
  authContext: AuthContext;
};

export function canAccessAgency(user: Pick<SessionUser, "role"> & { authContext?: AuthContext }): boolean {
  if (user.role === "ADMIN") return true;
  const ctx = user.authContext ?? "agency";
  return ctx === "agency";
}

export function canAccessAcademy(user: Pick<SessionUser, "role"> & { authContext?: AuthContext }): boolean {
  if (user.role === "ADMIN") return true;
  return user.authContext === "academy";
}

export function loginPathForContext(context: AuthContext = "agency"): string {
  return context === "academy" ? "/academia/entrar" : "/login";
}

export function agencyHomePathForRole(role: AgencyRole): string {
  switch (role) {
    case "ADMIN":
      return `${AGENCY_APP_BASE}/admin`;
    case "FREELANCER":
      return `${AGENCY_APP_BASE}/freelancer`;
    case "CLIENT":
    default:
      return `${AGENCY_APP_BASE}/cliente`;
  }
}

export function homePathAfterLogin(role: AgencyRole, context: AuthContext): string {
  if (context === "academy") return ACADEMY_APP_BASE;
  return agencyHomePathForRole(role);
}
