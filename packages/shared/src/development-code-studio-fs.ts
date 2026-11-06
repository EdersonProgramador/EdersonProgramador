import type {
  DevCodeStudioFile,
  DevCodeStudioFolder,
  DevCodeStudioOpenTab,
  DevCodeStudioSnapshot,
  DevCodeStudioTabGroup
} from "./development-code-studio.js";
import { MONACO_LANGUAGE_BY_EXTENSION } from "./monaco-extension-language-map.generated.js";

export type CodeStudioTreeNode =
  | { kind: "folder"; id: string; path: string; name: string; children: CodeStudioTreeNode[] }
  | { kind: "file"; id: string; path: string; name: string; file: DevCodeStudioFile };

export function fileBaseName(path: string): string {
  const p = path.replace(/\\/g, "/").replace(/\/+$/, "");
  const idx = p.lastIndexOf("/");
  return idx === -1 ? p : p.slice(idx + 1);
}

export function folderParentPath(path: string): string {
  const p = path.replace(/\\/g, "/").replace(/\/+$/, "");
  const idx = p.lastIndexOf("/");
  return idx === -1 ? "" : p.slice(0, idx);
}

export function joinPath(dir: string, name: string): string {
  const n = name.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!dir) return n;
  return `${dir.replace(/\\/g, "/").replace(/\/+$/, "")}/${n}`;
}

/**
 * ID de linguagem do Monaco a partir do caminho (extensão).
 * Usa mapa gerado a partir dos `register.js` do pacote monaco-editor + alguns extras.
 */
export function languageFromPath(path: string): string {
  const base = fileBaseName(path).toLowerCase();
  if (base === "dockerfile" || base.startsWith("dockerfile.")) return "dockerfile";
  if (base === "makefile" || base === "gnumakefile") return "shell";
  if (base === "cmakelists.txt") return "plaintext";

  const dot = base.lastIndexOf(".");
  const ext = dot >= 0 ? base.slice(dot + 1) : "";
  if (ext && MONACO_LANGUAGE_BY_EXTENSION[ext]) return MONACO_LANGUAGE_BY_EXTENSION[ext];
  if (base.startsWith(".env")) return "ini";
  return "plaintext";
}

function folderIdForPath(path: string): string {
  return `folder-${path.replace(/\//g, "--")}`;
}

