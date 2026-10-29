import type { AgencyRole, AuthContext } from "@ederson-agencia/shared";
import { canAccessAcademy, canAccessAgency, isAcademyInternalAdmin } from "@ederson-agencia/shared";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthTokenPayload } from "./auth.js";
import { getAuthUser } from "./auth.js";
import { prisma } from "./prisma.js";

export async function userHasActiveEnrollment(userId: string): Promise<boolean> {
  const count = await prisma.courseEnrollment.count({
    where: { userId, status: "ACTIVE" }
  });
  return count > 0;
}

const ACADEMY_STORE_CUSTOMER_MARKER = "__academy_store__";

export function isAcademyStoreCustomer(company: string | null | undefined): boolean {
  return company === ACADEMY_STORE_CUSTOMER_MARKER;
}

export async function assertEligibleForAcademyLogin(
  userId: string,
  role: AgencyRole,
  company?: string | null,
  email?: string
): Promise<void> {
  if (email && isAcademyInternalAdmin({ role, email })) return;
  if (isAcademyStoreCustomer(company)) return;
  const ok = await userHasActiveEnrollment(userId);
  if (!ok) {
    throw Object.assign(
      new Error("Acesso à Academia restrito. Solicite matrícula ao administrador."),
      { statusCode: 403 }
    );
  }
}

export function assertAgencySession(user: AuthTokenPayload): void {
  if (!canAccessAgency(user)) {
    throw Object.assign(
      new Error("Use o login da Agência (Área do cliente) para acessar projetos e operação."),
      { statusCode: 403 }
    );
  }
}

export function assertAcademySession(user: AuthTokenPayload): void {
  if (!canAccessAcademy(user)) {
    throw Object.assign(
      new Error("Use o login da Academia para acessar os cursos."),
      { statusCode: 403 }
    );
  }
}

export function assertAcademyInternalAdmin(user: { email: string; role: AgencyRole }): void {
  if (!isAcademyInternalAdmin(user)) {
    throw Object.assign(
      new Error("Acesso restrito ao administrador de cursos internos."),
      { statusCode: 403 }
    );
  }
}

export async function requireAcademyUser(request: FastifyRequest, reply: FastifyReply) {
  const user = await getAuthUser(request);
  if (!user) {
    reply.code(401).send({ message: "Faça login na Academia para acessar os cursos." });
    return null;
  }
  try {
    assertAcademySession(user);
  } catch (error) {
    reply.code((error as { statusCode?: number }).statusCode ?? 403).send({ message: (error as Error).message });
    return null;
  }
  return user;
}
