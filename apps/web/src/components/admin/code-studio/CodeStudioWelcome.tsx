import { FilePlus2, FolderPlus, Keyboard, Sparkles } from "lucide-react";

type CodeStudioWelcomeProps = {
  onNewFile: () => void;
  onNewFolder: () => void;
};

export function CodeStudioWelcome({ onNewFile, onNewFolder }: CodeStudioWelcomeProps) {
  return (
    <div className="dev-code-studio__welcome">
      <div className="dev-code-studio__welcome-inner">
        <div className="dev-code-studio__welcome-brand">
          <Sparkles className="h-10 w-10 text-sky-400" aria-hidden />
          <div>
            <h2 className="dev-code-studio__welcome-title">Bem-vindo</h2>
            <p className="dev-code-studio__welcome-sub">Ederson Studio · escreva snippets e código do lançamento sem arquivos de exemplo.</p>
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
          </ul>
        </section>

        <section className="dev-code-studio__welcome-section">
          <h3>
            <Keyboard className="mr-1 inline h-3.5 w-3.5 opacity-70" aria-hidden />
            Atalhos úteis
          </h3>
          <ul className="dev-code-studio__welcome-shortcuts">
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
