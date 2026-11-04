import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BrandingFieldDef,
  BrandingFieldValue,
  BrandingMediaAsset,
  BrandingRepeaterValue
} from "@ederson-agencia/shared";
import { apiAssetUrl, apiUploadForm } from "../../api";
import { Trash2, Upload } from "lucide-react";

type Props = {
  field: BrandingFieldDef;
  value: BrandingFieldValue | undefined;
  disabled?: boolean;
  projectId: string | null;
  onChange: (value: BrandingFieldValue | null) => void;
};

function asString(value: BrandingFieldValue | undefined): string {
  return typeof value === "string" ? value : "";
}

function asMedia(value: BrandingFieldValue | undefined): BrandingMediaAsset | null {
  if (value && typeof value === "object" && !Array.isArray(value) && "url" in value && !("rows" in value)) {
    return value as BrandingMediaAsset;
  }
  return null;
}

function asMediaList(value: BrandingFieldValue | undefined): BrandingMediaAsset[] {
  return Array.isArray(value) ? value : [];
}

function asRepeater(value: BrandingFieldValue | undefined): BrandingRepeaterValue {
  if (value && typeof value === "object" && "rows" in value && Array.isArray(value.rows)) {
    return value as BrandingRepeaterValue;
  }
  return { rows: [] };
}

