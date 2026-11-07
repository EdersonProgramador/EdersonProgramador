import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const EXPORT_STYLES = `
  body { font-family: Georgia, "Times New Roman", serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; line-height: 1.65; color: #111; }
  h1 { font-size: 1.75rem; margin-top: 1.5rem; }
  h2 { font-size: 1.25rem; margin-top: 1.25rem; }
  h3 { font-size: 1.1rem; margin-top: 1rem; }
  p { margin: 0.5rem 0; }
  ul, ol { padding-left: 1.5rem; }
  blockquote { border-left: 3px solid #ccc; margin: 1rem 0; padding-left: 1rem; color: #444; }
  mark { background: #fef08a; }
  a { color: #1d4ed8; }
  img { max-width: 100%; height: auto; }
`;

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function safeFilename(filename: string) {
  return filename.replace(/[^\w\-áàâãéêíóôõúç .]/gi, "").trim() || "fichamento";
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadHtmlDocument(filename: string, bodyHtml: string, title: string) {
  const safeName = safeFilename(filename);
  const doc = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${EXPORT_STYLES}</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
${bodyHtml}
</body>
</html>`;
  triggerDownload(new Blob([doc], { type: "text/html;charset=utf-8" }), `${safeName}.html`);
}

export function downloadWordDocument(filename: string, bodyHtml: string, title: string) {
  const safeName = safeFilename(filename);
  const wordHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>${EXPORT_STYLES}</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
${bodyHtml}
</body>
</html>`;
  triggerDownload(new Blob(["\ufeff", wordHtml], { type: "application/msword" }), `${safeName}.doc`);
}

export async function downloadPdfDocument(filename: string, bodyHtml: string, title: string) {
  const safeName = safeFilename(filename);
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;width:720px;padding:24px;background:#fff;color:#111;font-family:Georgia,serif;line-height:1.65;";
  host.innerHTML = `<h1 style="font-size:1.5rem;margin:0 0 1rem;">${escapeHtml(title)}</h1>${bodyHtml}`;
  document.body.appendChild(host);

  try {
    const canvas = await html2canvas(host, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    const printableHeight = pageHeight - margin * 2;

    let heightLeft = imgHeight;
    let offsetY = margin;

    pdf.addImage(imgData, "PNG", margin, offsetY, contentWidth, imgHeight);
    heightLeft -= printableHeight;

    while (heightLeft > 0) {
      offsetY = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, offsetY, contentWidth, imgHeight);
      heightLeft -= printableHeight;
    }

    pdf.save(`${safeName}.pdf`);
  } finally {
    host.remove();
  }
}
