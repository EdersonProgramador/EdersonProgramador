import type { AgencyContractDocument } from "@ederson-agencia/shared";

export function ClientFunnelContractPreview({
  document,
  title
}: {
  document: AgencyContractDocument;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)]">
      <div className="border-b border-[var(--app-border)] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">{title}</p>
        <h3 className="mt-1 text-lg font-bold text-[var(--app-text)]">{document.title}</h3>
        <p className="mt-1 text-xs text-[var(--app-text-muted)]">Versão {document.version}</p>
      </div>
      <div className="max-h-[min(28rem,55vh)] space-y-6 overflow-y-auto px-5 py-5 text-sm leading-relaxed text-[var(--app-text-muted)]">
        {document.sections.map((section) => (
          <section key={section.heading}>
            <h4 className="font-semibold text-[var(--app-text)]">{section.heading}</h4>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 48)} className="mt-2">
                {p}
              </p>
            ))}
            {section.bullets?.length ? (
              <ul className="mt-2 list-disc space-y-1.5 pl-5">
                {section.bullets.map((b) => (
                  <li key={b.slice(0, 48)}>{b}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
