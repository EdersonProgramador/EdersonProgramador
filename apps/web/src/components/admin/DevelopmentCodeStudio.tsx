import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import {
  type ChangeEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { setupMonaco } from "../../monaco/setupMonaco";
import { buildHtmlPreviewSrcDoc } from "../../monaco/htmlPreviewDocument";
import {
  AGENCY_APP_BASE,
  createFileInSnapshot,
  createFolderInSnapshot,
  defaultDevCodeStudioSnapshot,
  DEV_CODE_STUDIO_FIELD_ID,
  closeTabInSnapshot,
  deleteFileFromSnapshot,
  deleteFolderFromSnapshot,
  ensureOpenTabs,
  fileBaseName,
  folderParentPath,
  importFileIntoSnapshot,
  importFilesIntoSnapshot,
  joinPath,
  openFileInTab,
  parseDevCodeStudioSnapshot,
  pinTabForFile,
  renamePathInSnapshot,
  serializeDevCodeStudioSnapshot,
  setActiveOpenFile,
  uniqueFileNameInDirectory,
  uniqueFolderNameInDirectory,
  type DevCodeStudioSnapshot,
  type ImportLocalFileSpec
} from "@ederson-agencia/shared";
import { patchProjectWorkspace } from "../../api/project-workspace-api";
import { Braces, Copy, Eye, Maximize2, Minimize2, Monitor, Sparkles, WrapText, X } from "lucide-react";
import {
  CodeStudioExplorer,
  type CodeStudioExplorerHandle,
  type ExplorerTreeSelection
} from "./code-studio/CodeStudioExplorer";
import { CodeStudioHtmlPreview } from "./code-studio/CodeStudioHtmlPreview";
import { CodeStudioMenuBar, type CodeStudioMenu } from "./code-studio/CodeStudioMenuBar";
import { CodeStudioWelcome } from "./code-studio/CodeStudioWelcome";
import "../../styles/dev-code-studio.css";

type DevelopmentCodeStudioProps = {
  projectId?: string;
  storedRaw: string | undefined;
  onStoredChange: (raw: string) => void;
  onError: (message: string) => void;
  onSavingChange?: (saving: boolean) => void;
};

setupMonaco();

const EDITOR_MIN_PX = 480;
/** Mensagem única para nomes com barra em criar/renomear. */
const INVALID_PATH_NAME_MESSAGE = "O nome não pode conter barras (/ ou \\).";
/** Texto — limite por arquivo. */
const LOCAL_FILE_MAX_BYTES = 5 * 1024 * 1024;
/** Limite total para importação em lote / pasta. */
const LOCAL_BATCH_MAX_TOTAL_BYTES = 20 * 1024 * 1024;

function shouldSkipImportedPath(relativePath: string): boolean {
  const norm = relativePath.replace(/\\/g, "/");
  return (
    norm.includes("/node_modules/") ||
    norm.startsWith("node_modules/") ||
    norm.includes("/.git/") ||
    norm.startsWith(".git/") ||
    norm.includes("/.next/") ||
    norm.startsWith(".next/")
  );
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("read"));
    reader.readAsText(file);
  });
}

const LANGUAGE_OPTIONS: { id: string; label: string }[] = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "json", label: "JSON" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "sql", label: "SQL" },
  { id: "markdown", label: "Markdown" },
  { id: "yaml", label: "YAML" },
  { id: "plaintext", label: "Texto" }
];

type MonacoColorThemeId = "vs" | "vs-dark" | "dracula";

type EditorThemeChoice = "auto" | MonacoColorThemeId;

function useUiThemeNight(): boolean {
  const [night, setNight] = useState(() => document.documentElement.getAttribute("data-theme") === "dark");
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setNight(el.getAttribute("data-theme") === "dark");
    const obs = new MutationObserver(sync);
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return night;
}

function cursorLabel(editor: MonacoEditor.IStandaloneCodeEditor | null): string {
  if (!editor) return "Ln 1, Col 1";
  const pos = editor.getPosition();
  if (!pos) return "Ln 1, Col 1";
  return `Ln ${pos.lineNumber}, Col ${pos.column}`;
}

const EDITOR_THEME_KEY = "dev-code-studio-editor-theme";

function keyTargetIsMonacoEditor(): boolean {
  const el = document.activeElement;
  if (!el || !(el instanceof Element)) return false;
  return el.closest(".monaco-editor") !== null;
}

