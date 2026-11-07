import { createHash, createHmac, randomBytes } from "node:crypto";
import {
  CANVA_INTEGRATION_FIELD_IDS,
  CANVA_OAUTH_AUTHORIZE_URL,
  CANVA_OAUTH_SCOPES,
  CANVA_OAUTH_TOKEN_URL,
  CANVA_API_BASE,
  type BrandingWorkspaceData
} from "@ederson-agencia/shared";
import { env } from "../env.js";

export type CanvaEnvConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export function canvaEnvConfig(): CanvaEnvConfig | null {
  const clientId = env.CANVA_CLIENT_ID?.trim();
  const clientSecret = env.CANVA_CLIENT_SECRET?.trim();
  const redirectUri = (env.CANVA_REDIRECT_URI ?? "").trim() || undefined;
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    redirectUri: redirectUri ?? `${env.API_PUBLIC_URL.replace(/\/$/, "")}/agency/canva/oauth/callback`
  };
}

export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function signCanvaOAuthState(payload: { projectId: string; userId: string; exp: number }): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", env.JWT_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyCanvaOAuthState(state: string): { projectId: string; userId: string; exp: number } | null {
  const [body, sig] = state.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", env.JWT_SECRET).update(body).digest("base64url");
  if (sig !== expected) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      projectId: string;
      userId: string;
      exp: number;
    };
    if (!parsed.projectId || !parsed.userId || typeof parsed.exp !== "number") return null;
    if (Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildCanvaAuthorizeUrl(cfg: CanvaEnvConfig, challenge: string, state: string): string {
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: CANVA_OAUTH_SCOPES.join(" "),
    code_challenge: challenge,
    code_challenge_method: "S256",
    state
  });
  return `${CANVA_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
};

async function postCanvaToken(body: URLSearchParams, clientId: string, clientSecret: string): Promise<TokenResponse> {
  const auth = Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString("base64");
  const res = await fetch(CANVA_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });
  if (!res.ok) {
    const text = await res.text();
    throw Object.assign(new Error(`Canva token: ${res.status} ${text.slice(0, 200)}`), { statusCode: 502 });
  }
  return (await res.json()) as TokenResponse;
}

export async function exchangeCanvaAuthorizationCode(
  cfg: CanvaEnvConfig,
  code: string,
  verifier: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: cfg.redirectUri,
    code_verifier: verifier
  });
  return postCanvaToken(body, cfg.clientId, cfg.clientSecret);
}

export async function refreshCanvaAccessToken(cfg: CanvaEnvConfig, refreshToken: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });
  return postCanvaToken(body, cfg.clientId, cfg.clientSecret);
}

export async function fetchCanvaUserProfile(accessToken: string): Promise<{ display_name?: string } | null> {
  const res = await fetch(`${CANVA_API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { profile?: { display_name?: string } };
  return json.profile ?? null;
}

export function canvaTokenFieldsFromOAuth(token: TokenResponse, profileName?: string): BrandingWorkspaceData {
  const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();
  const fields: BrandingWorkspaceData = {
    [CANVA_INTEGRATION_FIELD_IDS.accessToken]: token.access_token,
    [CANVA_INTEGRATION_FIELD_IDS.expiresAt]: expiresAt,
    [CANVA_INTEGRATION_FIELD_IDS.connectedAt]: new Date().toISOString(),
    [CANVA_INTEGRATION_FIELD_IDS.pkceVerifier]: ""
  };
  if (token.refresh_token) fields[CANVA_INTEGRATION_FIELD_IDS.refreshToken] = token.refresh_token;
  if (token.scope) fields[CANVA_INTEGRATION_FIELD_IDS.scopes] = token.scope;
  if (profileName) fields[CANVA_INTEGRATION_FIELD_IDS.profileName] = profileName;
  return fields;
}

export function canvaDisconnectFields(): string[] {
  return Object.values(CANVA_INTEGRATION_FIELD_IDS);
}

export async function getValidCanvaAccessToken(
  cfg: CanvaEnvConfig,
  fields: BrandingWorkspaceData
): Promise<string | null> {
  const access = fields[CANVA_INTEGRATION_FIELD_IDS.accessToken];
  const refresh = fields[CANVA_INTEGRATION_FIELD_IDS.refreshToken];
  const expiresAt = fields[CANVA_INTEGRATION_FIELD_IDS.expiresAt];
  if (typeof access !== "string" || !access.trim()) return null;
  const expMs = typeof expiresAt === "string" ? Date.parse(expiresAt) : 0;
  if (expMs > Date.now() + 60_000) return access.trim();
  if (typeof refresh !== "string" || !refresh.trim()) return access.trim();
  const next = await refreshCanvaAccessToken(cfg, refresh.trim());
  return next.access_token;
}
