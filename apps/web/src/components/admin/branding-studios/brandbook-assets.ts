import { apiAssetUrl } from "../../../api";

/** Converte paths de upload em data URLs para embutir no PDF (react-pdf). */
export async function resolveBrandbookImageDataUrls(paths: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const path of paths.slice(0, 12)) {
    const url = apiAssetUrl(path);
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) continue;
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      if (dataUrl.startsWith("data:")) out.push(dataUrl);
    } catch {
      /* skip */
    }
  }
  return out;
}
