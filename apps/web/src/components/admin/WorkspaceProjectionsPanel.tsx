import { projectWorkspaceFeedProjections, type BrandingWorkspaceData } from "@ederson-agencia/shared";

type Props = {
  fields: BrandingWorkspaceData;
  title?: string;
  /** Se informado, só mostra estes targetIds. */
  targetIds?: string[];
  compact?: boolean;
};

export function WorkspaceProjectionsPanel({ fields, title, targetIds, compact }: Props) {
  const all = projectWorkspaceFeedProjections(fields);
  const entries = Object.entries(all).filter(([id]) =>
    targetIds?.length ? targetIds.includes(id) : true
  );

  if (entries.length === 0) return null;

  return (
    <div className={`panel space-y-2 ${compact ? "p-3 sm:p-4" : "p-4 sm:p-5"}`}>
      <h2 className={`font-semibold text-[var(--app-text)] ${compact ? "text-sm" : "text-base"}`}>
        {title ?? "Copy sincronizada (workspace)"}
      </h2>
      <p className="text-xs text-[var(--app-text-muted)]">
        Valores derivados de Branding + Produto. Atualizam quando você salva no projeto.
      </p>
      <ul className="space-y-2">
        {entries.map(([targetId, row]) => (
          <li key={targetId} className="rounded-lg border border-[var(--app-border)] px-3 py-2">
            <p className="text-xs font-medium text-[var(--app-text-muted)]">{row.label}</p>
            <p className={`mt-0.5 text-sm ${row.value ? "text-[var(--app-text)]" : "text-[var(--app-text-subtle)] italic"}`}>
              {row.value ?? "Pendente — preencha Branding ou Produto & checkout"}
            </p>
            {row.sourceFieldId ? (
              <p className="mt-1 font-mono text-[10px] text-[var(--app-text-subtle)]">via {row.sourceFieldId}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const LAUNCH_PROJECTION_TARGETS = [
  "launch:copy:promessa",
  "launch:copy:tagline",
  "launch:copy:manifesto"
] as const;

export const MARKETING_PROJECTION_TARGETS = [
  "marketing:persona:resumo",
  "marketing:seo:territorio",
  "marketing:checkout:url",
  "product:offer:nome"
] as const;
