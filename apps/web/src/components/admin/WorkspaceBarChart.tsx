type Bar = { label: string; value: number };

type Props = {
  title: string;
  bars: Bar[];
  valuePrefix?: string;
  emptyHint?: string;
};

export function WorkspaceBarChart({ title, bars, valuePrefix = "R$ ", emptyHint }: Props) {
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div className="panel space-y-3 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-[var(--app-text)]">{title}</h2>
      {bars.length === 0 ? (
        <p className="text-sm text-[var(--app-text-muted)]">{emptyHint ?? "Preencha os campos para gerar o gráfico."}</p>
      ) : (
        <ul className="space-y-2">
          {bars.map((b) => (
            <li key={b.label}>
              <div className="mb-1 flex justify-between text-xs text-[var(--app-text-muted)]">
                <span>{b.label}</span>
                <span className="font-mono text-[var(--app-text)]">
                  {valuePrefix}
                  {b.value.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded bg-[var(--app-border)]">
                <div
                  className="h-full rounded bg-gradient-to-r from-violet-600 to-rose-500"
                  style={{ width: `${Math.max(4, (b.value / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
