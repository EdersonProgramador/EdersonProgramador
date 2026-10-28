import { MARKETING_COPY } from "@ederson-agencia/shared";

const copy = MARKETING_COPY;

export function OfferComparison() {
  const { comparison } = copy.packages;

  return (
    <div className="mt-16">
      <h3 className="font-display text-xl font-bold text-[var(--app-text)] md:text-2xl">{comparison.title}</h3>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--app-border)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[var(--app-hover)]">
            <tr>
              <th className="px-4 py-3 font-medium text-[var(--app-text-muted)]">Recurso</th>
              {comparison.columns.map((col) => (
                <th key={col} className="px-4 py-3 font-medium text-[var(--app-text)]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((row) => (
              <tr key={row.feature} className="border-t border-[var(--app-border)]">
                <td className="px-4 py-3 font-medium text-[var(--app-text)]">{row.feature}</td>
                <td className="px-4 py-3 text-[var(--app-text-muted)]">{row.essential}</td>
                <td className="px-4 py-3 text-[var(--app-text-muted)]">{row.professional}</td>
                <td className="px-4 py-3 text-[var(--app-text-muted)]">{row.advanced}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
