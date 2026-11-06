import { useMemo, useState } from "react";
import {
  buildCodeStudioTree,
  fileBaseName,
  type CodeStudioTreeNode,
  type DevCodeStudioSnapshot
} from "@ederson-agencia/shared";
import { FolderChevron } from "./CodeStudioMenuBar";
import { materialFileSlot, materialFolderSlot } from "./fileMaterialIcon";

type CodeStudioExplorerProps = {
  snapshot: DevCodeStudioSnapshot;
  activeFileId?: string;
  selectedDir: string;
  onSelectDir: (dir: string) => void;
  /** Clique simples = preview (VS Code); duplo clique = aba fixa. */
  onOpenFile: (fileId: string, mode: "preview" | "pin") => void;
  onNewFile: (dir: string) => void;
  onNewFolder: (parentDir: string) => void;
  onRename: (path: string, isFolder: boolean) => void;
  onDeleteSelection: () => void;
};

function collectFolderPaths(snapshot: DevCodeStudioSnapshot): string[] {
  const set = new Set<string>();
  for (const f of snapshot.folders) set.add(f.path);
  for (const file of snapshot.files) {
    let p = file.path.includes("/") ? file.path.slice(0, file.path.lastIndexOf("/")) : "";
    while (p) {
      set.add(p);
      const idx = p.lastIndexOf("/");
      p = idx === -1 ? "" : p.slice(0, idx);
    }
  }
  return Array.from(set);
}

export function CodeStudioExplorer({
  snapshot,
  activeFileId,
  selectedDir,
  onSelectDir,
  onOpenFile,
  onNewFile,
  onNewFolder,
  onRename,
  onDeleteSelection
}: CodeStudioExplorerProps) {
  const tree = useMemo(() => buildCodeStudioTree(snapshot), [snapshot]);
  const allFolders = useMemo(() => collectFolderPaths(snapshot), [snapshot]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(allFolders));

  const toggleFolder = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const renderNode = (node: CodeStudioTreeNode, depth: number) => {
    if (node.kind === "folder") {
      const open = expanded.has(node.path);
      const folderSlot = materialFolderSlot(node.name, open);
      return (
        <li key={node.id}>
          <div
            className={`dev-code-studio__tree-row${selectedDir === node.path ? " is-selected-dir" : ""}`}
            style={{ paddingLeft: `${8 + depth * 12}px` }}
          >
            <button type="button" className="dev-code-studio__tree-chevron" onClick={() => toggleFolder(node.path)} aria-label={open ? "Recolher" : "Expandir"}>
              <FolderChevron open={open} />
            </button>
            <button
              type="button"
              className="dev-code-studio__tree-label"
              onClick={() => {
                onSelectDir(node.path);
                toggleFolder(node.path);
              }}
              onDoubleClick={() => onRename(node.path, true)}
            >
              <span
                className="dev-code-studio__mi dev-code-studio__mi--folder material-icons-round"
                data-mi-key={folderSlot.key}
                aria-hidden
              >
                {folderSlot.icon}
              </span>
              <span className="dev-code-studio__tree-folder-name">{node.name}</span>
            </button>
          </div>
          {open && node.children.length > 0 ? (
            <ul>{node.children.map((child) => renderNode(child, depth + 1))}</ul>
          ) : null}
        </li>
      );
    }
    const active = activeFileId === node.id;
    const fileSlot = materialFileSlot(node.name);
    return (
      <li key={node.id}>
        <div className="dev-code-studio__tree-row" style={{ paddingLeft: `${8 + depth * 12}px` }}>
          <span className="dev-code-studio__tree-chevron-spacer" />
          <button
            type="button"
            className={`dev-code-studio__tree-label dev-code-studio__tree-file${active ? " is-active" : ""}`}
            onClick={() => onOpenFile(node.id, "preview")}
            onDoubleClick={(e) => {
              e.preventDefault();
              onOpenFile(node.id, "pin");
            }}
          >
            <span
              className="dev-code-studio__mi dev-code-studio__mi--file material-icons-round"
              data-mi-key={fileSlot.key}
              aria-hidden
            >
              {fileSlot.icon}
            </span>
            <span className="dev-code-studio__tree-file-name">{node.name}</span>
          </button>
        </div>
      </li>
    );
  };

  return (
    <aside className="dev-code-studio__explorer" aria-label="Explorador">
      <div className="dev-code-studio__explorer-head">
        <p className="dev-code-studio__explorer-label">EXPLORADOR</p>
        <div className="dev-code-studio__explorer-actions">
          <button type="button" title="Novo arquivo" onClick={() => onNewFile(selectedDir)}>
            <span className="dev-code-studio__mi-toolbar material-icons-round" aria-hidden>
              note_add
            </span>
          </button>
          <button type="button" title="Nova pasta" onClick={() => onNewFolder(selectedDir)}>
            <span className="dev-code-studio__mi-toolbar material-icons-round" aria-hidden>
              create_new_folder
            </span>
          </button>
          <button type="button" title="Excluir pasta selecionada ou arquivo aberto" onClick={onDeleteSelection}>
            <span className="dev-code-studio__mi-toolbar material-icons-round" aria-hidden>
              delete
            </span>
          </button>
        </div>
      </div>
      <p className="dev-code-studio__workspace-name">WORKSPACE-LANCAMENTO</p>
      <div className="dev-code-studio__tree-scroll">
        <ul className="dev-code-studio__tree">{tree.map((node) => renderNode(node, 0))}</ul>
        {snapshot.files.length === 0 ? (
          <p className="dev-code-studio__explorer-empty">Nenhum arquivo. Use Arquivo → Novo arquivo.</p>
        ) : null}
      </div>
    </aside>
  );
}
