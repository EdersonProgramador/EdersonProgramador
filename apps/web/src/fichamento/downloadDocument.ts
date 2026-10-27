export function downloadHtmlDocument(filename: string, bodyHtml: string, title: string) {
  const safeName = filename.replace(/[^\w\-áàâãéêíóôõúç .]/gi, "").trim() || "fichamento";
  const doc = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: Georgia, "Times New Roman", serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; line-height: 1.65; color: #111; }
  h1 { font-size: 1.75rem; margin-top: 2rem; }
  h2 { font-size: 1.25rem; margin-top: 1.5rem; }
  hr { border: none; border-top: 1px solid #ccc; margin: 2rem 0; }
  .fichamento-meta { color: #555; font-size: 0.9rem; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
  const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
