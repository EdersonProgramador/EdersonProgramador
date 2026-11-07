import { ApiError, apiGet, apiPost } from "../api";
import type { CanvaIntegrationStatus } from "@ederson-agencia/shared";

export async function getCanvaStatus(projectId: string): Promise<{
  status: CanvaIntegrationStatus;
  redirectUri?: string;
}> {
  return apiGet(`/agency/projects/${projectId}/canva/status`);
}

export async function startCanvaOAuth(projectId: string): Promise<{ authorizeUrl: string }> {
  return apiPost(`/agency/projects/${projectId}/canva/authorize`, {});
}

export async function disconnectCanva(projectId: string): Promise<{ ok: boolean }> {
  return apiPost(`/agency/projects/${projectId}/canva/disconnect`, {});
}

export async function syncCanvaBrand(projectId: string): Promise<{
  ok: boolean;
  profileName?: string;
  paletteClipboard?: string;
  message: string;
  docs: string;
}> {
  return apiPost(`/agency/projects/${projectId}/canva/sync-brand`, {});
}
