import { fileBaseName, joinPath, type DevCodeStudioFile } from "@ederson-agencia/shared";

function normPath(p: string): string {
  return p.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\.\//, "");
}

function parentDir(filePath: string): string {
  const n = normPath(filePath);
  const i = n.lastIndexOf("/");
  return i === -1 ? "" : n.slice(0, i);
}

function resolveHref(baseDir: string, href: string): string {
  const h = href.trim();
  if (!h || /^(https?:|data:|blob:|mailto:)/i.test(h)) return "";
  if (h.startsWith("/")) return normPath(h.slice(1));
  return normPath(joinPath(baseDir, h));
}

function findFileByPath(files: DevCodeStudioFile[], path: string): DevCodeStudioFile | undefined {
  const n = normPath(path);
  return files.find((f) => normPath(f.path) === n);
}

/**
 * Monta um documento completo para o iframe: integra `<link href="...css">` e `<script src="...js">`
 * com arquivos do workspace (caminhos relativos ao HTML).
 */
export function buildHtmlPreviewSrcDoc(htmlContent: string, htmlPath: string, workspaceFiles: DevCodeStudioFile[]): string {
  const base = parentDir(htmlPath);
  let doc = htmlContent.trim();

  if (!/<!doctype/i.test(doc)) {
    if (!/<html[\s>]/i.test(doc)) {
      doc = `<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n<title>${fileBaseName(htmlPath)}</title>\n</head>\n<body>\n${doc}\n</body>\n</html>`;
    } else if (!/<head[\s>]/i.test(doc)) {
      doc = doc.replace(/<html([^>]*)>/i, `<html$1>\n<head><meta charset="utf-8" /></head>`);
    }
  }

  doc = doc.replace(/<link([^>]*?)\s+href\s*=\s*["']([^"']+)["']([^>]*?)>/gi, (full, before, href, after) => {
    const attrs = `${before}${after}`;
    if (!/\brel\s*=\s*["']stylesheet["']/i.test(attrs)) return full;
    const resolved = resolveHref(base, href);
    if (!resolved) return full;
    const f = findFileByPath(workspaceFiles, resolved);
    if (!f || f.language !== "css") return full;
    return `\n<style type="text/css" data-inlined-from="${href.replace(/"/g, "&quot;")}">\n${f.content}\n</style>\n`;
  });

  doc = doc.replace(/<script([^>]*?)\s+src\s*=\s*["']([^"']+)["']([^>]*?)>\s*<\/script>/gi, (full, before, src, after) => {
    const resolved = resolveHref(base, src);
    if (!resolved) return full;
    const f = findFileByPath(workspaceFiles, resolved);
    if (!f || (f.language !== "javascript" && f.language !== "typescript")) return full;
    const isModule = /\btype\s*=\s*["']module["']/i.test(`${before}${after}`);
    return `\n<script${before}${after}${isModule ? ' type="module"' : ""} data-inlined-from="${src.replace(/"/g, "&quot;")}">\n${f.content}\n</script>\n`;
  });

  return doc;
}
