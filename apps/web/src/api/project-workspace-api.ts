import {
  hydrateProjectWorkspace,
  projectWorkspaceFeedProjections,
  projectWorkspaceSummary,
  type BrandingFieldValue,
  type BrandingWorkspaceData,
  type ProjectWorkspaceDocument
} from "@ederson-agencia/shared";
import { ApiError, apiGet, apiPatch } from "../api";

export type ProjectWorkspaceGetResponse = {
  projectId: string;
  projectTitle?: string;
  workspace: ProjectWorkspaceDocument;
  summary: ReturnType<typeof projectWorkspaceSummary>;
  projections: ReturnType<typeof projectWorkspaceFeedProjections>;
};

function isWorkspaceRouteMissing(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  if (err.status === 404) return true;
  return /\/workspace not found/i.test(err.message);
}

async function loadProjectWorkspaceLegacy(projectId: string): Promise<ProjectWorkspaceGetResponse> {
  const [brand, launch] = await Promise.all([
    apiGet<{ projectId: string; projectTitle: string; data: BrandingWorkspaceData }>(
      `/agency/projects/${projectId}/branding-workspace`
    ).catch(() => null),
    apiGet<{ projectId: string; projectTitle: string; checked: Record<string, boolean> }>(
      `/agency/projects/${projectId}/launch-operation`
    ).catch(() => null)
  ]);

  const workspace = hydrateProjectWorkspace({
    brandingWorkspaceJson: brand?.data ?? {},
    launchOpCheckedJson: launch?.checked ?? {}
  });

  return {
    projectId: brand?.projectId ?? launch?.projectId ?? projectId,
    projectTitle: brand?.projectTitle ?? launch?.projectTitle,
    workspace,
    summary: projectWorkspaceSummary(workspace),
    projections: projectWorkspaceFeedProjections(workspace.fields)
  };
}

/** GET workspace — usa rotas legadas se a API ainda não expõe `/workspace` (ex.: Render desatualizado). */
export async function getProjectWorkspace(projectId: string): Promise<ProjectWorkspaceGetResponse> {
  try {
    return await apiGet<ProjectWorkspaceGetResponse>(`/agency/projects/${projectId}/workspace`);
  } catch (err) {
    if (!isWorkspaceRouteMissing(err)) throw err;
    return loadProjectWorkspaceLegacy(projectId);
  }
}

export type ProjectWorkspacePatchBody =
  | { fieldId: string; value: BrandingFieldValue | null }
  | { taskId: string; done: boolean };

export type ProjectWorkspacePatchResponse = {
  workspace?: ProjectWorkspaceDocument;
  summary?: ReturnType<typeof projectWorkspaceSummary>;
  data?: BrandingWorkspaceData;
  checked?: Record<string, boolean>;
};

export async function patchProjectWorkspace(
  projectId: string,
  body: ProjectWorkspacePatchBody
): Promise<ProjectWorkspacePatchResponse> {
  try {
    return await apiPatch<ProjectWorkspacePatchResponse>(`/agency/projects/${projectId}/workspace`, body);
  } catch (err) {
    if (!isWorkspaceRouteMissing(err)) throw err;
    if ("fieldId" in body) {
      const res = await apiPatch<{ data: BrandingWorkspaceData }>(
        `/agency/projects/${projectId}/branding-workspace`,
        { fieldId: body.fieldId, value: body.value }
      );
      return { data: res.data };
    }
    const res = await apiPatch<{ checked: Record<string, boolean> }>(
      `/agency/projects/${projectId}/launch-operation`,
      { taskId: body.taskId, done: body.done }
    );
    return { checked: res.checked };
  }
}
