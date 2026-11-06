import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
/** Registra todas as linguagens built-in (Python, Go, Rust, C#, PHP, etc.). */
/** Use o subpath export do pacote (não `esm/vs/...` — quebra o build com exports do monaco-editor ≥0.57). */
import "monaco-editor/basic-languages/monaco.contribution.js";
import { defineDraculaTheme } from "./draculaTheme";

let configured = false;

/** Usa o pacote local em vez do CDN padrão (evita editor preso em “Carregando…”). */
export function setupMonaco(): void {
  if (configured || typeof window === "undefined") return;
  configured = true;
  loader.config({ monaco });
  defineDraculaTheme();
}
