import { parseBrandingNamingField, type BrandingFieldValue, type BrandingNamingStudioValue } from "@ederson-agencia/shared";
import { Plus, Star, Trash2 } from "lucide-react";
import { useMemo } from "react";

type Props = {
  value: BrandingFieldValue | undefined;
  disabled?: boolean;
  onChange: (value: BrandingNamingStudioValue) => void;
};

export function BrandNamingStudio({ value, disabled, onChange }: Props) {
  const studio = useMemo(() => parseBrandingNamingField(value), [value]);

  function update(patch: Partial<BrandingNamingStudioValue>) {
    onChange({ ...studio, ...patch, kind: "naming-studio" });
  }

  function updateOption(index: number, field: keyof (typeof studio.options)[0], val: string | number) {
    const options = studio.options.map((o, i) => (i === index ? { ...o, [field]: val } : o));
    update({ options });
  }

  function addOption() {
    update({ options: [...studio.options, { nome: "" }] });
  }

  function removeOption(index: number) {
    update({ options: studio.options.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4">
      <label className="block space-y-1 text-xs">
        <span className="text-[var(--app-text-muted)]">Critérios do naming</span>
        <textarea
          className="input min-h-[4rem] w-full text-sm"
          disabled={disabled}
          placeholder="Memorabilidade, fonética, disponibilidade de domínio, registro…"
          value={studio.criteria ?? ""}
          onChange={(e) => update({ criteria: e.target.value })}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-[var(--app-text)]">Shortlist</h4>
        <button type="button" className="btn-secondary text-sm" disabled={disabled} onClick={addOption}>
          <Plus className="mr-1 inline h-4 w-4" aria-hidden />
          Opção
        </button>
      </div>

      <ul className="space-y-3">
        {studio.options.length === 0 ? (
          <p className="text-sm text-[var(--app-text-muted)]">Adicione nomes candidatos para comparar e aprovar.</p>
        ) : null}
        {studio.options.map((o, i) => (
          <li
            key={`${i}-${o.nome}`}
            className={`space-y-2 rounded-lg border p-3 ${
              studio.chosen === o.nome
                ? "border-violet-500 bg-violet-500/5"
                : "border-[var(--app-border)]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="input min-w-[10rem] flex-1 text-sm font-medium"
                disabled={disabled}
                placeholder="Nome"
                value={o.nome}
                onChange={(e) => updateOption(i, "nome", e.target.value)}
              />
              <button
                type="button"
                className="btn-secondary text-xs"
                disabled={disabled || !o.nome.trim()}
                title="Marcar como nome aprovado"
                onClick={() => update({ chosen: o.nome.trim() })}
              >
                <Star className={`mr-1 inline h-3.5 w-3.5 ${studio.chosen === o.nome ? "fill-current" : ""}`} />
                Aprovar
              </button>
              <button type="button" className="btn-secondary px-2 text-xs" disabled={disabled} onClick={() => removeOption(i)}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="input text-sm"
                disabled={disabled}
                placeholder="Fonética / memorabilidade"
                value={o.fonetica ?? ""}
                onChange={(e) => updateOption(i, "fonetica", e.target.value)}
              />
              <input
                className="input text-sm"
                disabled={disabled}
                placeholder="Domínio"
                value={o.dominio ?? ""}
                onChange={(e) => updateOption(i, "dominio", e.target.value)}
              />
              <input
                className="input text-sm sm:col-span-2"
                disabled={disabled}
                placeholder="INPI / jurídico"
                value={o.inpi ?? ""}
                onChange={(e) => updateOption(i, "inpi", e.target.value)}
              />
            </div>
          </li>
        ))}
      </ul>

      {studio.chosen ? (
        <p className="text-sm text-violet-700 dark:text-violet-300">
          Nome aprovado: <strong>{studio.chosen}</strong>
        </p>
      ) : null}
    </div>
  );
}
