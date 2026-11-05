import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEV_CODE_STUDIO_FIELD_ID,
  defaultDevCodeStudioSnapshot,
  parseDevCodeStudioSnapshot,
  serializeDevCodeStudioSnapshot,
  type DevCodeStudioFile,
  type DevCodeStudioSnapshot
} from "@ederson-agencia/shared";
import { patchProjectWorkspace } from "../../api/project-workspace-api";
import {
  AlignLeft,
  Braces,
  Copy,
  FileCode2,
  FolderTree,
  Maximize2,
  Minimize2,
  Sparkles,
  WrapText
} from "lucide-react";
import "../../styles/dev-code-studio.css";

type DevelopmentCodeStudioProps = {
  projectId: string;
  storedRaw: string | undefined;
  onStoredChange: (raw: string) => void;
  onError: (message: string) => void;
  onSavingChange?: (saving: boolean) => void;
};

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

export function DevelopmentCodeStudio({
  projectId,
  storedRaw,
  onStoredChange,
  onError,
  onSavingChange
}: DevelopmentCodeStudioProps) {
  const theme = useMonacoTheme();
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initial = useMemo(
    () => parseDevCodeStudioSnapshot(storedRaw) ?? defaultDevCodeStudioSnapshot(),
    [storedRaw]
  );

  const [snapshot, setSnapshot] = useState<DevCodeStudioSnapshot>(initial);
  const [cursor, setCursor] = useState("Ln 1, Col 1");
  const [wordWrap, setWordWrap] = useState(true);
  const [minimap, setMinimap] = useState(true);
  const [explorerOpen, setExplorerOpen] = useState(true);

  useEffect(() => {
    setSnapshot(parseDevCodeStudioSnapshot(storedRaw) ?? defaultDevCodeStudioSnapshot());
  }, [projectId, storedRaw]);

  const activeFile = snapshot.files.find((f) => f.id === snapshot.openFileId) ?? snapshot.files[0];

  const persist = useCallback(
    (next: DevCodeStudioSnapshot) => {
      const raw = serializeDevCodeStudioSnapshot(next);
      onStoredChange(raw);
      if (saveTimer.current) clearTimeout(saveTimer.current);
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

  const addFile = () => {
    const id = `file-${Date.now()}`;
    const file: DevCodeStudioFile = {
      id,
      name: "untitled.ts",
      language: "typescript",
      content: "// Novo arquivo\n"
    };
    updateSnapshot((prev) => ({
      ...prev,
      openFileId: id,
      files: [...prev.files, file]
    }));
  };

  const copyBuffer = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.content);
    } catch {
      onError("Não foi possível copiar para a área de transferência.");
    }
  };

  const formatDocument = () => {
    void editorRef.current?.getAction("editor.action.formatDocument")?.run();
  };

  return (
    <div className="dev-code-studio" data-theme={theme === "vs-dark" ? "dark" : "light"}>
      <div className="dev-code-studio__toolbar">
        <div className="dev-code-studio__toolbar-group">
          <button
            type="button"
            className={`dev-code-studio__icon-btn${explorerOpen ? " is-active" : ""}`}
            title="Explorador"
            onClick={() => setExplorerOpen((v) => !v)}
          >
            <FolderTree className="h-4 w-4" aria-hidden />
          </button>
          <span className="dev-code-studio__toolbar-title">
            <FileCode2 className="h-4 w-4 shrink-0 text-sky-500" aria-hidden />
            Studio
          </span>
        </div>
        <div className="dev-code-studio__toolbar-group dev-code-studio__toolbar-group--grow">
          {snapshot.files.map((file) => (
            <button
              key={file.id}
              type="button"
              className={`dev-code-studio__tab${file.id === snapshot.openFileId ? " is-active" : ""}`}
              onClick={() => updateSnapshot((prev) => ({ ...prev, openFileId: file.id }))}
            >
              {file.name}
            </button>
          ))}
          <button type="button" className="dev-code-studio__tab dev-code-studio__tab--add" onClick={addFile} title="Novo arquivo">
            +
          </button>
        </div>
        <div className="dev-code-studio__toolbar-group">
          <label className="dev-code-studio__lang">
            <Braces className="h-3.5 w-3.5 opacity-70" aria-hidden />
            <select
              value={activeFile?.language ?? "typescript"}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Linguagem"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="dev-code-studio__icon-btn" title="Formatar documento" onClick={formatDocument}>
            <Sparkles className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" className="dev-code-studio__icon-btn" title="Copiar" onClick={() => void copyBuffer()}>
            <Copy className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className={`dev-code-studio__icon-btn${wordWrap ? " is-active" : ""}`}
            title="Quebra de linha"
            onClick={() => setWordWrap((v) => !v)}
          >
            <WrapText className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className={`dev-code-studio__icon-btn${minimap ? " is-active" : ""}`}
            title="Minimap"
            onClick={() => setMinimap((v) => !v)}
          >
            {minimap ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>

      <div className="dev-code-studio__body">
        {explorerOpen ? (
          <aside className="dev-code-studio__explorer" aria-label="Arquivos do projeto">
            <p className="dev-code-studio__explorer-label">EXPLORER</p>
            <ul>
              {snapshot.files.map((file) => (
                <li key={file.id}>
                  <button
                    type="button"
                    className={file.id === snapshot.openFileId ? "is-active" : ""}
                    onClick={() => updateSnapshot((prev) => ({ ...prev, openFileId: file.id }))}
                  >
                    <AlignLeft className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                    <span className="truncate">{file.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}

        <div className="dev-code-studio__editor-wrap">
          <Editor
            key={`${activeFile?.id}-${theme}`}
            height="100%"
            language={activeFile?.language ?? "typescript"}
            value={activeFile?.content ?? ""}
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
        </div>
      </div>

      <footer className="dev-code-studio__status">
        <span>{activeFile?.language ?? "—"}</span>
        <span>UTF-8</span>
        <span>Spaces: 2</span>
        <span className="dev-code-studio__status-grow">{cursor}</span>
        <span>Monaco · motor VS Code</span>
      </footer>
    </div>
  );
}
