import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";
import { ApiError, apiPost } from "../api";

export type LeadCapturePayload = {
  name: string;
  email: string;
  phone: string;
  packageTier?: "essential" | "professional" | "advanced";
  campaign?: string;
  consentLgpd: true;
};

function buildPopupMessage(packageTier?: string, campaign?: string) {
  return `[Captura rápida — popup]\nInteresse em ${packageTier ?? "pacote a definir"}.\nLGPD: consentimento em ${new Date().toISOString()}${campaign ? `\nCampanha: ${campaign}` : ""}`;
}

function isCaptureRouteMissing(err: unknown) {
  if (!(err instanceof ApiError)) return false;
  if (err.status === 404) return true;
  return /not found/i.test(err.message) && err.message.includes("/public/leads");
}

/** Popup do funil → API (capture); compatível com APIs que só expõem POST /public/leads. */
export async function submitLeadCapture(payload: LeadCapturePayload): Promise<{ message: string }> {
  try {
    return await apiPost<{ message: string }>("/public/leads/capture", payload);
  } catch (err) {
    if (!isCaptureRouteMissing(err)) throw err;

    const legacy = await apiPost<{ message: string }>("/public/leads", {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: buildPopupMessage(payload.packageTier, payload.campaign),
      packageTier: payload.packageTier,
      // APIs antigas não aceitam source `lead_popup`; a mensagem identifica a origem.
      source: "landing"
    });

    return {
      message: legacy.message || LAUNCH_FUNNEL_COPY.captureModal.success
    };
  }
}
