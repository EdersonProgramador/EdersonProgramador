export type AuthContext = "agency" | "academy";

type AgencyRole = "ADMIN" | "CLIENT" | "FREELANCER";

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

export function homePathAfterLogin(role: AgencyRole, context: AuthContext): string {
  if (context === "academy") return "/app/cursos";
  switch (role) {
    case "ADMIN":
      return "/app/admin";
    case "FREELANCER":
      return "/app/freelancer";
    case "CLIENT":
    default:
      return "/app/cliente";
  }
}
