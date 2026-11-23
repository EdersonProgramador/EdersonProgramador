export type AuthContext = "agency" | "academy";

type AgencyRole = "ADMIN" | "CLIENT" | "FREELANCER";

/** Login único da Agência (admin, cliente e freelancer — destino por `role`). */
export const AGENCY_OPERATION_LOGIN_PATH = "/login";
/** Legado — redireciona para `/login`. */
export const AGENCY_CLIENT_LOGIN_PATH = AGENCY_OPERATION_LOGIN_PATH;
export const AGENCY_FREELANCER_LOGIN_PATH = AGENCY_OPERATION_LOGIN_PATH;

/** Prefixos de URL — Agência e Academia são apps internos separados. */
export const AGENCY_APP_BASE = "/agencia";
export const ACADEMY_APP_BASE = "/academia";
/** Vitrine pública de vendas — fora da área logada (/academia). */
export const ACADEMY_STORE_BASE = "/cursos";
/** Escolha de destino quando há sessão Agência e/ou Academia (tokens separados). */
export const ACCOUNT_HUB_PATH = "/conta";
/** Legado de rotas React (redireciona para o CRM). */
export const AGENCY_ACADEMY_OPS_BASE = `${AGENCY_APP_BASE}/admin/academia`;
/** Path do CRM sob o Vite da agência (base do app CRM). */
export const AGENCY_CRM_BASE = `${AGENCY_APP_BASE}/admin`;
/** Academia operacional — sempre dentro do CRM (não usar páginas /admin/academia/*). */
export const AGENCY_CRM_ACADEMY_VIEW = `${AGENCY_CRM_BASE}/?view=academy`;
/** Análise interna — aba do CRM Academia. */
export const ACADEMY_VITRINE_PATH = `${AGENCY_CRM_BASE}/?view=academy&academyTab=analysis`;

export function agencyCrmAcademyContentPath(courseId: string): string {
  const q = new URLSearchParams({ view: "academy", academyCourseId: courseId });
  return `${AGENCY_CRM_BASE}/?${q.toString()}`;
}

export function academyVitrineCoursePath(courseSlug: string): string {
  const slug = courseSlug.replace(/^\/+|\/+$/g, "");
  return `${ACADEMY_VITRINE_PATH}/${encodeURIComponent(slug)}`;
}

export function academyCourseCheckoutPath(courseSlug: string): string {
  const slug = courseSlug.replace(/^\/+|\/+$/g, "");
  return `${ACADEMY_STORE_BASE}/${encodeURIComponent(slug)}/comprar`;
}
/** Gestão de cursos (admin) — view Academia no CRM. */
export const ACADEMY_ADMIN_COURSES_BASE = AGENCY_CRM_ACADEMY_VIEW;
export const AGENCY_PROFILE_PATH = `${AGENCY_APP_BASE}/perfil`;
export const ACADEMY_PROFILE_PATH = `${ACADEMY_APP_BASE}/perfil`;

/** Portal do cliente da agência (distinto do CRM interno `/agencia/admin`). */
export const AGENCY_CLIENT_PORTAL_BASE = `${AGENCY_APP_BASE}/cliente`;
export const AGENCY_CLIENT_PORTAL_PROJECT_PATH = `${AGENCY_CLIENT_PORTAL_BASE}/projeto`;
export const AGENCY_CLIENT_PORTAL_SUPPORT_PATH = `${AGENCY_CLIENT_PORTAL_BASE}/suporte`;
/** Contratação (planos Amplifica + funil) dentro do portal do cliente. */
export const AGENCY_CLIENT_PORTAL_CONTRACT_PATH = `${AGENCY_CLIENT_PORTAL_BASE}/contratar`;
/** Alias usado em CTAs legados e links operacionais. */
export const AGENCY_CLIENT_FUNNEL_PATH = AGENCY_CLIENT_PORTAL_CONTRACT_PATH;

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
  return context === "academy" ? "/academia/entrar" : AGENCY_OPERATION_LOGIN_PATH;
}

export function loginPathForProtectedRealm(realm: AuthContext): string {
  return loginPathForContext(realm);
}

/** Destino após logout voluntário — home da agência ou vitrine de cursos. */
export function logoutHomePathForContext(context: AuthContext = "agency"): string {
  return context === "academy" ? ACADEMY_STORE_BASE : "/";
}

/** Sistema da agência (CRM / operação) — app em página cheia (sem iframe). */
export const AGENCY_SYSTEM_HOME = `${AGENCY_CRM_BASE}/?view=dashboard`;

export function agencyHomePathForRole(role: AgencyRole): string {
  switch (role) {
    case "ADMIN":
      return AGENCY_SYSTEM_HOME;
    case "FREELANCER":
      return `${AGENCY_APP_BASE}/freelancer`;
    case "CLIENT":
    default:
      return AGENCY_CLIENT_PORTAL_BASE;
  }
}

export function homePathAfterLogin(role: AgencyRole, context: AuthContext): string {
  if (context === "academy") return ACADEMY_APP_BASE;
  // ADMIN → CRM; CLIENT / FREELANCER → áreas do portal web.
  return agencyHomePathForRole(role);
}

const LOGIN_PATHS = new Set([AGENCY_OPERATION_LOGIN_PATH, "/academia/entrar", "/cliente/entrar", "/freelancer/entrar"]);

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
  if (pathname.startsWith(AGENCY_ACADEMY_OPS_BASE)) return "agency";
  if (pathname.startsWith(ACADEMY_APP_BASE)) return "academy";
  if (
    pathname.startsWith(AGENCY_APP_BASE) ||
    pathname === AGENCY_OPERATION_LOGIN_PATH ||
    pathname === AGENCY_CLIENT_LOGIN_PATH ||
    pathname === AGENCY_FREELANCER_LOGIN_PATH
  ) {
    return "agency";
  }
  return null;
}

export type AuthRouteState = {
  from?: string;
  needAgency?: boolean;
  needAcademy?: boolean;
};
