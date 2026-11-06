import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  buildCodeStudioTree,
  fileBaseName,
  folderParentPath,
  joinPath,
  type CodeStudioTreeNode,
  type DevCodeStudioSnapshot
} from "@ederson-agencia/shared";
import { FolderChevron } from "./CodeStudioMenuBar";
import { materialFileSlot, materialFolderSlot } from "./fileMaterialIcon";

export type ExplorerTreeSelection =
  | { kind: "folder"; path: string }
  | { kind: "file"; id: string; path: string };

export type CodeStudioExplorerHandle = {
  startRenameSelection: () => void;
  startCreateFile: () => void;
  startCreateFolder: () => void;
};

type CodeStudioExplorerProps = {
  snapshot: DevCodeStudioSnapshot;
  activeFileId?: string;
  selectedDir: string;
  /** Pasta pai para Novo arquivo / Nova pasta (atalhos e barra do explorador). */
  parentDirForCreate: string;
  treeSelection: ExplorerTreeSelection | null;
  onTreeSelectionChange: (sel: ExplorerTreeSelection | null) => void;
  onSelectDir: (dir: string) => void;
  /** Clique simples = preview; duplo clique = fixar aba (vscode.dev). F2 renomeia. */
  onOpenFile: (fileId: string, mode: "preview" | "pin") => void;
  onCommitNewFile: (parentDir: string, fileName: string) => void;
  onCommitNewFolder: (parentDir: string, folderName: string) => void;
  /** Aviso ao confirmar nome inválido na criação (ex.: barras). */
  onCreateValidationError?: (message: string) => void;
  /** Enter no input ou blur: aplica rename. */
  onRenameCommit: (path: string, isFolder: boolean, newName: string) => void;
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

export const CodeStudioExplorer = forwardRef<CodeStudioExplorerHandle, CodeStudioExplorerProps>(function CodeStudioExplorer(
  {
    snapshot,
    activeFileId,
    selectedDir,
    parentDirForCreate,
    treeSelection,
    onTreeSelectionChange,
    onSelectDir,
    onOpenFile,
    onCommitNewFile,
    onCommitNewFolder,
    onCreateValidationError,
    onRenameCommit
  },
  ref
) {
  const tree = useMemo(() => buildCodeStudioTree(snapshot), [snapshot]);
  const allFolders = useMemo(() => collectFolderPaths(snapshot), [snapshot]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(allFolders));
  const renameInputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);
  const [renameTarget, setRenameTarget] = useState<{ kind: "folder" | "file"; path: string } | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [createInput, setCreateInput] = useState<{ mode: "file" | "folder"; parentDir: string; draft: string } | null>(null);

  useEffect(() => {
    if (!renameTarget) return;
    const t = requestAnimationFrame(() => {
      const el = renameInputRef.current;
      if (!el) return;
      el.focus();
      el.select();
    });
    return () => cancelAnimationFrame(t);
  }, [renameTarget]);

  useEffect(() => {
    if (!createInput) return;
    const t = requestAnimationFrame(() => {
      const el = createInputRef.current;
      if (!el) return;
      el.focus();
      el.select();
    });
    return () => cancelAnimationFrame(t);
  }, [createInput]);

  /** Mostrar a pasta alvo ao criar (expandir ancestors). */
  useEffect(() => {
    if (!createInput?.parentDir) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      let p = createInput.parentDir.replace(/\\/g, "/").replace(/\/+$/, "");
      while (p) {
        next.add(p);
        const i = p.lastIndexOf("/");
        p = i === -1 ? "" : p.slice(0, i);
      }
      return next;
    });
  }, [createInput?.parentDir]);

  useImperativeHandle(
    ref,
    () => ({
      startRenameSelection: () => {
        if (!treeSelection || renameTarget || createInput) return;
        if (treeSelection.kind === "folder") {
          setRenameTarget({ kind: "folder", path: treeSelection.path });
          setRenameDraft(fileBaseName(treeSelection.path));
        } else {
          setRenameTarget({ kind: "file", path: treeSelection.path });
          setRenameDraft(fileBaseName(treeSelection.path));
        }
      },
      startCreateFile: () => {
        setRenameTarget(null);
        setRenameDraft("");
        setCreateInput({ mode: "file", parentDir: parentDirForCreate, draft: "" });
      },
      startCreateFolder: () => {
        setRenameTarget(null);
        setRenameDraft("");
        setCreateInput({ mode: "folder", parentDir: parentDirForCreate, draft: "" });
      }
    }),
    [createInput, parentDirForCreate, renameTarget, treeSelection]
  );

  const cancelRename = () => {
    setRenameTarget(null);
    setRenameDraft("");
  };

  const cancelCreate = () => {
    setCreateInput(null);
  };

  const commitCreate = () => {
    if (!createInput) return;
    const name = createInput.draft.trim();
    if (!name) {
      cancelCreate();
      return;
    }
    if (/[/\\]/.test(name)) {
      onCreateValidationError?.("Nome inválido: não use barras.");
      cancelCreate();
      return;
    }
    if (createInput.mode === "file") {
      onCommitNewFile(createInput.parentDir, name);
    } else {
      onCommitNewFolder(createInput.parentDir, name);
    }
    cancelCreate();
  };

  const commitRename = () => {
    if (!renameTarget) return;
    const next = renameDraft.trim();
    if (!next) {
      cancelRename();
      return;
    }
    onRenameCommit(renameTarget.path, renameTarget.kind === "folder", next);
    cancelRename();
  };

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
      const isRenamingFolder = renameTarget?.kind === "folder" && renameTarget.path === node.path;
      const folderSelected = treeSelection?.kind === "folder" && treeSelection.path === node.path;
      return (
        <li key={node.id}>
          <div
            className={`dev-code-studio__tree-row${folderSelected || selectedDir === node.path ? " is-selected-dir" : ""}`}
            style={{ paddingLeft: `${8 + depth * 12}px` }}
          >
            <button type="button" className="dev-code-studio__tree-chevron" onClick={() => toggleFolder(node.path)} aria-label={open ? "Recolher" : "Expandir"}>
              <FolderChevron open={open} />
            </button>
            {isRenamingFolder ? (
              <div className="dev-code-studio__tree-rename">
                <span
                  className="dev-code-studio__mi dev-code-studio__mi--folder material-icons-round"
                  data-mi-key={folderSlot.key}
                  aria-hidden
                >
                  {folderSlot.icon}
                </span>
                <input
                  ref={renameInputRef}
                  className="dev-code-studio__tree-rename-input"
                  value={renameDraft}
                  aria-label="Novo nome da pasta"
                  onChange={(e) => setRenameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitRename();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      cancelRename();
                    }
                  }}
                  onBlur={commitRename}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ) : (
              <button
                type="button"
                className="dev-code-studio__tree-label"
                onClick={() => {
                  onTreeSelectionChange({ kind: "folder", path: node.path });
                  onSelectDir(node.path);
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  setRenameTarget({ kind: "folder", path: node.path });
                  setRenameDraft(node.name);
                }}
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
            )}
          </div>
          {open && node.children.length > 0 ? (
            <ul>{node.children.map((child) => renderNode(child, depth + 1))}</ul>
          ) : null}
        </li>
      );
    }
    const active = activeFileId === node.id;
    const fileSlot = materialFileSlot(node.name);
    const isRenamingFile = renameTarget?.kind === "file" && renameTarget.path === node.path;
    const fileSelected = treeSelection?.kind === "file" && treeSelection.id === node.id;
    return (
      <li key={node.id}>
        <div
          className={`dev-code-studio__tree-row${fileSelected ? " is-tree-file-selected" : ""}`}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
          <span className="dev-code-studio__tree-chevron-spacer" />
          {isRenamingFile ? (
            <div className={`dev-code-studio__tree-rename dev-code-studio__tree-file${active ? " is-active" : ""}`}>
              <span
                className="dev-code-studio__mi dev-code-studio__mi--file material-icons-round"
                data-mi-key={fileSlot.key}
                aria-hidden
              >
                {fileSlot.icon}
              </span>
              <input
                ref={renameInputRef}
                className="dev-code-studio__tree-rename-input"
                value={renameDraft}
                aria-label="Novo nome do arquivo"
                onChange={(e) => setRenameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitRename();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelRename();
                  }
                }}
                onBlur={commitRename}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <button
              type="button"
              className={`dev-code-studio__tree-label dev-code-studio__tree-file${active ? " is-active" : ""}`}
              onClick={() => {
                onTreeSelectionChange({ kind: "file", id: node.id, path: node.path });
                onSelectDir(folderParentPath(node.path));
                onOpenFile(node.id, "preview");
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                onTreeSelectionChange({ kind: "file", id: node.id, path: node.path });
                onSelectDir(folderParentPath(node.path));
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
          )}
        </div>
      </li>
    );
  };

  return (
    <aside className="dev-code-studio__explorer" aria-label="Explorador">
      <div className="dev-code-studio__explorer-head">
        <p className="dev-code-studio__explorer-label">EXPLORADOR</p>
        <div className="dev-code-studio__explorer-actions">
          <button
            type="button"
            title="Novo arquivo — digite o nome em seguida"
            onClick={() => {
              setRenameTarget(null);
              setCreateInput({ mode: "file", parentDir: parentDirForCreate, draft: "" });
            }}
          >
            <span className="dev-code-studio__mi-toolbar material-icons-round" aria-hidden>
              note_add
            </span>
          </button>
          <button
            type="button"
            title="Nova pasta — digite o nome em seguida"
            onClick={() => {
              setRenameTarget(null);
              setCreateInput({ mode: "folder", parentDir: parentDirForCreate, draft: "" });
            }}
          >
            <span className="dev-code-studio__mi-toolbar material-icons-round" aria-hidden>
              create_new_folder
            </span>
          </button>
        </div>
      </div>
      <p className="dev-code-studio__workspace-name">WORKSPACE-LANCAMENTO</p>
      <div className="dev-code-studio__tree-scroll">
        {createInput ? (
          <div className="dev-code-studio__create-hint">
            {createInput.mode === "file" ? "Novo arquivo em" : "Nova pasta em"}{" "}
            <code className="dev-code-studio__create-path">{createInput.parentDir.replace(/\\/g, "/") || "raiz"}</code>
          </div>
        ) : null}
        {createInput ? (
          <div className="dev-code-studio__tree-row dev-code-studio__create-row" style={{ paddingLeft: "8px" }}>
            <span className="dev-code-studio__tree-chevron-spacer" />
            <div className="dev-code-studio__tree-rename dev-code-studio__tree-create">
              <input
                ref={createInputRef}
                className="dev-code-studio__tree-rename-input"
                value={createInput.draft}
                aria-label={createInput.mode === "file" ? "Nome do novo arquivo" : "Nome da nova pasta"}
                placeholder={createInput.mode === "file" ? "ex.: index.ts" : "ex.: components"}
                onChange={(e) => setCreateInput((c) => (c ? { ...c, draft: e.target.value } : c))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitCreate();
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelCreate();
                  }
                }}
                onBlur={commitCreate}
              />
            </div>
          </div>
        ) : null}
        <ul className="dev-code-studio__tree">{tree.map((node) => renderNode(node, 0))}</ul>
        {snapshot.files.length === 0 ? (
          <p className="dev-code-studio__explorer-empty">Nenhum arquivo. Use o botão acima ou Arquivo → Novo arquivo e digite o nome.</p>
        ) : null}
      </div>
    </aside>
  );
});
