function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function looksLikeScripturePlainText(text: string): boolean {
  if (text.length < 280) return false;
  const markers = text.match(/\b([1-9]\d?)\s+(\d{1,3})\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/g);
  return (markers?.length ?? 0) >= 4;
}

function findScriptureMarkers(text: string) {
  const markers: { index: number; psalm: string; verse: string; len: number }[] = [];
  const re = /\b(\d{1,3})\s+(\d{1,3})\s+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const psalm = m[1];
    const verse = m[2];
    if (Number(psalm) > 150 || Number(verse) > 200) continue;
    const before = text.slice(Math.max(0, m.index - 8), m.index);
    if (/Day\s*$|capítulos\s*$/i.test(before)) continue;
    markers.push({ index: m.index, psalm, verse, len: m[0].length });
  }
  return markers;
}

function formatScripturePlainText(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  const markers = findScriptureMarkers(normalized);
  if (markers.length < 2) {
    return `<p>${escapeHtml(text)}</p>`;
  }

  let html = '<div class="scripture-block">';
  let lastPsalm = "";

  for (let i = 0; i < markers.length; i++) {
    const cur = markers[i];
    const end = i + 1 < markers.length ? markers[i + 1].index : normalized.length;
    const body = normalized.slice(cur.index + cur.len, end).trim();
    if (!body) continue;

    if (cur.psalm !== lastPsalm) {
      if (lastPsalm) html += '<div class="scripture-chapter-gap" aria-hidden="true"></div>';
      html += `<h4 class="scripture-heading">Salmo ${escapeHtml(cur.psalm)}</h4>`;
      lastPsalm = cur.psalm;
    }

    html += `<p class="scripture-verse"><span class="scripture-ref">${escapeHtml(cur.psalm)}:${escapeHtml(cur.verse)}</span><span class="scripture-text">${escapeHtml(body)}</span></p>`;
  }

  html += "</div>";
  return html;
}

function transformParagraphText(text: string): string {
  if (!looksLikeScripturePlainText(text)) {
    return `<p>${escapeHtml(text)}</p>`;
  }
  return formatScripturePlainText(text);
}

/** Reformat blocos de texto bíblico colado (sem quebras) em versículos legíveis. */
export function enhanceLessonProseHtml(html: string): string {
  if (!html.trim()) return html;
  if (typeof DOMParser === "undefined") return html;

  const doc = new DOMParser().parseFromString(`<div id="prose-root">${html}</div>`, "text/html");
  const root = doc.getElementById("prose-root");
  if (!root) return html;

  const children = [...root.childNodes];
  for (const node of children) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() ?? "";
      if (!text) continue;
      const wrapper = doc.createElement("div");
      wrapper.innerHTML = transformParagraphText(text);
      node.replaceWith(...wrapper.childNodes);
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as HTMLElement;
    if (el.classList.contains("scripture-block") || el.classList.contains("tanar-lesson-lead")) continue;
    if (el.tagName === "UL" || el.tagName === "OL" || el.tagName === "H3" || el.tagName === "H4") continue;

    if (el.tagName === "P") {
      const text = el.textContent?.trim() ?? "";
      if (!looksLikeScripturePlainText(text)) continue;

      const normalized = text.replace(/\s+/g, " ");
      const markers = findScriptureMarkers(normalized);
      const first = markers[0];
      const formatted = doc.createElement("div");

      if (first && first.index > 24) {
        const intro = normalized.slice(0, first.index).trim();
        const scripture = normalized.slice(first.index);
        if (intro) {
          const introP = doc.createElement("p");
          introP.textContent = intro;
          formatted.appendChild(introP);
        }
        formatted.innerHTML += formatScripturePlainText(scripture);
      } else {
        formatted.innerHTML = formatScripturePlainText(text);
      }

      el.replaceWith(...formatted.childNodes);
    }
  }

  return root.innerHTML;
}
