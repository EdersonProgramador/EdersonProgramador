type CodeStudioHtmlPreviewProps = {
  srcDoc: string;
  title?: string;
};

/** Navegador interno — `srcDoc` com sandbox para HTML/CSS/JS do workspace. */
export function CodeStudioHtmlPreview({ srcDoc, title = "Preview HTML" }: CodeStudioHtmlPreviewProps) {
  return (
    <div className="dev-code-studio__html-preview" aria-label={title}>
      <div className="dev-code-studio__html-preview-head">
        <span className="dev-code-studio__html-preview-label">PREVIEW</span>
        <span className="dev-code-studio__html-preview-hint">Executa HTML, CSS e JS embutidos (sandbox sem rede externa)</span>
      </div>
      <iframe
        className="dev-code-studio__html-preview-frame"
        title={title}
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
