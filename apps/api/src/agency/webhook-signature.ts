import { createHmac, timingSafeEqual } from "node:crypto";

export function hmacSha256Hex(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

export function verifyEdersonWebhookSignature(
  secret: string | undefined,
  payload: string,
  signatureHeader: string | undefined
): { ok: boolean; reason?: string } {
  if (!secret?.trim()) {
    return { ok: true, reason: "no_secret_configured" };
  }
  if (!signatureHeader?.trim()) {
    return { ok: false, reason: "missing_signature" };
  }
  const expected = hmacSha256Hex(secret.trim(), payload);
  const provided = signatureHeader.replace(/^sha256=/i, "").trim().toLowerCase();
  if (provided.length !== expected.length) {
    return { ok: false, reason: "invalid_signature" };
  }
  try {
    const ok = timingSafeEqual(Buffer.from(provided, "hex"), Buffer.from(expected, "hex"));
    return ok ? { ok: true } : { ok: false, reason: "invalid_signature" };
  } catch {
    return { ok: false, reason: "invalid_signature" };
  }
}

export function verifyProviderWebhookSecret(
  secret: string | undefined,
  headerValue: string | undefined
): boolean {
  if (!secret?.trim()) return true;
  if (!headerValue?.trim()) return false;
  const a = secret.trim();
  const b = headerValue.trim();
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
