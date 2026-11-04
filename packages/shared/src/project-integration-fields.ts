/** Credenciais / segredos de integração (workspace fields). */

import type { BrandingFieldDef } from "./branding-workspace.js";

const I = "integration";

function iid(provider: string, field: string): string {
  return `${I}:${provider}:${field}`;
}

export const INTEGRATION_SECRET_FIELDS: readonly BrandingFieldDef[] = [
  {
    id: iid("ingress", "hmac-secret"),
    label: "Segredo HMAC (webhooks genérico)",
    type: "text",
    description: "Header X-Ederson-Signature: sha256=<hex>. Opcional; se vazio, webhooks aceitos sem assinatura."
  },
  {
    id: iid("hotmart", "hmac-secret"),
    label: "Hotmart — token / hottok (validação webhook)",
    type: "text"
  },
  {
    id: iid("hotmart", "api-token"),
    label: "Hotmart — Bearer token (API produtos)",
    type: "text",
    description: "OAuth/API Hotmart Developers — sync de produto."
  },
  {
    id: iid("kiwify", "webhook-secret"),
    label: "Kiwify — segredo do webhook",
    type: "text"
  },
  {
    id: iid("monetizze", "webhook-secret"),
    label: "Monetizze — segredo do webhook",
    type: "text"
  },
  {
    id: iid("leadlovers", "api-token"),
    label: "Leadlovers — API token (sync outbound)",
    type: "text",
    description: "Usado quando PUSH Leadlovers estiver habilitado no servidor."
  }
] as const;

export function integrationSecretFieldId(provider: string, field: string): string {
  return iid(provider, field);
}
