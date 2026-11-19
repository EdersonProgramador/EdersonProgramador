export type AuthContext = "agency" | "academy";

type AgencyRole = "ADMIN" | "CLIENT" | "FREELANCER";

/** Prefixos de URL — Agência e Academia são apps internos separados. */
export const AGENCY_APP_BASE = "/agencia";
export const ACADEMY_APP_BASE = "/academia";
/** Vitrine pública de vendas — fora da área logada (/academia). */
export const ACADEMY_STORE_BASE = "/cursos";

export function academyCourseCheckoutPath(courseSlug: string): string {
  const slug = courseSlug.replace(/^\/+|\/+$/g, "");
  return `${ACADEMY_STORE_BASE}/${encodeURIComponent(slug)}/comprar`;
}
/** Gestão de cursos (admin) — sempre dentro da Academia. */
export const ACADEMY_ADMIN_COURSES_BASE = `${ACADEMY_APP_BASE}/admin/cursos`;
export const AGENCY_PROFILE_PATH = `${AGENCY_APP_BASE}/perfil`;
export const ACADEMY_PROFILE_PATH = `${ACADEMY_APP_BASE}/perfil`;

/** Marcador em `User.company` para clientes criados pela vitrine (/cursos). */
export const ACADEMY_STORE_CUSTOMER_MARKER = "__academy_store__";

export function isAcademyStoreCustomer(company: string | null | undefined): boolean {
  return company === ACADEMY_STORE_CUSTOMER_MARKER;
}

/** Único admin que pode ver e gerenciar cursos com visibilidade INTERNAL. */
export const ACADEMY_INTERNAL_ADMIN_EMAIL = "edersonprogramador@gmail.com";

export function isAcademyInternalAdmin(user: Pick<SessionUser, "email" | "role">): boolean {
  return (
    user.role === "ADMIN" &&
    user.email.trim().toLowerCase() === ACADEMY_INTERNAL_ADMIN_EMAIL.toLowerCase()
  );
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AgencyRole;
  company?: string | null;
  github?: string | null;
  phone?: string | null;
  authContext: AuthContext;
};

export function canAccessAgency(user: Pick<SessionUser, "role"> & { authContext?: AuthContext }): boolean {
  const ctx = user.authContext ?? "agency";
  return ctx === "agency";
}

export function canAccessAcademy(user: Pick<SessionUser, "role"> & { authContext?: AuthContext }): boolean {
  const ctx = user.authContext ?? "agency";
  return ctx === "academy";
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

const LOGIN_PATHS = new Set(["/login", "/academia/entrar"]);

/** Evita open redirect — só rotas internas do app daquele contexto. */
export function sanitizeReturnPath(
  raw: string | undefined | null,
  context: AuthContext
): string | null {
  if (!raw?.trim()) return null;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (LOGIN_PATHS.has(path.split("?")[0] ?? path)) return null;
  const base = context === "academy" ? ACADEMY_APP_BASE : AGENCY_APP_BASE;
  const pathname = path.split("?")[0] ?? path;
  if (pathname === base || pathname.startsWith(`${base}/`)) return path;
  if (context === "academy" && (pathname === ACADEMY_STORE_BASE || pathname.startsWith(`${ACADEMY_STORE_BASE}/`))) {
    return path;
  }
  return null;
}

/** Após login: volta para a URL pretendida ou painel padrão do papel. */
export function resolvePostLoginPath(
  role: AgencyRole,
  context: AuthContext,
  returnPath?: string | null
): string {
  return sanitizeReturnPath(returnPath, context) ?? homePathAfterLogin(role, context);
}

export function inferAuthContextFromPath(pathname: string): AuthContext | null {
  if (pathname.startsWith(ACADEMY_APP_BASE)) return "academy";
  if (pathname.startsWith(AGENCY_APP_BASE) || pathname === "/login") return "agency";
  return null;
}

export type AuthRouteState = {
  from?: string;
  needAgency?: boolean;
  needAcademy?: boolean;
};