export function BrandingFieldEditor({ field, value, disabled, projectId, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedTextChange = useCallback(
    (next: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(next.trim() ? next : null);
      }, 450);
    },
    [onChange]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  async function uploadFile(file: File, mode: "single" | "multi") {
    if (!projectId) {
      setUploadError("Selecione um projeto para enviar arquivos.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("fieldId", field.id);
      const res = await apiUploadForm<{ asset: BrandingMediaAsset }>(
        `/agency/projects/${projectId}/branding-workspace/upload`,
        form
      );
      if (mode === "multi") {
        onChange([...asMediaList(value), res.asset]);
      } else {
        onChange(res.asset);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Falha no envio.");
    } finally {
      setUploading(false);
    }
  }

  const hint = field.acceptHint ? (
    <p className="text-xs text-[var(--app-text-muted)]">{field.acceptHint}</p>
  ) : null;

  if (field.type === "text" || field.type === "url") {
    const inputType = field.type === "url" ? "url" : "text";
    return (
      <div className="agency-branding-field">
        <input
          type={inputType}
          className="input w-full"
          defaultValue={asString(value)}
          placeholder={field.placeholder}
          disabled={disabled}
          onChange={(e) => debouncedTextChange(e.target.value)}
        />
        {hint}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="agency-branding-field">
        <textarea
          className="input min-h-[7rem] w-full resize-y"
          defaultValue={asString(value)}
          placeholder={field.placeholder}
          disabled={disabled}
          onChange={(e) => debouncedTextChange(e.target.value)}
        />
        {hint}
      </div>
    );
  }

  if (field.type === "audio" || field.type === "video" || field.type === "file") {
    const media = asMedia(value);
    return (
      <div className="agency-branding-field space-y-2">
        {media ? (
          <div className="agency-branding-media-card">
            <a href={apiAssetUrl(media.url)} target="_blank" rel="noreferrer" className="text-sm text-brand-primary hover:underline">
              {media.name}
            </a>
            {field.type === "audio" ? <audio controls className="w-full max-w-md" src={apiAssetUrl(media.url)} /> : null}
            {field.type === "video" ? (
              <video controls className="max-h-64 w-full max-w-lg rounded-lg" src={apiAssetUrl(media.url)} />
            ) : null}
            <button
              type="button"
              className="btn-ghost inline-flex items-center gap-1 text-xs text-red-600"
              disabled={disabled}
              onClick={() => onChange(null)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Remover
            </button>
          </div>
        ) : null}
        <label className="btn-secondary inline-flex cursor-pointer items-center gap-2 text-sm">
          <Upload className="h-4 w-4" />
          {uploading ? "Enviando…" : "Enviar arquivo"}
          <input
            type="file"
            className="sr-only"
            disabled={disabled || uploading || !projectId}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadFile(f, "single");
              e.target.value = "";
            }}
          />
        </label>
        {!projectId ? <p className="text-xs text-amber-600">Projeto obrigatório para upload.</p> : null}
        {uploadError ? <p className="text-xs text-red-500">{uploadError}</p> : null}
        {hint}
      </div>
    );
  }

  if (field.type === "files") {
    const list = asMediaList(value);
    return (
      <div className="agency-branding-field space-y-2">
        {list.length > 0 ? (
          <ul className="space-y-1.5">
            {list.map((item, index) => (
              <li key={`${item.url}-${index}`} className="agency-branding-media-card flex flex-wrap items-center justify-between gap-2">
                <a href={apiAssetUrl(item.url)} target="_blank" rel="noreferrer" className="text-sm text-brand-primary hover:underline">
                  {item.name}
                </a>
                <button
                  type="button"
                  className="btn-ghost text-xs text-red-600"
                  disabled={disabled}
                  onClick={() => {
                    const next = list.filter((_, i) => i !== index);
                    onChange(next.length ? next : null);
                  }}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <label className="btn-secondary inline-flex cursor-pointer items-center gap-2 text-sm">
          <Upload className="h-4 w-4" />
          {uploading ? "Enviando…" : "Adicionar arquivo"}
          <input
            type="file"
            className="sr-only"
            multiple
            disabled={disabled || uploading || !projectId}
            onChange={(e) => {
              const files = e.target.files;
              if (!files?.length) return;
              void (async () => {
                for (const f of Array.from(files)) {
                  await uploadFile(f, "multi");
                }
              })();
              e.target.value = "";
            }}
          />
        </label>
        {!projectId ? <p className="text-xs text-amber-600">Projeto obrigatório para upload.</p> : null}
        {uploadError ? <p className="text-xs text-red-500">{uploadError}</p> : null}
        {hint}
      </div>
    );
  }

  if (field.type === "repeater" && field.columns?.length) {
    const { rows } = asRepeater(value);
    const columns = field.columns;

    function updateRows(nextRows: Record<string, string>[]) {
      const cleaned = nextRows.filter((row) => Object.values(row).some((c) => String(c ?? "").trim()));
      onChange(cleaned.length ? { rows: cleaned } : null);
    }

    return (
      <div className="agency-branding-field space-y-3">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="agency-branding-repeater-row panel space-y-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--app-text-muted)]">Linha {rowIndex + 1}</span>
              <button
                type="button"
                className="btn-ghost text-xs text-red-600"
                disabled={disabled}
                onClick={() => updateRows(rows.filter((_, i) => i !== rowIndex))}
              >
                Excluir
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {columns.map((col) => (
                <label key={col.key} className="block space-y-1 text-sm sm:col-span-2">
                  <span className="text-xs font-medium text-[var(--app-text-muted)]">{col.label}</span>
                  {col.input === "textarea" ? (
                    <textarea
                      className="input min-h-[4rem] w-full resize-y"
                      value={row[col.key] ?? ""}
                      disabled={disabled}
                      onChange={(e) => {
                        const next = rows.map((r, i) =>
                          i === rowIndex ? { ...r, [col.key]: e.target.value } : r
                        );
                        updateRows(next);
                      }}
                    />
                  ) : (
                    <input
                      type={col.input === "url" ? "url" : "text"}
                      className="input w-full"
                      value={row[col.key] ?? ""}
                      disabled={disabled}
                      onChange={(e) => {
                        const next = rows.map((r, i) =>
                          i === rowIndex ? { ...r, [col.key]: e.target.value } : r
                        );
                        updateRows(next);
                      }}
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn-secondary text-sm"
          disabled={disabled}
          onClick={() => updateRows([...rows, Object.fromEntries(columns.map((c) => [c.key, ""]))])}
        >
          + Adicionar linha
        </button>
      </div>
    );
  }

  return null;
}
