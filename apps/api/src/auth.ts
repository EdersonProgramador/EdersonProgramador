import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { FastifyRequest } from "fastify";
import type { AgencyRole, AuthContext, AuthUser } from "@ederson-agencia/shared";

const scrypt = promisify(scryptCallback);
const keyLength = 64;

export type AuthTokenPayload = AuthUser & { authContext?: AuthContext };

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, keyLength)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string | null | undefined): Promise<boolean> {
  if (!passwordHash) return false;
  const [salt, storedKey] = passwordHash.split(":");
  if (!salt || !storedKey) return false;
  const storedBuffer = Buffer.from(storedKey, "hex");
  const derivedKey = (await scrypt(password, salt, storedBuffer.length)) as Buffer;
  return timingSafeEqual(storedBuffer, derivedKey);
}

export function toAuthUser(
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    company?: string | null;
    github?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
  },
  authContext: AuthContext
): AuthTokenPayload {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as AgencyRole,
    company: user.company,
    github: user.github,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    authContext: authContext
  };
}

export async function getAuthUser(request: FastifyRequest): Promise<AuthTokenPayload | null> {
  try {
    await request.jwtVerify();
    return request.user as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function requireRole(user: AuthTokenPayload | null, roles: AgencyRole[]): asserts user is AuthTokenPayload {
  if (!user || !roles.includes(user.role)) {
    throw Object.assign(new Error("Acesso negado."), { statusCode: 403 });
  }
}
