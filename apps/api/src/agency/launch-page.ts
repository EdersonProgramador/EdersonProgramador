import { buildLaunchLandingDocument } from "@ederson-agencia/shared";
import type { ProjectWorkspaceDocument } from "@ederson-agencia/shared";

export type LaunchPageSnapshot = {
  publishedAt: string;
  heroHtml: string;
  captureHtml: string;
  documentHtml: string;
};

export function slugifyLaunchTitle(title: string, projectId: string): string {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36);
  return `${base || "lancamento"}-${projectId.slice(-6)}`;
}

export function buildLaunchPageSnapshot(workspace: ProjectWorkspaceDocument): LaunchPageSnapshot {
  const built = buildLaunchLandingDocument(workspace.fields);
  return {
    publishedAt: new Date().toISOString(),
    heroHtml: built.heroHtml,
    captureHtml: built.captureHtml,
    documentHtml: built.documentHtml
  };
}
