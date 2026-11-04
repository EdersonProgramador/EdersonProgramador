import type { BrandingWorkspaceData } from "@ederson-agencia/shared";
import { integrationSecretFieldId } from "@ederson-agencia/shared";
import type { WebhookProviderId } from "./webhook-ingress.js";
import { hmacSha256Hex, verifyEdersonWebhookSignature, verifyProviderWebhookSecret } from "./webhook-signature.js";

function fieldText(fields: BrandingWorkspaceData, fieldId: string): string | undefined {
  const v = fields[fieldId];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export function verifyInboundWebhookAuth(input: {
  provider: WebhookProviderId;
  fields: BrandingWorkspaceData;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
}): { ok: boolean; reason?: string } {
  const payload = JSON.stringify(input.body ?? {});
  const headers = input.headers;
  const fields = input.fields;

  const ingressSecret = fieldText(fields, integrationSecretFieldId("ingress", "hmac-secret"));
  const edersonSig = headerString(headers, "x-ederson-signature");
  const ingressCheck = verifyEdersonWebhookSignature(ingressSecret, payload, edersonSig);
  if (ingressSecret && !ingressCheck.ok) {
    return ingressCheck;
  }

  switch (input.provider) {
    case "hotmart": {
      const secret = fieldText(fields, integrationSecretFieldId("hotmart", "hmac-secret"));
      const hottok = headerString(headers, "x-hotmart-hottok");
      if (!verifyProviderWebhookSecret(secret, hottok)) {
        return { ok: false, reason: "hotmart_hottok" };
      }
      break;
    }
    case "kiwify": {
      const secret = fieldText(fields, integrationSecretFieldId("kiwify", "webhook-secret"));
      const sig = headerString(headers, "x-kiwify-signature") ?? headerString(headers, "authorization");
      if (secret && sig?.startsWith("sha256=")) {
        const expected = hmacSha256Hex(secret, payload);
        const provided = sig.replace(/^sha256=/i, "").trim();
        if (provided !== expected) return { ok: false, reason: "kiwify_signature" };
      } else if (!verifyProviderWebhookSecret(secret, sig)) {
        return { ok: false, reason: "kiwify_secret" };
      }
      break;
    }
    case "monetizze": {
      const secret = fieldText(fields, integrationSecretFieldId("monetizze", "webhook-secret"));
      const token = headerString(headers, "x-monetizze-token") ?? headerString(headers, "authorization");
      if (!verifyProviderWebhookSecret(secret, token)) {
        return { ok: false, reason: "monetizze_secret" };
      }
      break;
    }
    case "leadlovers":
      break;
  }

  return { ok: true };
}

function headerString(headers: Record<string, string | string[] | undefined>, name: string): string | undefined {
  const v = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(v)) return v[0];
  return v;
}
