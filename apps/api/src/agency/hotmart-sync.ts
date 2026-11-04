import type { BrandingWorkspaceData } from "@ederson-agencia/shared";
import { buildHotmartProductDraft } from "@ederson-agencia/shared";
import { env } from "../env.js";

function fieldText(fields: BrandingWorkspaceData, id: string): string | undefined {
  const v = fields[id];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export async function pushHotmartProductDraft(fields: BrandingWorkspaceData): Promise<
  | { mode: "dry_run"; draft: ReturnType<typeof buildHotmartProductDraft>; message: string }
  | { mode: "pushed"; draft: ReturnType<typeof buildHotmartProductDraft>; response: unknown }
> {
  const draft = buildHotmartProductDraft(fields);
  const token =
    fieldText(fields, "integration:hotmart:api-token") ?? env.HOTMART_API_TOKEN?.trim();
  const apiBase = (env.HOTMART_API_URL ?? "https://developers.hotmart.com").replace(/\/$/, "");

  if (!token) {
    return {
      mode: "dry_run",
      draft,
      message: "Configure integration:hotmart:api-token no workspace ou HOTMART_API_TOKEN na API."
    };
  }

  const payload = {
    name: draft.name,
    description: draft.description,
    price: draft.priceHint,
    format: "ONLINE_COURSE"
  };

  const res = await fetch(`${apiBase}/payments/api/v1/product`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  let response: unknown = text;
  try {
    response = JSON.parse(text);
  } catch {
    /* raw text */
  }

  if (!res.ok) {
    throw Object.assign(new Error(`Hotmart API ${res.status}: ${text.slice(0, 300)}`), { statusCode: 502 });
  }

  return { mode: "pushed", draft, response };
}
