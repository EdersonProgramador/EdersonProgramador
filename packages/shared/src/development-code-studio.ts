/** Workspace — editor de código do pilar Desenvolvimento. */

import { migrateSnapshotToV2 } from "./development-code-studio-fs.js";

export const DEV_CODE_STUDIO_FIELD_ID = "product:dev:code-studio";

export type DevCodeStudioFolder = {
  id: string;
  path: string;
};

export type DevCodeStudioFile = {
  id: string;
  path: string;
  language: string;
  content: string;
};

/** Aba aberta — `preview` imita o VS Code (itálico até fixar com duplo clique). */
export type DevCodeStudioOpenTab = {
  fileId: string;
  preview?: boolean;
};

export type DevCodeStudioTabGroup = {
  activeFileId: string;
  tabs: DevCodeStudioOpenTab[];
};

export type DevCodeStudioSnapshot = {
  version: 2;
  /** Último arquivo ativo (espelho de `openTabs.activeFileId` para compatibilidade). */
  openFileId: string;
  /** Abas abertas; import em lote não preenche — só o explorador lista os arquivos. */
  openTabs?: DevCodeStudioTabGroup;
  folders: DevCodeStudioFolder[];
  files: DevCodeStudioFile[];
};

/** Workspace vazio — como a tela inicial do VS Code até você criar arquivos. */
export function defaultDevCodeStudioSnapshot(): DevCodeStudioSnapshot {
  return {
    version: 2,
    openFileId: "",
    openTabs: { activeFileId: "", tabs: [] },
    folders: [],
    files: []
  };
}

export function parseDevCodeStudioSnapshot(raw: unknown): DevCodeStudioSnapshot | null {
  if (!raw || typeof raw !== "string" || !raw.trim()) return null;
  try {
    const migrated = migrateSnapshotToV2(JSON.parse(raw));
    return migrated;
  } catch {
    return null;
  }
}

export function serializeDevCodeStudioSnapshot(snapshot: DevCodeStudioSnapshot): string {
  return JSON.stringify(snapshot);
}