export function ensureFolderChain(snapshot: DevCodeStudioSnapshot, folderPath: string): DevCodeStudioFolder[] {
  const normalized = folderPath.replace(/\\/g, "/").replace(/\/+$/, "");
  if (!normalized) return snapshot.folders;
  const parts = normalized.split("/");
  let acc = "";
  const map = new Map(snapshot.folders.map((f) => [f.path, f]));
  for (const part of parts) {
    acc = acc ? `${acc}/${part}` : part;
    if (!map.has(acc)) {
      const folder: DevCodeStudioFolder = { id: folderIdForPath(acc), path: acc };
      map.set(acc, folder);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.path.localeCompare(b.path));
}

function collectFolderPaths(snapshot: DevCodeStudioSnapshot): Set<string> {
  const set = new Set<string>();
  for (const folder of snapshot.folders) set.add(folder.path.replace(/\\/g, "/"));
  for (const file of snapshot.files) {
    let p = folderParentPath(file.path);
    while (p) {
      set.add(p);
      p = folderParentPath(p);
    }
  }
  return set;
}

function buildLevel(snapshot: DevCodeStudioSnapshot, folderPaths: Set<string>, parentPath: string): CodeStudioTreeNode[] {
  const nodes: CodeStudioTreeNode[] = [];
  for (const path of folderPaths) {
    if (folderParentPath(path) !== parentPath) continue;
    nodes.push({
      kind: "folder",
      id: folderIdForPath(path),
      path,
      name: fileBaseName(path),
      children: buildLevel(snapshot, folderPaths, path)
    });
  }
  for (const file of snapshot.files) {
    const path = file.path.replace(/\\/g, "/");
    if (folderParentPath(path) !== parentPath) continue;
    nodes.push({
      kind: "file",
      id: file.id,
      path,
      name: fileBaseName(path),
      file
    });
  }
  nodes.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return nodes;
}

export function buildCodeStudioTree(snapshot: DevCodeStudioSnapshot): CodeStudioTreeNode[] {
  const folderPaths = collectFolderPaths(snapshot);
  return buildLevel(snapshot, folderPaths, "");
}

const EMPTY_TABS: DevCodeStudioTabGroup = { activeFileId: "", tabs: [] };

/** Garante `openTabs` coerente com `files` e sincroniza `openFileId`. */
export function ensureOpenTabs(snapshot: DevCodeStudioSnapshot): DevCodeStudioSnapshot {
  const fileIds = new Set(snapshot.files.map((f) => f.id));
  let tabs: DevCodeStudioOpenTab[] = snapshot.openTabs?.tabs?.filter((t) => fileIds.has(t.fileId)) ?? [];
  if (!snapshot.openTabs?.tabs?.length && snapshot.openFileId && fileIds.has(snapshot.openFileId)) {
    tabs = [{ fileId: snapshot.openFileId, preview: false }];
  }
  let active = snapshot.openTabs?.activeFileId ?? snapshot.openFileId ?? "";
  if (!active || !fileIds.has(active) || !tabs.some((t) => t.fileId === active)) {
    active = tabs[tabs.length - 1]?.fileId ?? "";
  }
  return { ...snapshot, openTabs: { activeFileId: active, tabs }, openFileId: active };
}

/**
 * Abre arquivo na barra de abas (estilo VS Code).
 * `preview` = clique simples no explorador (substitui a aba de preview existente).
 * `pin` = duplo clique ou arquivo novo (aba fixa).
 */
export function openFileInTab(snapshot: DevCodeStudioSnapshot, fileId: string, mode: "preview" | "pin"): DevCodeStudioSnapshot {
  const s = ensureOpenTabs(snapshot);
  if (!s.files.some((f) => f.id === fileId)) return s;
  const tabs = [...(s.openTabs?.tabs ?? [])];
  const iPreview = tabs.findIndex((t) => t.preview);
  const iExisting = tabs.findIndex((t) => t.fileId === fileId);

  if (mode === "pin") {
    if (iExisting >= 0) tabs[iExisting] = { fileId, preview: false };
    else if (iPreview >= 0) tabs[iPreview] = { fileId, preview: false };
    else tabs.push({ fileId, preview: false });
    return { ...s, openTabs: { activeFileId: fileId, tabs }, openFileId: fileId };
  }

  if (iExisting >= 0) return { ...s, openTabs: { activeFileId: fileId, tabs }, openFileId: fileId };
  if (iPreview >= 0) tabs[iPreview] = { fileId, preview: true };
  else tabs.push({ fileId, preview: true });
  return { ...s, openTabs: { activeFileId: fileId, tabs }, openFileId: fileId };
}

export function closeTabInSnapshot(snapshot: DevCodeStudioSnapshot, fileId: string): DevCodeStudioSnapshot {
  const s = ensureOpenTabs(snapshot);
  const oldTabs = s.openTabs?.tabs ?? [];
  const closedIdx = oldTabs.findIndex((t) => t.fileId === fileId);
  const tabs = oldTabs.filter((t) => t.fileId !== fileId);
  let active = s.openTabs!.activeFileId;
  if (active === fileId) {
    const next = oldTabs[closedIdx + 1] ?? oldTabs[closedIdx - 1];
    active = next?.fileId ?? tabs[tabs.length - 1]?.fileId ?? "";
  }
  return { ...s, openTabs: { activeFileId: active, tabs }, openFileId: active };
}

export function setActiveOpenFile(snapshot: DevCodeStudioSnapshot, fileId: string): DevCodeStudioSnapshot {
  const s = ensureOpenTabs(snapshot);
  if (!s.files.some((f) => f.id === fileId)) return s;
  return { ...s, openTabs: { ...s.openTabs!, activeFileId: fileId }, openFileId: fileId };
}

/** Deixa a aba fixa (sai do modo preview), ex.: ao editar o arquivo. */
export function pinTabForFile(snapshot: DevCodeStudioSnapshot, fileId: string): DevCodeStudioSnapshot {
  const s = ensureOpenTabs(snapshot);
  if (!s.openTabs?.tabs.some((t) => t.fileId === fileId)) return s;
  const tabs = s.openTabs.tabs.map((t) => (t.fileId === fileId ? { ...t, preview: false } : t));
  return { ...s, openTabs: { ...s.openTabs, tabs } };
}

function withImportBatchNoTabs(snapshot: DevCodeStudioSnapshot): DevCodeStudioSnapshot {
  return { ...snapshot, openFileId: "", openTabs: { ...EMPTY_TABS } };
}

function normalizedFilePath(path: string): string {
  return path.replace(/\\/g, "/");
}

/**
 * Nome de arquivo único dentro de `dir` (ex.: `untitled.ts`, `untitled-2.ts`).
 * Usa apenas o snapshot atual — chame de dentro de `updateSnapshot` com o estado mais recente.
 */
export function uniqueFileNameInDirectory(snapshot: DevCodeStudioSnapshot, dir: string, rawFileName: string): string {
  const safeName = fileBaseName(rawFileName.replace(/\\/g, "/").replace(/^\/+/, ""));
  const base = safeName || "untitled.ts";
  const dot = base.lastIndexOf(".");
  const stem = dot === -1 ? base : base.slice(0, dot);
  const ext = dot === -1 ? ".ts" : base.slice(dot);
  const stemSafe = stem.trim() || "untitled";
  for (let n = 0; n < 500; n++) {
    const name = n === 0 ? `${stemSafe}${ext}` : `${stemSafe}-${n}${ext}`;
    const path = joinPath(dir, name);
    const norm = normalizedFilePath(path);
    if (!snapshot.files.some((f) => normalizedFilePath(f.path) === norm)) return name;
  }
  return `${stemSafe}-${Date.now()}${ext}`;
}

/**
 * Nome de pasta único em `parentDir` (ex.: `nova-pasta`, `nova-pasta-2`).
 */
export function uniqueFolderNameInDirectory(snapshot: DevCodeStudioSnapshot, parentDir: string, rawStem: string): string {
  const stem = rawStem.replace(/[/\\]+/g, "-").trim() || "nova-pasta";
  for (let n = 0; n < 500; n++) {
    const name = n === 0 ? stem : `${stem}-${n}`;
    const path = joinPath(parentDir, name);
    const norm = normalizedFilePath(path);
    const folderTaken = snapshot.folders.some((f) => normalizedFilePath(f.path) === norm);
    const fileTaken = snapshot.files.some((f) => normalizedFilePath(f.path) === norm);
    if (!folderTaken && !fileTaken) return name;
  }
  return `${stem}-${Date.now()}`;
}

/** Evita sobrescrever: `arquivo.ts` → `arquivo-import.ts` → `arquivo-import-2.ts` … */
function uniquePathForNewFile(snapshot: DevCodeStudioSnapshot, dir: string, rawFileName: string): string {
  const safeName = fileBaseName(rawFileName.replace(/\\/g, "/").replace(/^\/+/, ""));
  if (!safeName) return joinPath(dir, `importado-${Date.now()}.txt`);
  const dot = safeName.lastIndexOf(".");
  const stem = dot === -1 ? safeName : safeName.slice(0, dot);
  const ext = dot === -1 ? "" : safeName.slice(dot);
  for (let n = 0; n < 200; n++) {
    const name =
      n === 0 ? safeName : n === 1 ? `${stem}-import${ext}` : `${stem}-import-${n}${ext}`;
    const path = joinPath(dir, name);
    const norm = normalizedFilePath(path);
    if (!snapshot.files.some((f) => normalizedFilePath(f.path) === norm)) return path;
  }
  return joinPath(dir, `${stem}-import-${Date.now()}${ext}`);
}

export function createFileInSnapshot(
  snapshot: DevCodeStudioSnapshot,
  dir: string,
  fileName: string,
  content = ""
): DevCodeStudioSnapshot {
  const path = joinPath(dir, fileName);
  const id = `file-${Date.now()}`;
  const file: DevCodeStudioFile = {
    id,
    path,
    language: languageFromPath(path),
    content: content || (languageFromPath(path) === "typescript" ? "// Novo arquivo\n" : "")
  };
  const next: DevCodeStudioSnapshot = {
    ...snapshot,
    folders: ensureFolderChain(snapshot, dir),
    files: [...snapshot.files, file]
  };
  return openFileInTab(next, id, "pin");
}

/** Importa conteúdo de um arquivo local (nome seguro + caminho único). Último arquivo importado fica aberto. */
export function importFileIntoSnapshot(
  snapshot: DevCodeStudioSnapshot,
  dir: string,
  fileName: string,
  content: string
): DevCodeStudioSnapshot {
  const path = uniquePathForNewFile(snapshot, dir, fileName);
  const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const file: DevCodeStudioFile = {
    id,
    path,
    language: languageFromPath(path),
    content
  };
  const parent = folderParentPath(path);
  const next: DevCodeStudioSnapshot = {
    ...snapshot,
    folders: ensureFolderChain(snapshot, parent),
    files: [...snapshot.files, file]
  };
  return openFileInTab(next, id, "pin");
}


export type ImportLocalFileSpec = { relativePath: string; content: string };

/**
 * Importa vários arquivos locais de uma vez (ex.: multi-seleção ou pasta com `webkitRelativePath`).
 * `relativePath` é relativo a `baseDir` no workspace (use `""` na raiz do workspace + caminhos como `src/a.ts`).
 * Não abre abas — os arquivos ficam no explorador; abra pelo clique (preview) ou duplo clique (fixar).
 */
export function importFilesIntoSnapshot(
  snapshot: DevCodeStudioSnapshot,
  baseDir: string,
  files: ImportLocalFileSpec[]
): DevCodeStudioSnapshot {
  if (files.length === 0) return snapshot;
  let next: DevCodeStudioSnapshot = withImportBatchNoTabs(snapshot);
  for (const { relativePath, content } of files) {
    const rel = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
    if (!rel) continue;
    const rawFull = joinPath(baseDir, rel);
    const parent = folderParentPath(rawFull);
    const name = fileBaseName(rel);
    const path = uniquePathForNewFile(next, parent, name);
    const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const file: DevCodeStudioFile = {
      id,
      path,
      language: languageFromPath(path),
      content
    };
    next = {
      ...next,
      folders: ensureFolderChain(next, folderParentPath(path)),
      files: [...next.files, file]
    };
  }
  return ensureOpenTabs(next);
}

export function createFolderInSnapshot(snapshot: DevCodeStudioSnapshot, parentDir: string, folderName: string): DevCodeStudioSnapshot {
  const path = joinPath(parentDir, folderName.replace(/\/+$/, ""));
  const pathN = normalizedFilePath(path);
  if (snapshot.folders.some((f) => normalizedFilePath(f.path) === pathN)) return snapshot;
  return {
    ...snapshot,
    folders: ensureFolderChain(snapshot, path)
  };
}

export function deleteFileFromSnapshot(snapshot: DevCodeStudioSnapshot, fileId: string): DevCodeStudioSnapshot {
  const files = snapshot.files.filter((f) => f.id !== fileId);
  return ensureOpenTabs(closeTabInSnapshot({ ...snapshot, files }, fileId));
}

export function deleteFolderFromSnapshot(snapshot: DevCodeStudioSnapshot, folderPath: string): DevCodeStudioSnapshot {
  const folderPathN = folderPath.replace(/\\/g, "/").replace(/\/+$/, "");
  const prefix = folderPathN + "/";
  const removedIds = new Set(
    snapshot.files.filter((f) => {
      const p = f.path.replace(/\\/g, "/");
      return p === folderPathN || p.startsWith(prefix);
    }).map((f) => f.id)
  );
  const files = snapshot.files.filter((f) => {
    const p = f.path.replace(/\\/g, "/");
    return p !== folderPathN && !p.startsWith(prefix);
  });
  const folders = snapshot.folders.filter((f) => {
    const fp = f.path.replace(/\\/g, "/");
    return fp !== folderPathN && !fp.startsWith(prefix);
  });
  const s = ensureOpenTabs(snapshot);
  const tabs = (s.openTabs?.tabs ?? []).filter((t) => !removedIds.has(t.fileId));
  let active = s.openTabs!.activeFileId;
  if (removedIds.has(active)) active = tabs[tabs.length - 1]?.fileId ?? "";
  return ensureOpenTabs({ ...snapshot, files, folders, openTabs: { activeFileId: active, tabs }, openFileId: active });
}

export function renamePathInSnapshot(snapshot: DevCodeStudioSnapshot, oldPath: string, newPath: string): DevCodeStudioSnapshot {
  const oldP = oldPath.replace(/\\/g, "/");
  const newP = newPath.replace(/\\/g, "/");
  const isFolder = snapshot.folders.some((f) => f.path.replace(/\\/g, "/") === oldP);
  if (isFolder) {
    const prefix = oldP + "/";
    const folders = snapshot.folders
      .map((f) => {
        const fp = f.path.replace(/\\/g, "/");
        if (fp === oldP) return { ...f, id: folderIdForPath(newP), path: newP };
        if (fp.startsWith(prefix)) return { ...f, id: folderIdForPath(newP + fp.slice(oldP.length)), path: newP + fp.slice(oldP.length) };
        return f;
      })
      .sort((a, b) => a.path.localeCompare(b.path));
    const files = snapshot.files.map((f) => {
      const p = f.path.replace(/\\/g, "/");
      if (p.startsWith(prefix)) {
        const np = newP + p.slice(oldP.length);
        return { ...f, path: np, language: languageFromPath(np) };
      }
      return f;
    });
    return { ...snapshot, folders, files };
  }
  const files = snapshot.files.map((f) => {
    if (f.path.replace(/\\/g, "/") !== oldP) return f;
    return { ...f, path: newP, language: languageFromPath(newP) };
  });
  return { ...snapshot, folders: ensureFolderChain(snapshot, folderParentPath(newP)) };
}

export function migrateSnapshotToV2(raw: unknown): DevCodeStudioSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const parsed = raw as Record<string, unknown>;
  if (parsed.version === 2 && Array.isArray(parsed.files)) {
    const files = (parsed.files as DevCodeStudioFile[]).map((f) => {
      const path = f.path ?? (f as { name?: string }).name ?? "untitled.txt";
      return { ...f, path, language: f.language ?? languageFromPath(path), content: f.content ?? "" };
    });
    const folders = Array.isArray(parsed.folders) ? (parsed.folders as DevCodeStudioFolder[]) : [];
    const openFileIdFromJson =
      typeof parsed.openFileId === "string" && files.some((f) => f.id === parsed.openFileId) ? parsed.openFileId : "";
    let openTabsParsed: DevCodeStudioTabGroup | undefined;
    const ot = parsed.openTabs as { activeFileId?: unknown; tabs?: unknown } | undefined;
    if (ot && typeof ot === "object" && Array.isArray(ot.tabs)) {
      const tabs: DevCodeStudioOpenTab[] = (ot.tabs as unknown[]).reduce<DevCodeStudioOpenTab[]>((acc, row) => {
        if (!row || typeof row !== "object") return acc;
        const fid = (row as { fileId?: unknown }).fileId;
        if (typeof fid !== "string" || !files.some((f) => f.id === fid)) return acc;
        acc.push({ fileId: fid, preview: Boolean((row as { preview?: unknown }).preview) });
        return acc;
      }, []);
      let active =
        typeof ot.activeFileId === "string" && files.some((f) => f.id === ot.activeFileId) ? ot.activeFileId : tabs[tabs.length - 1]?.fileId ?? "";
      if (active && !tabs.some((t) => t.fileId === active)) active = tabs[tabs.length - 1]?.fileId ?? "";
      openTabsParsed = { activeFileId: active, tabs };
    }
    const openFileId =
      files.length === 0
        ? ""
        : openTabsParsed?.activeFileId && files.some((f) => f.id === openTabsParsed.activeFileId)
          ? openTabsParsed.activeFileId
          : openFileIdFromJson || (files[0]?.id ?? "");
    let snap: DevCodeStudioSnapshot = {
      version: 2,
      openFileId,
      openTabs:
        openTabsParsed && openTabsParsed.tabs.length > 0
          ? openTabsParsed
          : { activeFileId: openFileId, tabs: openFileId ? [{ fileId: openFileId, preview: false }] : [] },
      files,
      folders
    };
    for (const f of files) snap = { ...snap, folders: ensureFolderChain(snap, folderParentPath(f.path)) };
    return ensureOpenTabs(snap);
  }
  if (parsed.version === 1 && Array.isArray(parsed.files)) {
    const files = (parsed.files as Array<DevCodeStudioFile & { name?: string }>).map((f) => {
      const path = f.path ?? f.name ?? "untitled.txt";
      return { id: f.id, path, language: f.language ?? languageFromPath(path), content: f.content ?? "" };
    });
    if (files.length === 0) {
      return ensureOpenTabs({ version: 2, openFileId: "", openTabs: { activeFileId: "", tabs: [] }, files: [], folders: [] });
    }
    let snap: DevCodeStudioSnapshot = {
      version: 2,
      openFileId: files[0].id,
      openTabs: { activeFileId: files[0].id, tabs: [{ fileId: files[0].id, preview: false }] },
      files,
      folders: []
    };
    for (const f of files) snap = { ...snap, folders: ensureFolderChain(snap, folderParentPath(f.path)) };
    const openFileId = files.some((f) => f.id === parsed.openFileId) ? (parsed.openFileId as string) : files[0].id;
    return ensureOpenTabs({
      ...snap,
      openFileId,
      openTabs: { activeFileId: openFileId, tabs: [{ fileId: openFileId, preview: false }] }
    });
  }
  return null;
}
