import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { setupMonaco } from "../../monaco/setupMonaco";
import {
  createFileInSnapshot,
  createFolderInSnapshot,
  defaultDevCodeStudioSnapshot,
  DEV_CODE_STUDIO_FIELD_ID,
  deleteFileFromSnapshot,
  deleteFolderFromSnapshot,
  fileBaseName,
  joinPath,
  parseDevCodeStudioSnapshot,
  renamePathInSnapshot,
  serializeDevCodeStudioSnapshot,
  type DevCodeStudioSnapshot
} from "@ederson-agencia/shared";
import { patchProjectWorkspace } from "../../api/project-workspace-api";
import { Braces, Copy, Maximize2, Minimize2, Sparkles, WrapText } from "lucide-react";
import { CodeStudioExplorer } from "./code-studio/CodeStudioExplorer";
import { CodeStudioMenuBar, type CodeStudioMenu } from "./code-studio/CodeStudioMenuBar";
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

function useMonacoTheme(): "vs" | "vs-dark" {
  const [theme, setTheme] = useState<"vs" | "vs-dark">(() =>
    document.documentElement.getAttribute("data-theme") === "dark" ? "vs-dark" : "vs"
  );
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setTheme(el.getAttribute("data-theme") === "dark" ? "vs-dark" : "vs");
    const obs = new MutationObserver(sync);
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

function cursorLabel(editor: MonacoEditor.IStandaloneCodeEditor | null): string {
  if (!editor) return "Ln 1, Col 1";
  const pos = editor.getPosition();
  if (!pos) return "Ln 1, Col 1";
  return `Ln ${pos.lineNumber}, Col ${pos.column}`;
}

function promptName(title: string, defaultValue = ""): string | null {
  const v = window.prompt(title, defaultValue);
  if (v === null) return null;
  const trimmed = v.trim();
  return trimmed || null;
}

export function DevelopmentCodeStudio({
  projectId,
  storedRaw,
  onStoredChange,
  onError,
  onSavingChange
}: DevelopmentCodeStudioProps) {
  const theme = useMonacoTheme();
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const paneRef = useRef<HTMLDivElement | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editorHeightPx, setEditorHeightPx] = useState(EDITOR_MIN_PX);

  const initial = useMemo(
    () => parseDevCodeStudioSnapshot(storedRaw) ?? defaultDevCodeStudioSnapshot(),
    [storedRaw]
  );

  const [snapshot, setSnapshot] = useState<DevCodeStudioSnapshot>(initial);
  const [cursor, setCursor] = useState("Ln 1, Col 1");
  const [wordWrap, setWordWrap] = useState(true);
  const [minimap, setMinimap] = useState(true);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [selectedDir, setSelectedDir] = useState("");

  useEffect(() => {
    setSnapshot(parseDevCodeStudioSnapshot(storedRaw) ?? defaultDevCodeStudioSnapshot());
  }, [projectId, storedRaw]);

  useLayoutEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const measure = () => setEditorHeightPx(Math.max(el.clientHeight, EDITOR_MIN_PX));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [explorerOpen, terminalOpen]);

  const activeFile = snapshot.files.find((f) => f.id === snapshot.openFileId) ?? snapshot.files[0];

  const persist = useCallback(
    (next: DevCodeStudioSnapshot) => {
      const raw = serializeDevCodeStudioSnapshot(next);
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
        const next = updater(prev);
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

  const onNewFile = useCallback(
    (dir: string) => {
      const name = promptName("Nome do arquivo (ex.: index.ts)", "untitled.ts");
      if (!name) return;
      updateSnapshot((prev) => createFileInSnapshot(prev, dir, name));
    },
    [updateSnapshot]
  );

  const onNewFolder = useCallback(
    (parentDir: string) => {
      const name = promptName("Nome da pasta", "nova-pasta");
      if (!name) return;
      updateSnapshot((prev) => createFolderInSnapshot(prev, parentDir, name));
    },
    [updateSnapshot]
  );

  const onRename = useCallback(
    (path: string, isFolder: boolean) => {
      const next = promptName(isFolder ? "Renomear pasta" : "Renomear arquivo", fileBaseName(path));
      if (!next) return;
      const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
      const newPath = isFolder ? (parent ? `${parent}/${next}` : next) : joinPath(parent, next);
      updateSnapshot((prev) => renamePathInSnapshot(prev, path, newPath));
    },
    [updateSnapshot]
  );

  const onDelete = useCallback(
    (path: string, isFolder: boolean) => {
      if (!window.confirm(isFolder ? `Excluir pasta "${path}" e todo o conteúdo?` : `Excluir "${path}"?`)) return;
      updateSnapshot((prev) => {
        if (isFolder) return deleteFolderFromSnapshot(prev, path);
        const file = prev.files.find((f) => f.path === path);
        return file ? deleteFileFromSnapshot(prev, file.id) : prev;
      });
    },
    [updateSnapshot]
  );

  const onDeleteSelection = useCallback(() => {
    if (selectedDir) {
      onDelete(selectedDir, true);
      setSelectedDir("");
      return;
    }
    const af = snapshot.files.find((f) => f.id === snapshot.openFileId);
    if (af) onDelete(af.path, false);
  }, [onDelete, selectedDir, snapshot.files, snapshot.openFileId]);

  const menus: CodeStudioMenu[] = useMemo(
    () => [
      {
        id: "file",
        label: "Arquivo",
        items: [
          { id: "new-file", label: "Novo arquivo", shortcut: "Ctrl+N", onClick: () => onNewFile(selectedDir) },
          { id: "new-folder", label: "Nova pasta", shortcut: "Ctrl+Shift+N", onClick: () => onNewFolder(selectedDir) },
          {
            id: "save",
            label: "Salvar",
            shortcut: "Ctrl+S",
            disabled: !projectId,
            onClick: () => persist(snapshot)
          },
          {
            id: "close",
            label: "Fechar editor",
            disabled: !activeFile,
            onClick: () => {
              if (!activeFile) return;
              updateSnapshot((prev) => deleteFileFromSnapshot(prev, activeFile.id));
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
          { id: "format", label: "Formatar documento", shortcut: "Shift+Alt+F", onClick: () => runEditorAction("editor.action.formatDocument") }
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
          { id: "terminal", label: "Terminal", shortcut: "Ctrl+`", onClick: () => setTerminalOpen((v) => !v) },
          { id: "minimap", label: "Minimap", onClick: () => setMinimap((v) => !v) },
          { id: "wordwrap", label: "Quebra de linha", onClick: () => setWordWrap((v) => !v) },
          { id: "palette", label: "Paleta de comandos", shortcut: "F1", onClick: () => runEditorAction("editor.action.quickCommand") }
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
          }
        ]
      }
    ],
    [activeFile, onNewFile, onNewFolder, persist, projectId, selectedDir, snapshot, updateSnapshot]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        persist(snapshot);
      }
      if (e.ctrlKey && e.shiftKey && e.key === "N") {
        e.preventDefault();
        onNewFolder(selectedDir);
      }
      if (e.ctrlKey && !e.shiftKey && e.key === "n") {
        e.preventDefault();
        onNewFile(selectedDir);
      }
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setTerminalOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNewFile, onNewFolder, persist, selectedDir, snapshot]);

  const onEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    setCursor(cursorLabel(editor));
    editor.onDidChangeCursorPosition(() => setCursor(cursorLabel(editor)));
    editor.focus();
  };

  const onChange = (value: string | undefined) => {
    if (value === undefined || !activeFile) return;
    updateSnapshot((prev) => ({
      ...prev,
      files: prev.files.map((f) => (f.id === activeFile.id ? { ...f, content: value } : f))
    }));
  };

  const setLanguage = (language: string) => {
    if (!activeFile) return;
    updateSnapshot((prev) => ({
      ...prev,
      files: prev.files.map((f) => (f.id === activeFile.id ? { ...f, language } : f))
    }));
  };

  return (
    <div className="dev-code-studio" data-theme={theme === "vs-dark" ? "dark" : "light"}>
      <CodeStudioMenuBar menus={menus} />

      <div className="dev-code-studio__toolbar">
        <div className="dev-code-studio__toolbar-group dev-code-studio__toolbar-group--grow">
          {snapshot.files.map((file) => (
            <button
              key={file.id}
              type="button"
              className={`dev-code-studio__tab${file.id === snapshot.openFileId ? " is-active" : ""}`}
              onClick={() => updateSnapshot((prev) => ({ ...prev, openFileId: file.id }))}
            >
              {fileBaseName(file.path)}
            </button>
          ))}
        </div>
        <div className="dev-code-studio__toolbar-group">
          <label className="dev-code-studio__lang">
            <Braces className="h-3.5 w-3.5 opacity-70" aria-hidden />
            <select value={activeFile?.language ?? "typescript"} onChange={(e) => setLanguage(e.target.value)} aria-label="Linguagem">
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
            snapshot={snapshot}
            selectedDir={selectedDir}
            onSelectDir={setSelectedDir}
            onOpenFile={(id) => updateSnapshot((prev) => ({ ...prev, openFileId: id }))}
            onNewFile={onNewFile}
            onNewFolder={onNewFolder}
            onRename={onRename}
            onDeleteSelection={onDeleteSelection}
          />
        ) : null}

        <div className="dev-code-studio__editor-column">
          <div ref={paneRef} className="dev-code-studio__editor-wrap">
            {activeFile ? (
              <Editor
                key={`${activeFile.id}-${theme}`}
                height={editorHeightPx}
                language={activeFile.language}
                value={activeFile.content}
                theme={theme}
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
            ) : (
              <div className="dev-code-studio__loading">Crie um arquivo em Arquivo → Novo arquivo.</div>
            )}
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
        <span>{activeFile?.path ?? "—"}</span>
        <span>UTF-8</span>
        <span>Spaces: 2</span>
        <span className="dev-code-studio__status-grow">{cursor}</span>
        <span>Monaco · estilo vscode.dev</span>
      </footer>
    </div>
  );
}
