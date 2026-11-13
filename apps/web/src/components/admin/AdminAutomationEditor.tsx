import { useCallback, useEffect, useState } from "react";
import {
  AUTOMATION_ACTION_OPTIONS,
  AUTOMATION_TRIGGER_OPTIONS,
  MARKETING_CAPABILITY_MATRIX,
  MARKETING_INTEGRATION_CATALOG,
  type AutomationStep,
  type AutomationTriggerId,
  type MarketingAutomationDto
} from "@ederson-agencia/shared";
import { ApiError, apiGet, apiPatch, apiPost } from "../../api";

type ProvidersStatus = {
  providers: Record<string, boolean | string>;
  integrationCatalog: typeof MARKETING_INTEGRATION_CATALOG;
  capabilities: typeof MARKETING_CAPABILITY_MATRIX;
};

export function AdminAutomationEditor() {
  const [items, setItems] = useState<MarketingAutomationDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<ProvidersStatus | null>(null);
  const [runs, setRuns] = useState<unknown[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selected = items.find((i) => i.id === selectedId) ?? items[0] ?? null;

  const refresh = useCallback(async () => {
    const [list, st] = await Promise.all([
      apiGet<{ automations: MarketingAutomationDto[] }>("/agency/admin/automations"),
      apiGet<ProvidersStatus>("/agency/admin/automations/status")
    ]);
    setItems(list.automations);
    setStatus(st);
    if (!selectedId && list.automations[0]) setSelectedId(list.automations[0].id);
  }, [selectedId]);

  useEffect(() => {
    void refresh().catch((e) => setMessage(e instanceof ApiError ? e.message : "Erro ao carregar."));
  }, [refresh]);

  useEffect(() => {
    if (!selected?.id) return;
    void apiGet<{ runs: unknown[] }>(`/agency/admin/automations/${selected.id}/runs`).then((r) => setRuns(r.runs));
  }, [selected?.id]);

  async function saveDraft(next: MarketingAutomationDto) {
    if (!next.id) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await apiPatch<{ automation: MarketingAutomationDto }>(`/agency/admin/automations/${next.id}`, {
        name: next.name,
        description: next.description,
        enabled: next.enabled,
        trigger: next.trigger,
        triggerFilter: next.triggerFilter,
        steps: next.steps
      });
      setItems((prev) => prev.map((a) => (a.id === res.automation.id ? res.automation : a)));
      setMessage("Automação salva.");
    } catch (e) {
      setMessage(e instanceof ApiError ? e.message : "Falha ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  function updateSelected(patch: Partial<MarketingAutomationDto>) {
    if (!selected) return;
    const next = { ...selected, ...patch };
    setItems((prev) => prev.map((a) => (a.id === next.id ? next : a)));
  }

  function updateStep(index: number, patch: Partial<AutomationStep>) {
    if (!selected) return;
    const steps = selected.steps.map((s, i) => (i === index ? { ...s, ...patch } : s));
    updateSelected({ steps });
  }

  async function testRun() {
    if (!selected) return;
    setBusy(true);
    try {
      await apiPost(`/agency/admin/automations/${selected.id}/test`, {});
      setMessage("Teste enfileirado — veja o histórico em alguns segundos.");
      const r = await apiGet<{ runs: unknown[] }>(`/agency/admin/automations/${selected.id}/runs`);
      setRuns(r.runs);
    } catch (e) {
      setMessage(e instanceof ApiError ? e.message : "Falha no teste.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {status ? (
        <section className="panel space-y-3 p-4">
          <h2 className="text-sm font-semibold">Provedores (modo AUTO)</h2>
          <p className="text-xs text-[var(--app-text-muted)]">
            Brevo é só um exemplo — o sistema escolhe Resend, Brevo, Leadlovers ou webhook conforme o ambiente.
          </p>
          <dl className="grid gap-2 text-xs sm:grid-cols-2">
            {Object.entries(status.providers).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 rounded-lg border border-[var(--app-border)] px-3 py-2">
                <dt className="text-[var(--app-text-muted)]">{k}</dt>
                <dd className="font-medium text-[var(--app-text)]">{String(v)}</dd>
              </div>
            ))}
          </dl>
          <ul className="text-xs text-[var(--app-text-muted)]">
            {status.integrationCatalog.map((row) => (
              <li key={row.role}>
                <strong className="text-[var(--app-text)]">{row.role}:</strong> {row.examples}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(12rem,16rem)_1fr]">
        <aside className="space-y-2">
          {items.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                selected?.id === a.id ? "border-emerald-500/40 bg-emerald-500/10" : "border-[var(--app-border)]"
              }`}
              onClick={() => setSelectedId(a.id)}
            >
              <span className="font-medium">{a.name}</span>
              <span className="mt-0.5 block text-xs text-[var(--app-text-muted)]">{a.trigger}</span>
            </button>
          ))}
        </aside>

        {selected ? (
          <section className="panel space-y-4 p-4">
            <h2 className="text-lg font-semibold">{selected.name}</h2>
            <label className="block space-y-1 text-sm">
              <span>Descrição</span>
              <textarea
                className="input min-h-[4rem] w-full"
                value={selected.description ?? ""}
                onChange={(e) => updateSelected({ description: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.enabled}
                onChange={(e) => updateSelected({ enabled: e.target.checked })}
              />
              Fluxo ativo
            </label>
            <label className="block space-y-1 text-sm">
              <span>Trigger</span>
              <select
                className="input w-full"
                value={selected.trigger}
                onChange={(e) => updateSelected({ trigger: e.target.value as AutomationTriggerId })}
              >
                {AUTOMATION_TRIGGER_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} — {t.hint}
                  </option>
                ))}
              </select>
            </label>

            <ol className="space-y-3">
              {selected.steps.map((step, index) => {
                const meta = AUTOMATION_ACTION_OPTIONS.find((o) => o.id === step.type);
                return (
                  <li key={step.id} className="rounded-lg border border-[var(--app-border)] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {index + 1}. {meta?.label ?? step.type}
                      </span>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={step.enabled !== false}
                          onChange={(e) => updateStep(index, { enabled: e.target.checked })}
                        />
                        Ativa
                      </label>
                    </div>
                    {"provider" in (step.config ?? {}) || meta?.defaultConfig?.provider ? (
                      <label className="mt-2 block space-y-1 text-xs">
                        <span>Provedor</span>
                        <select
                          className="input w-full text-sm"
                          value={String(step.config.provider ?? "auto")}
                          onChange={(e) =>
                            updateStep(index, { config: { ...step.config, provider: e.target.value } })
                          }
                        >
                          <option value="auto">auto (detecta pelo .env)</option>
                          <option value="brevo">brevo</option>
                          <option value="resend">resend</option>
                          <option value="leadlovers">leadlovers</option>
                          <option value="webhook">webhook</option>
                          <option value="none">none</option>
                        </select>
                      </label>
                    ) : null}
                    {step.type === "message.send" || step.type === "email.resend" || step.type === "brevo.send_transactional" ? (
                      <>
                        <label className="mt-2 block space-y-1 text-xs">
                          <span>Assunto</span>
                          <input
                            className="input w-full"
                            value={String(step.config.subject ?? "")}
                            onChange={(e) =>
                              updateStep(index, { config: { ...step.config, subject: e.target.value } })
                            }
                          />
                        </label>
                        <label className="mt-2 block space-y-1 text-xs">
                          <span>HTML (use {"{{FIRSTNAME}}"}, {"{{LEAD_EMAIL}}"}, etc.)</span>
                          <textarea
                            className="input min-h-[5rem] w-full font-mono text-xs"
                            value={String(step.config.html ?? "")}
                            onChange={(e) => updateStep(index, { config: { ...step.config, html: e.target.value } })}
                          />
                        </label>
                      </>
                    ) : null}
                  </li>
                );
              })}
            </ol>

            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-primary" disabled={busy} onClick={() => void saveDraft(selected)}>
                Salvar fluxo
              </button>
              <button type="button" className="btn-secondary" disabled={busy} onClick={() => void testRun()}>
                Testar
              </button>
            </div>

            {message ? <p className="text-sm text-[var(--app-text-muted)]">{message}</p> : null}

            <details className="text-xs text-[var(--app-text-muted)]">
              <summary className="cursor-pointer font-medium text-[var(--app-text)]">Últimas execuções</summary>
              <pre className="mt-2 max-h-48 overflow-auto rounded bg-black/30 p-2">{JSON.stringify(runs, null, 2)}</pre>
            </details>
          </section>
        ) : null}
      </div>
    </div>
  );
}
