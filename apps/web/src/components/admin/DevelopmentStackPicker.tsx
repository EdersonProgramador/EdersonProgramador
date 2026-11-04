import { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DEVELOPMENT_TECH_STACK_CATEGORIES,
  devTechOptionsByGroup,
  findDevTechOptionByStoredValue,
  type BrandingWorkspaceData,
  type DevTechStackCategory
} from "@ederson-agencia/shared";
import { patchProjectWorkspace } from "../../api/project-workspace-api";
import { DevTechBrandIcon } from "./DevTechBrandIcon";
import { ADMIN_BASE } from "./AdminOperationsLayout";

type DevelopmentStackPickerProps = {
  projectId: string;
  category: DevTechStackCategory;
  fields: BrandingWorkspaceData;
  onFieldsChange: (next: BrandingWorkspaceData) => void;
  onError: (message: string) => void;
  onSavingChange?: (saving: boolean) => void;
};

function readChoice(fields: BrandingWorkspaceData, fieldId: string): string {
  const v = fields[fieldId];
  return typeof v === "string" ? v : "";
}

function isPresetSelected(selected: string, category: DevTechStackCategory): boolean {
  return category.options.some((o) => o.label === selected || o.id === selected);
}

export function DevelopmentStackPicker({
  projectId,
  category,
  fields,
  onFieldsChange,
  onError,
  onSavingChange
}: DevelopmentStackPickerProps) {
  const selected = readChoice(fields, category.fieldId);
  const isOverview = category.id === "visao";
  const grouped = useMemo(() => devTechOptionsByGroup(category), [category]);

  const summaryRows = useMemo(() => {
    if (!isOverview) return [];
    return DEVELOPMENT_TECH_STACK_CATEGORIES.filter((c) => c.id !== "visao").map((c) => ({
      label: c.navLabel,
      adminPath: c.adminPath,
      value: readChoice(fields, c.fieldId)
    }));
  }, [fields, isOverview]);

  const persist = useCallback(
    (fieldId: string, value: string | null) => {
      onSavingChange?.(true);
      const next = { ...fields };
      if (value === null || value === "") delete next[fieldId];
      else next[fieldId] = value;
      onFieldsChange(next);
      void patchProjectWorkspace(projectId, { fieldId, value: value || null })
        .catch((err) => onError(err instanceof Error ? err.message : "Falha ao salvar stack."))
        .finally(() => onSavingChange?.(false));
    },
    [projectId, fields, onFieldsChange, onError, onSavingChange]
  );

  const projectQ = projectId ? `?project=${encodeURIComponent(projectId)}` : "";

  if (isOverview) {
    return (
      <div className="space-y-6">
        <section className="panel p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--app-text)]">Decisões registradas</h2>
          {summaryRows.every((r) => !r.value) ? (
            <p className="text-sm text-[var(--app-text-muted)]">
              Escolha linguagens, frameworks e bancos em cada item da seção Stack no menu.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--app-border)] text-sm">
              {summaryRows.map((row) => (
                <li key={row.label} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <Link
                    to={`${ADMIN_BASE}/${row.adminPath}${projectQ}`}
                    className="font-medium text-brand-primary hover:underline"
                  >
                    {row.label}
                  </Link>
                  <span className="flex items-center gap-2 text-[var(--app-text)]">
                    {row.value ? (
                      (() => {
                        const opt = findDevTechOptionByStoredValue(row.value);
                        return opt ? (
                          <DevTechBrandIcon optionId={opt.id} label={opt.label} size={18} />
                        ) : null;
                      })()
                    ) : null}
                    {row.value || "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <label className="panel block space-y-2 p-4 sm:p-5 text-sm">
          <span className="font-semibold text-[var(--app-text)]">Notas da decisão (visão geral)</span>
          <textarea
            className="input min-h-[120px] w-full"
            placeholder="Critérios: prazo PL, pico de tráfego, time do cliente, orçamento infra…"
            defaultValue={readChoice(fields, category.fieldId)}
            onBlur={(e) => persist(category.fieldId, e.target.value)}
          />
        </label>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <p className="text-sm text-[var(--app-text-muted)]">{category.description}</p>
      {grouped.map(({ group, options }) => (
        <div key={group} className="panel space-y-3 p-4 sm:p-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--app-text-subtle)]">{group}</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {options.map((opt) => {
              const active = selected === opt.label || selected === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`flex gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "border-sky-500 bg-sky-500/10 font-semibold text-sky-900 dark:text-sky-100"
                      : "border-[var(--app-border)] bg-[var(--app-panel)] hover:border-sky-400/50"
                  }`}
                  onClick={() => persist(category.fieldId, opt.label)}
                >
                  <DevTechBrandIcon optionId={opt.id} label={opt.label} size={24} className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="block">{opt.label}</span>
                    {opt.hint ? (
                      <span className="mt-0.5 block text-xs font-normal text-[var(--app-text-muted)]">{opt.hint}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <label className="panel block space-y-1.5 p-4 sm:p-5 text-sm">
        <span className="font-medium text-[var(--app-text)]">Outro / stack híbrida</span>
        <input
          className="input w-full"
          placeholder="Ex.: Next.js + Nest + Neon + Render…"
          defaultValue={selected && !isPresetSelected(selected, category) ? selected : ""}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v) persist(category.fieldId, v);
          }}
        />
      </label>
    </section>
  );
}
