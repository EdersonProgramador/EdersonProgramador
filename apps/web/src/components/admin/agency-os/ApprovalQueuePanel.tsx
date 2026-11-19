import type { AgentJob } from "./types";

export function ApprovalQueuePanel({
  jobs,
  busy,
  onDecide
}: {
  jobs: AgentJob[];
  busy: boolean;
  onDecide: (jobId: string, decision: "APPROVED" | "REJECTED" | "SENT") => void;
}) {
  return (
    <section className="agency-os-panel">
      <header className="agency-os-panel__head">
        <h2>Fila de aprovação</h2>
        <p>Você assina o que sai — aprovar grava no projeto / campanha.</p>
      </header>
      {jobs.length === 0 ? (
        <p className="text-sm text-[var(--app-text-muted)]">Nada pendente.</p>
      ) : (
        <ul className="agency-os-jobs">
          {jobs.map((job) => {
            const draft = job.draftJson ?? {};
            const body = typeof draft.body === "string" ? draft.body : null;
            const subject = typeof draft.subject === "string" ? draft.subject : null;
            const summary = typeof draft.summary === "string" ? draft.summary : null;
            return (
              <li key={job.id} className="agency-os-job">
                <div className="agency-os-job__head">
                  <div>
                    <p className="font-semibold text-[var(--app-text)]">{job.title}</p>
                    <p className="text-xs text-[var(--app-text-muted)]">
                      {job.agent.name} · {job.kind}
                      {summary ? ` · ${summary}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={busy}
                      onClick={() => onDecide(job.id, "APPROVED")}
                    >
                      Aprovar e aplicar
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      disabled={busy}
                      onClick={() => onDecide(job.id, "REJECTED")}
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
                {subject ? <p className="text-sm font-medium">Assunto: {subject}</p> : null}
                {body ? <pre className="agency-os-job__body">{body}</pre> : null}
                {!body && draft.brandingPatch ? (
                  <pre className="agency-os-job__body">{JSON.stringify(draft.brandingPatch, null, 2)}</pre>
                ) : null}
                {!body && draft.proposalPack ? (
                  <pre className="agency-os-job__body">{JSON.stringify(draft.proposalPack, null, 2)}</pre>
                ) : null}
                {!body && draft.campaignDraft ? (
                  <pre className="agency-os-job__body">{JSON.stringify(draft.campaignDraft, null, 2)}</pre>
                ) : null}
                {!body && draft.salesScript ? (
                  <pre className="agency-os-job__body">{JSON.stringify(draft.salesScript, null, 2)}</pre>
                ) : null}
                {!body && draft.launchPlan ? (
                  <pre className="agency-os-job__body">{JSON.stringify(draft.launchPlan, null, 2)}</pre>
                ) : null}
                {!body && draft.stackPick ? (
                  <pre className="agency-os-job__body">{JSON.stringify(draft.stackPick, null, 2)}</pre>
                ) : null}
                {!body && draft.codeSnippet ? (
                  <pre className="agency-os-job__body">{JSON.stringify(draft.codeSnippet, null, 2)}</pre>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
