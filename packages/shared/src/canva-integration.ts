/** Links, OAuth Connect e campos de integração no workspace. */

export const CANVA_OAUTH_AUTHORIZE_URL = "https://www.canva.com/api/oauth/authorize" as const;
export const CANVA_OAUTH_TOKEN_URL = "https://api.canva.com/rest/v1/oauth/token" as const;
export const CANVA_API_BASE = "https://api.canva.com/rest/v1" as const;

/** Escopos mínimos para designs + brand templates (ajuste no Developer Portal). */
export const CANVA_OAUTH_SCOPES = [
  "openid",
  "profile",
  "design:meta:read",
  "design:content:write",
  "brandtemplate:meta:read",
  "asset:read",
  "asset:write"
] as const;

export const CANVA_INTEGRATION_FIELD_IDS = {
  accessToken: "integration:canva:access-token",
  refreshToken: "integration:canva:refresh-token",
  expiresAt: "integration:canva:expires-at",
  scopes: "integration:canva:scopes",
  pkceVerifier: "integration:canva:pkce-verifier",
  connectedAt: "integration:canva:connected-at",
  profileName: "integration:canva:profile-name"
} as const;

export type CanvaIntegrationStatus = {
  configured: boolean;
  connected: boolean;
  profileName?: string;
  connectedAt?: string;
  expiresAt?: string;
  scopes?: string;
};

function fieldString(fields: Record<string, unknown>, key: string): string | undefined {
  const v = fields[key];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export function readCanvaIntegrationStatus(
  fields: Record<string, unknown>,
  configured: boolean
): CanvaIntegrationStatus {
  const refresh = fieldString(fields, CANVA_INTEGRATION_FIELD_IDS.refreshToken);
  const connected = Boolean(refresh && refresh.length > 8);
  return {
    configured,
    connected,
    profileName: fieldString(fields, CANVA_INTEGRATION_FIELD_IDS.profileName),
    connectedAt: fieldString(fields, CANVA_INTEGRATION_FIELD_IDS.connectedAt),
    expiresAt: fieldString(fields, CANVA_INTEGRATION_FIELD_IDS.expiresAt),
    scopes: fieldString(fields, CANVA_INTEGRATION_FIELD_IDS.scopes)
  };
}

export type CanvaCreateLink = {
  id: string;
  label: string;
  description: string;
  href: string;
};

/** Templates públicos “Criar design” — o cliente leva cores via Brand Kit manual ou Connect. */
export const CANVA_CREATE_LINKS: readonly CanvaCreateLink[] = [
  {
    id: "logo",
    label: "Logotipo",
    description: "Explorar conceitos e variações de logo.",
    href: "https://www.canva.com/create/logos/"
  },
  {
    id: "instagram",
    label: "Post Instagram",
    description: "Peças sociais com a paleta do projeto.",
    href: "https://www.canva.com/create/instagram-posts/"
  },
  {
    id: "presentation",
    label: "Apresentação",
    description: "Decks de marca e pitch.",
    href: "https://www.canva.com/create/presentations/"
  },
  {
    id: "business-card",
    label: "Cartão de visita",
    description: "Mockup de cartão com identidade.",
    href: "https://www.canva.com/create/business-cards/"
  },
  {
    id: "brand-kit",
    label: "Brand Kit (Canva)",
    description: "Central de cores, fontes e logos no Canva.",
    href: "https://www.canva.com/brand/"
  }
] as const;

export const CANVA_CONNECT_DOCS_URL = "https://www.canva.dev/docs/connect/" as const;

export function formatPaletteForCanvaClipboard(swatches: { name: string; hex: string }[]): string {
  return swatches.map((s) => `${s.name}\t${s.hex.toUpperCase()}`).join("\n");
}