export function DevelopmentCodeStudio({
  projectId,
  storedRaw,
  onStoredChange,
  onError,
  onSavingChange
}: DevelopmentCodeStudioProps) {
  const uiNight = useUiThemeNight();
  const [editorThemeChoice, setEditorThemeChoice] = useState<EditorThemeChoice>(() => {
    try {
      const v = localStorage.getItem(EDITOR_THEME_KEY) as EditorThemeChoice | null;
      if (v === "vs" || v === "vs-dark" || v === "dracula" || v === "auto") return v;
    } catch {
      /* ignore */
    }
    return "auto";
  });
  const monacoTheme: MonacoColorThemeId = editorThemeChoice === "auto" ? (uiNight ? "vs-dark" : "vs") : editorThemeChoice;
  const shellUi: "light" | "dark" = monacoTheme === "vs" ? "light" : "dark";
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const paneRef = useRef<HTMLDivElement | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const explorerRef = useRef<CodeStudioExplorerHandle | null>(null);
  const [editorHeightPx, setEditorHeightPx] = useState(EDITOR_MIN_PX);

  const initial = useMemo(
    () => ensureOpenTabs(parseDevCodeStudioSnapshot(storedRaw) ?? defaultDevCodeStudioSnapshot()),
    [storedRaw]
  );

  const [snapshot, setSnapshot] = useState<DevCodeStudioSnapshot>(initial);
  const [cursor, setCursor] = useState("Ln 1, Col 1");
  const [wordWrap, setWordWrap] = useState(true);
  const [minimap, setMinimap] = useState(true);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [htmlPreviewOpen, setHtmlPreviewOpen] = useState(false);
  const [selectedDir, setSelectedDir] = useState("");
  const [treeSelection, setTreeSelection] = useState<ExplorerTreeSelection | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(EDITOR_THEME_KEY, editorThemeChoice);
    } catch {
      /* ignore */
    }
  }, [editorThemeChoice]);

  useEffect(() => {
    setSnapshot(ensureOpenTabs(parseDevCodeStudioSnapshot(storedRaw) ?? defaultDevCodeStudioSnapshot()));
  }, [projectId, storedRaw]);

  useLayoutEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const measure = () => setEditorHeightPx(Math.max(el.clientHeight, EDITOR_MIN_PX));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [explorerOpen, terminalOpen, htmlPreviewOpen]);

  const studio = useMemo(() => ensureOpenTabs(snapshot), [snapshot]);

  const activeFile = studio.openFileId ? studio.files.find((f) => f.id === studio.openFileId) ?? null : null;

  const openTabs = studio.openTabs?.tabs ?? [];

  const parentDirForCreate = useMemo(() => {
    if (treeSelection?.kind === "folder") return treeSelection.path;
    if (treeSelection?.kind === "file") return folderParentPath(treeSelection.path);
    return selectedDir;
  }, [treeSelection, selectedDir]);

  const htmlPreviewSrcDoc = useMemo(() => {
    if (!activeFile || activeFile.language !== "html") return "";
    try {
      return buildHtmlPreviewSrcDoc(activeFile.content, activeFile.path, studio.files);
    } catch {
      return `<!DOCTYPE html><html><body><pre>Erro ao montar o preview.</pre></body></html>`;
    }
  }, [activeFile, studio.files]);

  useEffect(() => {
    if (activeFile?.language !== "html") setHtmlPreviewOpen(false);
  }, [activeFile?.language, activeFile?.id]);

  const persist = useCallback(
    (next: DevCodeStudioSnapshot) => {
      const raw = serializeDevCodeStudioSnapshot(ensureOpenTabs(next));
      onStoredChange(raw);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (!projectId) return;
      saveTimer.current = setTimeout(() => {
        onSavingChange?.(true);
        void patchProjectWorkspace(projectId, { fieldId: DEV_CODE_STUDIO_FIELD_ID, value: raw })
          .catch((err) => onError(err instanceof Error ? err.message : "Falha ao salvar studio."))
          .finally(() => onSavingChange?.(false));
      }, 700);
    },
    [projectId, onStoredChange, onError, onSavingChange]
  );

  const updateSnapshot = useCallback(
    (updater: (prev: DevCodeStudioSnapshot) => DevCodeStudioSnapshot) => {
      setSnapshot((prev) => {
        const next = ensureOpenTabs(updater(ensureOpenTabs(prev)));
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const runEditorAction = (actionId: string) => {
    const ed = editorRef.current;
    const action = ed?.getAction(actionId);
    if (action?.isSupported?.() === false) return;
    void action?.run();
  };

  const onCommitNewFile = useCallback(
    (parentDir: string, rawName: string) => {
      const trimmed = rawName.trim();
      if (!trimmed) return;
      if (/[/\\]/.test(trimmed)) {
        onError(INVALID_PATH_NAME_MESSAGE);
        return;
      }
      updateSnapshot((prev) => {
        const name = uniqueFileNameInDirectory(prev, parentDir, trimmed);
        return createFileInSnapshot(prev, parentDir, name);
      });
    },
    [onError, updateSnapshot]
  );

  const onCommitNewFolder = useCallback(
    (parentDir: string, rawName: string) => {
      const trimmed = rawName.trim();
      if (!trimmed) return;
      if (/[/\\]/.test(trimmed)) {
        onError(INVALID_PATH_NAME_MESSAGE);
        return;
      }
      updateSnapshot((prev) => {
        const name = uniqueFolderNameInDirectory(prev, parentDir, trimmed);
        return createFolderInSnapshot(prev, parentDir, name);
      });
    },
    [onError, updateSnapshot]
  );

  /** Abre o explorador e foca o campo de nome (atalhos / tela inicial). */
  const startCreateFileFlow = useCallback(() => {
    setExplorerOpen(true);
    setTimeout(() => explorerRef.current?.startCreateFile(), 0);
  }, []);

  const startCreateFolderFlow = useCallback(() => {
    setExplorerOpen(true);
    setTimeout(() => explorerRef.current?.startCreateFolder(), 0);
  }, []);

  const triggerOpenLocalFile = useCallback(() => {
    const el = fileInputRef.current;
    if (el) el.value = "";
    el?.click();
  }, []);

  const triggerOpenLocalFiles = useCallback(() => {
    const el = multiFileInputRef.current;
    if (el) el.value = "";
    el?.click();
  }, []);

  const triggerOpenFolder = useCallback(() => {
    const el = folderInputRef.current;
    if (el) el.value = "";
    el?.click();
  }, []);

  const importSpecsFromFiles = useCallback(
    async (fileList: FileList | File[], resolveRelative: (f: File) => string | null) => {
      const files = Array.from(fileList);
      type Planned = { file: File; relativePath: string };
      const planned: Planned[] = [];
      let total = 0;
      for (const file of files) {
        const rel = resolveRelative(file);
        if (rel === null) continue;
        if (shouldSkipImportedPath(rel)) continue;
        if (file.size > LOCAL_FILE_MAX_BYTES) {
          onError(`Ignorado (muito grande): ${rel} — máx. ${LOCAL_FILE_MAX_BYTES / (1024 * 1024)} MB por arquivo.`);
          continue;
        }
        total += file.size;
        if (total > LOCAL_BATCH_MAX_TOTAL_BYTES) {
          onError(
            `Limite total de importação (${LOCAL_BATCH_MAX_TOTAL_BYTES / (1024 * 1024)} MB) excedido. Reduza a seleção ou exclua pastas pesadas (ex.: node_modules).`
          );
          return;
        }
        planned.push({ file, relativePath: rel });
      }
      if (planned.length === 0) return;
      const specs: ImportLocalFileSpec[] = [];
      for (const { file, relativePath } of planned) {
        try {
          const content = await readFileAsText(file);
          specs.push({ relativePath, content });
        } catch {
          onError(`Não foi possível ler: ${relativePath}`);
        }
      }
      if (specs.length === 0) return;
      updateSnapshot((prev) => importFilesIntoSnapshot(prev, parentDirForCreate, specs));
    },
    [onError, parentDirForCreate, updateSnapshot]
  );

  const onLocalFilePicked = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > LOCAL_FILE_MAX_BYTES) {
        onError(`Arquivo muito grande (máximo ${LOCAL_FILE_MAX_BYTES / (1024 * 1024)} MB para importação).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        updateSnapshot((prev) => importFileIntoSnapshot(prev, parentDirForCreate, file.name, text));
      };
      reader.onerror = () => onError("Não foi possível ler o arquivo.");
      reader.readAsText(file);
    },
    [onError, parentDirForCreate, updateSnapshot]
  );

  const onMultiLocalFilesPicked = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list?.length) return;
      await importSpecsFromFiles(list, (f) => f.name);
    },
    [importSpecsFromFiles]
  );

  const onLocalFolderPicked = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list?.length) return;
      await importSpecsFromFiles(list, (f) => {
        const wrp = (f as File & { webkitRelativePath?: string }).webkitRelativePath;
        if (!wrp) return f.name;
        const parts = wrp.replace(/\\/g, "/").split("/").filter(Boolean);
        if (parts.length <= 1) return fileBaseName(wrp);
        return parts.slice(1).join("/");
      });
    },
    [importSpecsFromFiles]
  );

  const onRenameCommit = useCallback(
    (oldPath: string, isFolder: boolean, rawNewName: string) => {
      const trimmed = rawNewName.trim();
      if (!trimmed) return;
      const slash = /[/\\]/;
      if (slash.test(trimmed)) {
        onError(INVALID_PATH_NAME_MESSAGE);
        return;
      }
      const baseOld = fileBaseName(oldPath);
      if (trimmed === baseOld) return;
      const parent = folderParentPath(oldPath);
      const newPath = isFolder ? (parent ? joinPath(parent, trimmed) : trimmed) : joinPath(parent, trimmed);
      const oldN = oldPath.replace(/\\/g, "/");
      const newN = newPath.replace(/\\/g, "/");
      const prefix = oldN + "/";

      updateSnapshot((prev) => {
        if (isFolder) {
          const exists = prev.folders.some((f) => f.path.replace(/\\/g, "/") === newN);
          if (exists) return prev;
        } else {
          const exists = prev.files.some((f) => f.path.replace(/\\/g, "/") === newN);
          if (exists) return prev;
        }
        return renamePathInSnapshot(prev, oldN, newN);
      });

      setSelectedDir((dir) => {
        const d = dir.replace(/\\/g, "/");
        if (d === oldN) return newN;
        if (d.startsWith(prefix)) return newN + d.slice(oldN.length);
        return dir;
      });
      setTreeSelection((sel) => {
        if (!sel) return sel;
        if (isFolder && sel.kind === "folder" && sel.path.replace(/\\/g, "/") === oldN) {
          return { kind: "folder", path: newN };
        }
        if (!isFolder && sel.kind === "file") {
          const p = sel.path.replace(/\\/g, "/");
          if (p === oldN) return { kind: "file", id: sel.id, path: newN };
        }
        return sel;
      });
    },
    [onError, updateSnapshot]
  );

  const onDelete = useCallback(
    (path: string, isFolder: boolean) => {
      updateSnapshot((prev) => {
        if (isFolder) return deleteFolderFromSnapshot(prev, path);
        const file = prev.files.find((f) => f.path === path);
        return file ? deleteFileFromSnapshot(prev, file.id) : prev;
      });
    },
    [updateSnapshot]
  );

  const onDeleteSelection = useCallback(() => {
    if (treeSelection?.kind === "folder") {
      onDelete(treeSelection.path, true);
      const tp = treeSelection.path.replace(/\\/g, "/");
      const sd = selectedDir.replace(/\\/g, "/");
      if (sd === tp || sd.startsWith(`${tp}/`)) setSelectedDir("");
      setTreeSelection(null);
      return;
    }
    if (treeSelection?.kind === "file") {
      onDelete(treeSelection.path, false);
      setTreeSelection(null);
      return;
    }
    if (selectedDir) {
      onDelete(selectedDir, true);
      setSelectedDir("");
      setTreeSelection(null);
      return;
    }
    const af = studio.files.find((f) => f.id === studio.openFileId);
    if (af) onDelete(af.path, false);
  }, [onDelete, selectedDir, studio.files, studio.openFileId, treeSelection]);

  const openExplorerFile = useCallback(
    (fileId: string, mode: "preview" | "pin") => {
      updateSnapshot((prev) => openFileInTab(prev, fileId, mode));
    },
    [updateSnapshot]
  );

  const closeEditorTab = useCallback(
    (fileId: string, e?: MouseEvent<HTMLButtonElement>) => {
      e?.stopPropagation();
      updateSnapshot((prev) => closeTabInSnapshot(prev, fileId));
    },
    [updateSnapshot]
  );

  const expandIdeUrl = useMemo(() => {
    const path = `${AGENCY_APP_BASE}/studio/desenvolvimento`;
    const qs = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
    return `${path}${qs}`;
  }, [projectId]);

  const menus: CodeStudioMenu[] = useMemo(
    () => [
      {
        id: "file",
        label: "Arquivo",
        items: [
          { id: "new-file", label: "Criar arquivo…", shortcut: "Ctrl+N", onClick: () => startCreateFileFlow() },
          { id: "new-folder", label: "Criar pasta…", shortcut: "Ctrl+Shift+N", onClick: () => startCreateFolderFlow() },
          {
            id: "open-file",
            label: "Abrir arquivo do computador…",
            shortcut: "Ctrl+O",
            onClick: () => triggerOpenLocalFile()
          },
          {
            id: "open-files",
            label: "Importar vários arquivos…",
            onClick: () => triggerOpenLocalFiles()
          },
          {
            id: "open-folder",
            label: "Importar pasta do projeto…",
            onClick: () => triggerOpenFolder()
          },
          {
            id: "save",
            label: "Salvar",
            shortcut: "Ctrl+S",
            disabled: !projectId,
            onClick: () => persist(studio)
          },
          {
            id: "close",
            label: "Fechar aba do editor",
            disabled: !activeFile,
            onClick: () => {
              if (!activeFile) return;
              updateSnapshot((prev) => closeTabInSnapshot(prev, activeFile.id));
            }
          },
          {
            id: "clear-ws",
            label: "Esvaziar workspace",
            disabled: studio.files.length === 0,
            onClick: () => {
              setSelectedDir("");
              setTreeSelection(null);
              updateSnapshot(() => defaultDevCodeStudioSnapshot());
            }
          }
        ]
      },
      {
        id: "edit",
        label: "Editar",
        items: [
          { id: "undo", label: "Desfazer", shortcut: "Ctrl+Z", onClick: () => runEditorAction("undo") },
          { id: "redo", label: "Refazer", shortcut: "Ctrl+Y", onClick: () => runEditorAction("redo") },
          { id: "cut", label: "Recortar", shortcut: "Ctrl+X", onClick: () => runEditorAction("editor.action.clipboardCutAction") },
          { id: "copy", label: "Copiar", shortcut: "Ctrl+C", onClick: () => runEditorAction("editor.action.clipboardCopyAction") },
          { id: "paste", label: "Colar", shortcut: "Ctrl+V", onClick: () => runEditorAction("editor.action.clipboardPasteAction") },
          { id: "select-all", label: "Selecionar tudo", shortcut: "Ctrl+A", onClick: () => runEditorAction("editor.action.selectAll") },
          { id: "format", label: "Formatar documento", shortcut: "Shift+Alt+F", onClick: () => runEditorAction("editor.action.formatDocument") },
          {
            id: "rename-explorer",
            label: "Renomear no explorador",
            shortcut: "F2",
            disabled: !treeSelection,
            onClick: () => explorerRef.current?.startRenameSelection()
          },
          {
            id: "delete-explorer",
            label: "Remover do workspace",
            shortcut: "Del",
            disabled: !treeSelection && !selectedDir && !activeFile,
            onClick: () => onDeleteSelection()
          }
        ]
      },
      {
        id: "selection",
        label: "Seleção",
        items: [
          { id: "expand", label: "Expandir seleção", shortcut: "Shift+Alt+→", onClick: () => runEditorAction("editor.action.smartSelect.expand") },
          { id: "shrink", label: "Recolher seleção", shortcut: "Shift+Alt+←", onClick: () => runEditorAction("editor.action.smartSelect.shrink") }
        ]
      },
      {
        id: "view",
        label: "Exibir",
        items: [
          { id: "explorer", label: "Explorador", onClick: () => setExplorerOpen((v) => !v) },
          {
            id: "html-preview",
            label: "Preview HTML (navegador interno)",
            disabled: activeFile?.language !== "html",
            onClick: () => setHtmlPreviewOpen((v) => !v)
          },
          { id: "terminal", label: "Terminal", shortcut: "Ctrl+`", onClick: () => setTerminalOpen((v) => !v) },
          { id: "minimap", label: "Minimap", onClick: () => setMinimap((v) => !v) },
          { id: "wordwrap", label: "Quebra de linha", onClick: () => setWordWrap((v) => !v) },
          { id: "palette", label: "Paleta de comandos", shortcut: "F1", onClick: () => runEditorAction("editor.action.quickCommand") },
          {
            id: "expand-ide",
            label: "Expandir IDE (nova aba)",
            onClick: () => window.open(expandIdeUrl, "_blank", "noopener,noreferrer")
          }
        ]
      },
      {
        id: "run",
        label: "Executar",
        items: [
          {
            id: "run-hint",
            label: "Executar / depurar (em breve)",
            disabled: true,
            onClick: () => undefined
          }
        ]
      },
      {
        id: "terminal-menu",
        label: "Terminal",
        items: [{ id: "toggle-term", label: "Novo terminal", shortcut: "Ctrl+Shift+`", onClick: () => setTerminalOpen(true) }]
      },
      {
        id: "help",
        label: "Ajuda",
        items: [
          {
            id: "docs",
            label: "Documentação Monaco",
            onClick: () => window.open("https://microsoft.github.io/monaco-editor/", "_blank", "noopener,noreferrer")
          },
          {
            id: "vscode",
            label: "Referência vscode.dev",
            onClick: () => window.open("https://vscode.dev/?vscode-lang=pt-br", "_blank", "noopener,noreferrer")
          },
          {
            id: "extensions-note",
            label: "— Este editor (Monaco) não instala extensões do VS Code —",
            disabled: true,
            onClick: () => undefined
          },
          {
            id: "extensions-vscode-dev",
            label: "Extensões no navegador (vscode.dev)",
            onClick: () => window.open("https://vscode.dev/?vscode-lang=pt-br", "_blank", "noopener,noreferrer")
          },
          {
            id: "extensions-marketplace",
            label: "Marketplace de extensões VS Code",
            onClick: () => window.open("https://marketplace.visualstudio.com/vscode", "_blank", "noopener,noreferrer")
          }
        ]
      }
    ],
    [
      activeFile,
      activeFile?.language,
      expandIdeUrl,
      onDeleteSelection,
      startCreateFileFlow,
      startCreateFolderFlow,
      persist,
      projectId,
      runEditorAction,
      selectedDir,
      setExplorerOpen,
      studio,
      studio.files.length,
      treeSelection,
      triggerOpenFolder,
      triggerOpenLocalFile,
      triggerOpenLocalFiles,
      updateSnapshot
    ]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const skipWhenMonaco = keyTargetIsMonacoEditor();
      const key = e.key;
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
        if (key === "F2" || key === "Delete" || key === "Backspace") return;
      }

      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        persist(studio);
      }
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
        updateSnapshot((prev) => {
          const id = ensureOpenTabs(prev).openFileId;
          if (!id) return prev;
          return closeTabInSnapshot(prev, id);
        });
      }
      if (e.ctrlKey && e.shiftKey && e.key === "N") {
        e.preventDefault();
        startCreateFolderFlow();
      }
      if (e.ctrlKey && !e.shiftKey && e.key === "n") {
        e.preventDefault();
        startCreateFileFlow();
      }
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        triggerOpenLocalFile();
      }
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setTerminalOpen((v) => !v);
      }

      if (key === "F2" && explorerOpen && treeSelection && !skipWhenMonaco) {
        e.preventDefault();
        explorerRef.current?.startRenameSelection();
      }
      if ((key === "Delete" || key === "Backspace") && explorerOpen && (treeSelection || selectedDir || activeFile) && !skipWhenMonaco) {
        e.preventDefault();
        onDeleteSelection();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    activeFile,
    explorerOpen,
    onDeleteSelection,
    startCreateFileFlow,
    startCreateFolderFlow,
    persist,
    selectedDir,
    studio,
    treeSelection,
    triggerOpenLocalFile,
    updateSnapshot
  ]);

  const onEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    setCursor(cursorLabel(editor));
    editor.onDidChangeCursorPosition(() => setCursor(cursorLabel(editor)));
    editor.focus();
  };

  const onChange = (value: string | undefined) => {
    if (value === undefined || !activeFile) return;
    updateSnapshot((prev) =>
      pinTabForFile(
        {
          ...prev,
          files: prev.files.map((f) => (f.id === activeFile.id ? { ...f, content: value } : f))
        },
        activeFile.id
      )
    );
  };

  const setLanguage = (language: string) => {
    if (!activeFile) return;
    updateSnapshot((prev) =>
      pinTabForFile(
        {
          ...prev,
          files: prev.files.map((f) => (f.id === activeFile.id ? { ...f, language } : f))
        },
        activeFile.id
      )
    );
  };

  return (
    <div className="dev-code-studio" data-theme={shellUi}>
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only pointer-events-none absolute h-0 w-0 opacity-0"
        tabIndex={-1}
        aria-hidden
        onChange={onLocalFilePicked}
      />
      <input
        ref={multiFileInputRef}
        type="file"
        multiple
        className="sr-only pointer-events-none absolute h-0 w-0 opacity-0"
        tabIndex={-1}
        aria-hidden
        onChange={onMultiLocalFilesPicked}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="sr-only pointer-events-none absolute h-0 w-0 opacity-0"
        tabIndex={-1}
        aria-hidden
        {...({ webkitdirectory: "" } as InputHTMLAttributes<HTMLInputElement>)}
        onChange={onLocalFolderPicked}
      />
      <CodeStudioMenuBar menus={menus} />

      <div className="dev-code-studio__toolbar">
        <div className="dev-code-studio__toolbar-group dev-code-studio__toolbar-group--grow">
          {openTabs.length === 0 ? (
            <span className="dev-code-studio__tab-placeholder">Nenhuma aba aberta · clique num arquivo no explorador</span>
          ) : (
            openTabs.map((tab) => {
              const file = studio.files.find((f) => f.id === tab.fileId);
              if (!file) return null;
              const isActive = tab.fileId === studio.openFileId;
              return (
                <div
                  key={tab.fileId}
                  className={`dev-code-studio__tab dev-code-studio__tab--with-close${isActive ? " is-active" : ""}${
                    tab.preview ? " is-preview" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="dev-code-studio__tab-label"
                    onClick={() => {
                      setTreeSelection({ kind: "file", id: tab.fileId, path: file.path });
                      setSelectedDir(folderParentPath(file.path));
                      updateSnapshot((prev) => setActiveOpenFile(prev, tab.fileId));
                    }}
                    title={file.path}
                  >
                    {fileBaseName(file.path)}
                  </button>
                  <button
                    type="button"
                    className="dev-code-studio__tab-close"
                    title="Fechar aba"
                    aria-label={`Fechar ${fileBaseName(file.path)}`}
                    onClick={(ev) => closeEditorTab(tab.fileId, ev)}
                  >
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                </div>
              );
            })
          )}
        </div>
        <div className="dev-code-studio__toolbar-group dev-code-studio__toolbar-group--actions">
          <label className="dev-code-studio__theme">
            <Monitor className="h-3.5 w-3.5 opacity-70" aria-hidden />
            <select
              value={editorThemeChoice}
              onChange={(e) => setEditorThemeChoice(e.target.value as EditorThemeChoice)}
              aria-label="Tema do editor"
            >
              <option value="auto">Tema automático</option>
              <option value="vs">Claro (VS)</option>
              <option value="vs-dark">Escuro (VS)</option>
              <option value="dracula">Dracula (oficial)</option>
            </select>
          </label>
          <button
            type="button"
            className={`dev-code-studio__icon-btn${htmlPreviewOpen && activeFile?.language === "html" ? " is-active" : ""}`}
            title={activeFile?.language === "html" ? "Alternar preview HTML" : "Abra um arquivo HTML para usar o preview"}
            disabled={activeFile?.language !== "html"}
            onClick={() => setHtmlPreviewOpen((v) => !v)}
          >
            <Eye className="h-4 w-4" aria-hidden />
          </button>
          <label className="dev-code-studio__lang">
            <Braces className="h-3.5 w-3.5 opacity-70" aria-hidden />
            <select
              value={activeFile?.language ?? "typescript"}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Linguagem"
              disabled={!activeFile}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="dev-code-studio__icon-btn" title="Formatar" onClick={() => runEditorAction("editor.action.formatDocument")}>
            <Sparkles className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" className="dev-code-studio__icon-btn" title="Copiar" onClick={() => runEditorAction("editor.action.clipboardCopyAction")}>
            <Copy className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" className={`dev-code-studio__icon-btn${wordWrap ? " is-active" : ""}`} title="Quebra de linha" onClick={() => setWordWrap((v) => !v)}>
            <WrapText className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" className={`dev-code-studio__icon-btn${minimap ? " is-active" : ""}`} title="Minimap" onClick={() => setMinimap((v) => !v)}>
            {minimap ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>

      <div className="dev-code-studio__body">
        {explorerOpen ? (
          <CodeStudioExplorer
            ref={explorerRef}
            snapshot={studio}
            activeFileId={studio.openFileId}
            selectedDir={selectedDir}
            parentDirForCreate={parentDirForCreate}
            treeSelection={treeSelection}
            onTreeSelectionChange={setTreeSelection}
            onSelectDir={setSelectedDir}
            onOpenFile={openExplorerFile}
            onCommitNewFile={onCommitNewFile}
            onCommitNewFolder={onCommitNewFolder}
            onCreateValidationError={onError}
            onRenameCommit={onRenameCommit}
          />
        ) : null}

        <div className="dev-code-studio__editor-column">
          <div
            ref={paneRef}
            className={`dev-code-studio__editor-wrap${htmlPreviewOpen && activeFile?.language === "html" ? " dev-code-studio__editor-wrap--split" : ""}`}
          >
            {!activeFile ? (
              <CodeStudioWelcome
                onNewFile={startCreateFileFlow}
                onNewFolder={startCreateFolderFlow}
                onImportFile={triggerOpenLocalFile}
                onImportFiles={triggerOpenLocalFiles}
                onImportFolder={triggerOpenFolder}
              />
            ) : (
              <div className="monaco-editor-host" style={{ flex: 1, minHeight: 0 }}>
                <Editor
                  key={`${activeFile.id}-${monacoTheme}`}
                  height={editorHeightPx}
                  language={activeFile.language}
                  value={activeFile.content}
                  theme={monacoTheme}
                  onMount={onEditorMount}
                  onChange={onChange}
                  options={{
                  automaticLayout: true,
                  minimap: { enabled: minimap },
                  fontSize: 13,
                  lineHeight: 20,
                  fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, 'Courier New', monospace",
                  fontLigatures: true,
                  wordWrap: wordWrap ? "on" : "off",
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  padding: { top: 12, bottom: 12 },
                  renderLineHighlight: "all",
                  bracketPairColorization: { enabled: true },
                  guides: { bracketPairs: true, indentation: true },
                  rulers: [80, 120],
                  tabSize: 2,
                  insertSpaces: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  suggest: { preview: true, showKeywords: true, showSnippets: true },
                  quickSuggestions: { strings: true, other: true, comments: false },
                  folding: true,
                  links: true,
                  colorDecorators: true,
                  matchBrackets: "always",
                  occurrencesHighlight: "singleFile",
                  renderWhitespace: "selection",
                  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 }
                }}
                  loading={
                    <div className="dev-code-studio__loading">
                      <span className="dev-code-studio__loading-dot" />
                      Carregando Monaco…
                    </div>
                  }
                />
              </div>
            )}
            {htmlPreviewOpen && activeFile?.language === "html" && htmlPreviewSrcDoc ? (
              <CodeStudioHtmlPreview srcDoc={htmlPreviewSrcDoc} title={`Preview · ${fileBaseName(activeFile.path)}`} />
            ) : null}
          </div>
          {terminalOpen ? (
            <div className="dev-code-studio__terminal" aria-label="Terminal">
              <div className="dev-code-studio__terminal-head">TERMINAL</div>
              <pre className="dev-code-studio__terminal-body">
                {`$ echo "Terminal integrado em breve — use o editor para snippets do lançamento"
Terminal integrado em breve — use o editor para snippets do lançamento`}
              </pre>
            </div>
          ) : null}
        </div>
      </div>

      <footer className="dev-code-studio__status">
        <span>{activeFile?.language ?? "—"}</span>
        <span className="min-w-0 truncate">{activeFile?.path ?? "Nenhum arquivo aberto — crie ou importe um arquivo"}</span>
        <span>UTF-8</span>
        <span>Spaces: 2</span>
        <span className="dev-code-studio__status-grow">{cursor}</span>
        <span>Monaco · estilo vscode.dev</span>
      </footer>
    </div>
  );
}
