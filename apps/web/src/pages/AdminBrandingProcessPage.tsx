import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProjectWorkspace } from "../api/project-workspace-api";
import {
  BRANDING_APPROVAL_GATES,
  BRANDING_FINAL_DELIVERABLES,
  BRANDING_PROCESS_INTRO,
  BRANDING_PROCESS_STEPS,
  brandingEtapaProgress,
  brandingWorkspaceProgress,
  findBrandingOperationNavContext,
  getBrandingEtapa,
  parseBrandingWorkspaceJson,
  type BrandingWorkspaceData
} from "@ederson-agencia/shared";
import { ADMIN_BASE } from "../components/admin/AdminOperationsLayout";

const LOCAL_STORAGE_KEY = "ederson-agencia.project-workspace.v1";

function readLocalFields(): BrandingWorkspaceData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { fields?: BrandingWorkspaceData };
    if (parsed.fields) return parsed.fields;
    return parseBrandingWorkspaceJson(parsed);
  } catch {
    return {};
  }
}

export function AdminBrandingProcessPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("project") ?? "";
  const projectQ = projectId ? `?project=${encodeURIComponent(projectId)}` : "";
  const navCtx = findBrandingOperationNavContext("operacao/branding/processo");
  const [data, setData] = useState<BrandingWorkspaceData>(() => readLocalFields());

  useEffect(() => {
    if (!projectId) {
      setData(readLocalFields());
      return;
    }
    void getProjectWorkspace(projectId).then((res) => setData(res.workspace.fields));
  }, [projectId]);

  const overall = useMemo(() => brandingWorkspaceProgress(data), [data]);

  return (
    <div className="agency-branding-process space-y-8">
      <header className="agency-admin-page-head">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
          {navCtx ? (
            <>
              {navCtx.pillarLabel} · {navCtx.sectionLabel} · {navCtx.itemLabel}
            </>
          ) : (
            "Branding"
          )}
        </p>
        <h1>Sistema de criação de marcas</h1>
        <p className="max-w-3xl">{BRANDING_PROCESS_INTRO}</p>
        <p className="text-xs text-[var(--app-text-muted)]">
          Progresso geral (rascunho local): {overall.done}/{overall.total} campos ({overall.percent}%)
          {projectId ? " — abra cada etapa com o projeto selecionado para dados do banco." : null}
        </p>
      </header>

      <section className="panel p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--app-text)]">12 etapas</h2>
        <p className="mt-1 text-sm text-[var(--app-text-muted)]">
          Clique para preencher o workspace da etapa. O processo é iterativo — volte quando pesquisas ou testes pedirem
          revisão.
        </p>
        <ol className="mt-4 space-y-3">
          {BRANDING_PROCESS_STEPS.map((step) => {
            const etapa = getBrandingEtapa(step.etapaId);
            const progress = etapa ? brandingEtapaProgress(etapa, data) : null;
            return (
              <li
                key={step.etapaId}
                className="agency-branding-process__step rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                      Etapa {step.order}
                    </p>
                    <h3 className="text-base font-semibold text-[var(--app-text)]">{step.title}</h3>
                    <p className="mt-1 text-sm text-[var(--app-text-muted)]">{step.objective}</p>
                    {step.note ? (
                      <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">{step.note}</p>
                    ) : null}
                  </div>
                  <Link
                    to={`${ADMIN_BASE}/operacao/branding/${step.etapaId}${projectQ}`}
                    className="btn-primary shrink-0 text-sm"
                  >
                    Abrir workspace
                    {progress && progress.total > 0 ? ` (${progress.percent}%)` : ""}
                  </Link>
                </div>
                {step.deliverables.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {step.deliverables.map((d) => (
                      <li
                        key={d}
                        className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-900 dark:text-violet-100"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="panel p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--app-text)]">Antes de avançar</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--app-text)]">
          {BRANDING_APPROVAL_GATES.map((gate) => (
            <li key={gate.question} className="flex gap-2">
              <span className="text-violet-600 dark:text-violet-300" aria-hidden>
                ✓
              </span>
              <span>{gate.question}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--app-text)]">Entrega final do projeto</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-[var(--app-text-muted)]">
          {BRANDING_FINAL_DELIVERABLES.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-violet-500">•</span>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
