import type { DevCodeStudioFile, DevCodeStudioFolder, DevCodeStudioSnapshot } from "./development-code-studio.js";

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

export function languageFromPath(path: string): string {
  const base = fileBaseName(path).toLowerCase();
  if (base.endsWith(".tsx")) return "typescript";
  if (base.endsWith(".ts")) return "typescript";
  if (base.endsWith(".jsx")) return "javascript";
  if (base.endsWith(".js")) return "javascript";
  if (base.endsWith(".json")) return "json";
  if (base.endsWith(".css")) return "css";
  if (base.endsWith(".html")) return "html";
  if (base.endsWith(".md")) return "markdown";
  if (base.endsWith(".yml") || base.endsWith(".yaml")) return "yaml";
  if (base.endsWith(".prisma") || base.endsWith(".sql")) return "sql";
  if (base.startsWith(".env")) return "plaintext";
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

function normalizedFilePath(path: string): string {
  return path.replace(/\\/g, "/");
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
  return {
    ...snapshot,
    openFileId: id,
    folders: ensureFolderChain(snapshot, dir),
    files: [...snapshot.files, file]
  };
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
  return {
    ...snapshot,
    openFileId: id,
    folders: ensureFolderChain(snapshot, parent),
    files: [...snapshot.files, file]
  };
}

export type ImportLocalFileSpec = { relativePath: string; content: string };

/**
 * Importa vários arquivos locais de uma vez (ex.: multi-seleção ou pasta com `webkitRelativePath`).
 * `relativePath` é relativo a `baseDir` no workspace (use `""` na raiz do workspace + caminhos como `src/a.ts`).
 * O último arquivo da lista fica aberto.
 */
export function importFilesIntoSnapshot(
  snapshot: DevCodeStudioSnapshot,
  baseDir: string,
  files: ImportLocalFileSpec[]
): DevCodeStudioSnapshot {
  if (files.length === 0) return snapshot;
  let next: DevCodeStudioSnapshot = snapshot;
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
      openFileId: id,
      folders: ensureFolderChain(next, folderParentPath(path)),
      files: [...next.files, file]
    };
  }
  return next;
}

export function createFolderInSnapshot(snapshot: DevCodeStudioSnapshot, parentDir: string, folderName: string): DevCodeStudioSnapshot {
  const path = joinPath(parentDir, folderName.replace(/\/+$/, ""));
  if (snapshot.folders.some((f) => f.path === path)) return snapshot;
  return {
    ...snapshot,
    folders: ensureFolderChain(snapshot, path)
  };
}

export function deleteFileFromSnapshot(snapshot: DevCodeStudioSnapshot, fileId: string): DevCodeStudioSnapshot {
  const files = snapshot.files.filter((f) => f.id !== fileId);
  let openFileId = snapshot.openFileId;
  if (openFileId === fileId) openFileId = files[0]?.id ?? "";
  return { ...snapshot, files, openFileId };
}

export function deleteFolderFromSnapshot(snapshot: DevCodeStudioSnapshot, folderPath: string): DevCodeStudioSnapshot {
  const prefix = folderPath.replace(/\\/g, "/").replace(/\/+$/, "") + "/";
  const files = snapshot.files.filter((f) => {
    const p = f.path.replace(/\\/g, "/");
    return p !== folderPath && !p.startsWith(prefix);
  });
  const folders = snapshot.folders.filter((f) => f.path !== folderPath && !f.path.startsWith(prefix));
  let openFileId = snapshot.openFileId;
  if (!files.some((f) => f.id === openFileId)) openFileId = files[0]?.id ?? "";
  return { ...snapshot, files, folders, openFileId };
}

export function renamePathInSnapshot(snapshot: DevCodeStudioSnapshot, oldPath: string, newPath: string): DevCodeStudioSnapshot {
  const oldP = oldPath.replace(/\\/g, "/");
  const newP = newPath.replace(/\\/g, "/");
  const isFolder = snapshot.folders.some((f) => f.path === oldP);
  if (isFolder) {
    const prefix = oldP + "/";
    const folders = snapshot.folders
      .map((f) => {
        if (f.path === oldP) return { ...f, id: folderIdForPath(newP), path: newP };
        if (f.path.startsWith(prefix)) return { ...f, id: folderIdForPath(newP + f.path.slice(oldP.length)), path: newP + f.path.slice(oldP.length) };
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
    const openFileId =
      files.length === 0
        ? ""
        : typeof parsed.openFileId === "string" && files.some((f) => f.id === parsed.openFileId)
          ? parsed.openFileId
          : (files[0]?.id ?? "");
    let snap: DevCodeStudioSnapshot = { version: 2, openFileId, files, folders };
    for (const f of files) snap = { ...snap, folders: ensureFolderChain(snap, folderParentPath(f.path)) };
    return snap;
  }
  if (parsed.version === 1 && Array.isArray(parsed.files)) {
    const files = (parsed.files as Array<DevCodeStudioFile & { name?: string }>).map((f) => {
      const path = f.path ?? f.name ?? "untitled.txt";
      return { id: f.id, path, language: f.language ?? languageFromPath(path), content: f.content ?? "" };
    });
    if (files.length === 0) {
      return { version: 2, openFileId: "", files: [], folders: [] };
    }
    let snap: DevCodeStudioSnapshot = { version: 2, openFileId: files[0].id, files, folders: [] };
    for (const f of files) snap = { ...snap, folders: ensureFolderChain(snap, folderParentPath(f.path)) };
    const openFileId = files.some((f) => f.id === parsed.openFileId) ? (parsed.openFileId as string) : files[0].id;
    return { ...snap, openFileId };
  }
  return null;
}
