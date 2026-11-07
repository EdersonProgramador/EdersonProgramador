import {
  parseBrandingPaletteField,
  type BrandingPaletteRole,
  type BrandingPaletteValue,
  type BrandingFieldValue
} from "@ederson-agencia/shared";
import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

type Props = {
  value: BrandingFieldValue | undefined;
  disabled?: boolean;
  onChange: (value: BrandingPaletteValue) => void;
};

const ROLES: { id: BrandingPaletteRole; label: string }[] = [
  { id: "primary", label: "Primária" },
  { id: "secondary", label: "Secundária" },
  { id: "accent", label: "Destaque" },
  { id: "neutral", label: "Neutra" },
  { id: "support", label: "Apoio" }
];

export function BrandPaletteStudio({ value, disabled, onChange }: Props) {
  const palette = useMemo(() => parseBrandingPaletteField(value), [value]);

  function update(patch: Partial<BrandingPaletteValue>) {
    onChange({ ...palette, ...patch, kind: "palette" });
  }

  function updateSwatch(index: number, patch: Partial<(typeof palette.swatches)[0]>) {
    const swatches = palette.swatches.map((s, i) => (i === index ? { ...s, ...patch } : s));
    update({ swatches });
  }

  function addSwatch() {
    update({
      swatches: [
        ...palette.swatches,
        {
          id: `c-${Date.now()}`,
          name: "Nova cor",
          hex: "#64748B",
          role: "support"
        }
      ]
    });
  }

  function removeSwatch(index: number) {
    update({ swatches: palette.swatches.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4">
      <div className="flex flex-wrap gap-2">
        {palette.swatches.map((s, i) => (
          <div
            key={s.id}
            className="flex min-w-[7rem] flex-col overflow-hidden rounded-lg border border-[var(--app-border)]"
            title={s.hex}
          >
            <div className="h-14 w-full" style={{ backgroundColor: s.hex }} />
            <div className="px-2 py-1.5 text-[10px] font-mono text-[var(--app-text-muted)]">{s.hex.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <ul className="space-y-3">
        {palette.swatches.map((s, i) => (
          <li key={s.id} className="flex flex-wrap items-end gap-2 gap-y-3">
            <label className="flex min-w-[8rem] flex-1 flex-col gap-1 text-xs">
              <span className="text-[var(--app-text-muted)]">Nome</span>
              <input
                className="input text-sm"
                disabled={disabled}
                value={s.name}
                onChange={(e) => updateSwatch(i, { name: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[var(--app-text-muted)]">Cor</span>
              <input
                type="color"
                className="h-10 w-14 cursor-pointer rounded border border-[var(--app-border)] bg-transparent p-1"
                disabled={disabled}
                value={/^#[0-9A-Fa-f]{6}$/.test(s.hex) ? s.hex : "#000000"}
                onChange={(e) => updateSwatch(i, { hex: e.target.value.toUpperCase() })}
              />
            </label>
            <label className="flex min-w-[6rem] flex-col gap-1 text-xs">
              <span className="text-[var(--app-text-muted)]">HEX</span>
              <input
                className="input w-28 font-mono text-sm"
                disabled={disabled}
                value={s.hex}
                onChange={(e) => updateSwatch(i, { hex: e.target.value })}
              />
            </label>
            <label className="flex min-w-[7rem] flex-col gap-1 text-xs">
              <span className="text-[var(--app-text-muted)]">Papel</span>
              <select
                className="input text-sm"
                disabled={disabled}
                value={s.role}
                onChange={(e) => updateSwatch(i, { role: e.target.value as BrandingPaletteRole })}
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="btn-secondary flex h-10 items-center gap-1 px-2 text-xs"
              disabled={disabled || palette.swatches.length <= 1}
              onClick={() => removeSwatch(i)}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="btn-secondary text-sm" disabled={disabled} onClick={addSwatch}>
        <Plus className="mr-1 inline h-4 w-4" aria-hidden />
        Adicionar cor
      </button>

      <label className="block space-y-1 text-xs">
        <span className="text-[var(--app-text-muted)]">Notas (Pantone, CMYK, uso)</span>
        <textarea
          className="input min-h-[4rem] w-full text-sm"
          disabled={disabled}
          value={palette.notes ?? ""}
          onChange={(e) => update({ notes: e.target.value })}
        />
      </label>
    </div>
  );
}
