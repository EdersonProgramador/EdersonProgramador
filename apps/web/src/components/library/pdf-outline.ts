import type { PDFDocumentProxy } from "pdfjs-dist";

export type PdfTocItem = {
  key: string;
  title: string;
  page: number | null;
  depth: number;
};

type OutlineNode = NonNullable<Awaited<ReturnType<PDFDocumentProxy["getOutline"]>>>[number];

async function resolveOutlinePage(
  pdf: PDFDocumentProxy,
  dest: OutlineNode["dest"] | undefined
): Promise<number | null> {
  if (!dest) return null;
  try {
    let explicitDest: unknown = dest;
    if (typeof dest === "string") {
      explicitDest = await pdf.getDestination(dest);
      if (!explicitDest) return null;
    }
    const destRef = (explicitDest as unknown[])[0];
    const pageIndex = await pdf.getPageIndex(destRef as Parameters<PDFDocumentProxy["getPageIndex"]>[0]);
    return pageIndex + 1;
  } catch {
    return null;
  }
}

async function walkOutline(
  pdf: PDFDocumentProxy,
  nodes: OutlineNode[] | null | undefined,
  depth: number,
  keyPrefix: string,
  out: PdfTocItem[]
): Promise<void> {
  if (!nodes?.length) return;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const key = `${keyPrefix}${i}`;
    const page = await resolveOutlinePage(pdf, node.dest);
    out.push({ key, title: node.title?.trim() || "—", page, depth });
    if (node.items?.length) {
      await walkOutline(pdf, node.items, depth + 1, `${key}-`, out);
    }
  }
}

export async function buildPdfToc(pdf: PDFDocumentProxy): Promise<PdfTocItem[]> {
  const outline = await pdf.getOutline();
  if (!outline?.length) return [];
  const items: PdfTocItem[] = [];
  await walkOutline(pdf, outline, 0, "", items);
  return items;
}

export function activePdfTocKey(items: PdfTocItem[], currentPage: number): string | null {
  let active: string | null = null;
  for (const item of items) {
    if (item.page !== null && item.page <= currentPage) active = item.key;
  }
  return active;
}
