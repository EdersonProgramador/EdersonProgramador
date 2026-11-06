import * as monaco from "monaco-editor";

/** Dracula Theme Official — cores alinhadas ao pacote VS Code (sintaxe Monaco). */
let defined = false;

export function defineDraculaTheme(): void {
  if (defined || typeof window === "undefined") return;
  defined = true;

  monaco.editor.defineTheme("dracula", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: "f8f8f2" },
      { token: "invalid", foreground: "ff5555" },
      { token: "emphasis", fontStyle: "italic" },
      { token: "strong", fontStyle: "bold" },
      { token: "comment", foreground: "6272a4" },
      { token: "constant.language", foreground: "bd93f9" },
      { token: "constant.numeric", foreground: "bd93f9" },
      { token: "constant.regexp", foreground: "f1fa8c" },
      { token: "constant", foreground: "bd93f9" },
      { token: "keyword", foreground: "ff79c6" },
      { token: "keyword.operator", foreground: "ff79c6" },
      { token: "keyword.other", foreground: "8be9fd" },
      { token: "string", foreground: "f1fa8c" },
      { token: "string.escape", foreground: "ff79c6" },
      { token: "meta.template.expression", foreground: "ff79c6" },
      { token: "storage.type", foreground: "8be9fd", fontStyle: "italic" },
      { token: "storage.modifier", foreground: "ff79c6" },
      { token: "entity.name.function", foreground: "50fa7b" },
      { token: "entity.name.tag", foreground: "ff79c6" },
      { token: "entity.name.type", foreground: "ffb86c", fontStyle: "italic" },
      { token: "entity.other.attribute-name", foreground: "50fa7b" },
      { token: "support.class", foreground: "8be9fd", fontStyle: "italic" },
      { token: "support.function", foreground: "8be9fd" },
      { token: "support.type", foreground: "8be9fd" },
      { token: "variable", foreground: "f8f8f2" },
      { token: "variable.language", foreground: "8be9fd", fontStyle: "italic" },
      { token: "variable.parameter", foreground: "ffb86c", fontStyle: "italic" },
      { token: "namespace", foreground: "ffb86c", fontStyle: "italic" },
      { token: "type", foreground: "8be9fd", fontStyle: "italic" },
      { token: "tag", foreground: "ff79c6" },
      { token: "delimiter.html", foreground: "f8f8f2" },
      { token: "metatag", foreground: "ff79c6" },
      { token: "metatag.content.html", foreground: "f1fa8c" },
      { token: "attribute.name", foreground: "50fa7b" },
      { token: "attribute.value", foreground: "f1fa8c" }
    ],
    colors: {
      "editor.background": "#282a36",
      "editor.foreground": "#f8f8f2",
      "editor.lineHighlightBackground": "#44475a75",
      "editorLineNumber.foreground": "#6272a4",
      "editorLineNumber.activeForeground": "#f8f8f2",
      "editor.selectionBackground": "#44475a",
      "editor.inactiveSelectionBackground": "#44475a80",
      "editorCursor.foreground": "#f8f8f2",
      "editorWhitespace.foreground": "#ffffff22",
      "editorIndentGuide.background": "#ffffff1a",
      "editorIndentGuide.activeBackground": "#ffffff33",
      "editorBracketHighlight.foreground1": "#ff79c6",
      "editorBracketHighlight.foreground2": "#bd93f9",
      "editorBracketHighlight.foreground3": "#50fa7b",
      "editorBracketPairGuide.activeBackground1": "#ff79c6",
      "editorBracketPairGuide.activeBackground2": "#bd93f9",
      "editorBracketPairGuide.activeBackground3": "#50fa7b",
      "editorGutter.background": "#282a36",
      "minimap.background": "#282a36",
      "scrollbarSlider.background": "#44475a99",
      "scrollbarSlider.hoverBackground": "#6272a4aa",
      "scrollbarSlider.activeBackground": "#6272a4cc"
    }
  });
}
