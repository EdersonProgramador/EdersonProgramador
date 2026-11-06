import { FilePlus2, FileStack, FolderPlus, FolderSymlink, Keyboard, Sparkles, Upload } from "lucide-react";

type CodeStudioWelcomeProps = {
  onNewFile: () => void;
  onNewFolder: () => void;
  onImportFile: () => void;
  onImportFiles: () => void;
  onImportFolder: () => void;
};

export function CodeStudioWelcome({
  onNewFile,
  onNewFolder,
  onImportFile,
  onImportFiles,
  onImportFolder
}: CodeStudioWelcomeProps) {
  return (
    <div className="dev-code-studio__welcome">
      <div className="dev-code-studio__welcome-inner">
        <div className="dev-code-studio__welcome-brand">
          <Sparkles className="h-10 w-10 text-sky-400" aria-hidden />
          <div>
            <h2 className="dev-code-studio__welcome-title">Bem-vindo</h2>
            <p className="dev-code-studio__welcome-sub">
              Ederson Studio · importe arquivo(s) ou uma pasta para montar o projeto; com projeto selecionado, o workspace é salvo na operação (Ctrl+S).
            </p>
          </div>
        </div>

        <section className="dev-code-studio__welcome-section">
          <h3>Iniciar</h3>
          <ul className="dev-code-studio__welcome-actions">
            <li>
              <button type="button" onClick={onNewFile}>
                <FilePlus2 className="h-4 w-4" aria-hidden />
                <span>Novo arquivo…</span>
                <kbd>Ctrl+N</kbd>
              </button>
            </li>
            <li>
              <button type="button" onClick={onNewFolder}>
                <FolderPlus className="h-4 w-4" aria-hidden />
                <span>Nova pasta…</span>
                <kbd>Ctrl+Shift+N</kbd>
              </button>
            </li>
            <li>
              <button type="button" onClick={onImportFile}>
                <Upload className="h-4 w-4" aria-hidden />
                <span>Abrir arquivo do computador…</span>
                <kbd>Ctrl+O</kbd>
              </button>
            </li>
            <li>
              <button type="button" onClick={onImportFiles}>
                <FileStack className="h-4 w-4" aria-hidden />
                <span>Importar vários arquivos…</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={onImportFolder}>
                <FolderSymlink className="h-4 w-4" aria-hidden />
                <span>Importar pasta do projeto…</span>
              </button>
            </li>
          </ul>
        </section>

        <section className="dev-code-studio__welcome-section">
          <h3>
            <Keyboard className="mr-1 inline h-3.5 w-3.5 opacity-70" aria-hidden />
            Atalhos úteis
          </h3>
          <ul className="dev-code-studio__welcome-shortcuts">
            <li>
              <span>Abrir arquivo local</span> <kbd>Ctrl+O</kbd>
            </li>
            <li>
              <span>Fechar aba</span> <kbd>Ctrl+W</kbd>
            </li>
            <li>
              <span>Salvar no projeto</span> <kbd>Ctrl+S</kbd>
            </li>
            <li>
              <span>Formatar documento</span> <kbd>Shift+Alt+F</kbd>
            </li>
            <li>
              <span>Paleta de comandos</span> <kbd>F1</kbd>
            </li>
            <li>
              <span>Terminal (placeholder)</span> <kbd>Ctrl+`</kbd>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
