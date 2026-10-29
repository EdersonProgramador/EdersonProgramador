import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { PackageTierId } from "@ederson-agencia/shared";
import { agencyHomePathForRole } from "@ederson-agencia/shared";
import { apiGet, apiPatch, apiPost } from "../api";
import {
  ProjectJourneyPanel,
  type JourneyProject
} from "../components/portal/ProjectJourneyPanel";
import { useAgencySession } from "../stores/authStore";

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const user = useAgencySession()?.user;
  const [project, setProject] = useState<JourneyProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    if (!projectId) return;
    const res = await apiGet<{ project: JourneyProject }>(`/agency/projects/${projectId}`);
    setProject(res.project);
  }

  useEffect(() => {
    if (!projectId) return;
    void reload().catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar projeto."));
  }, [projectId]);

  if (!user) return null;
  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">{error}</p>
        <Link to={agencyHomePathForRole(user.role)} className="text-brand-primary hover:underline">
          Voltar
        </Link>
      </div>
    );
  }
  if (!project) {
    return <p className="text-[var(--app-text-muted)]">Carregando projeto…</p>;
  }

  const role = user.role;

  return (
    <div className="space-y-6">
      <Link
        to={agencyHomePathForRole(role)}
        className="inline-flex text-sm text-brand-primary hover:underline"
      >
        ← Voltar ao painel
      </Link>
      <ProjectJourneyPanel
        project={project}
        role={role}
        onPhaseStatus={async (phaseId, status) => {
          await apiPatch(`/agency/phases/${phaseId}`, { status });
          await reload();
        }}
        onDeliverableStatus={async (deliverableId, status, feedbackNote) => {
          await apiPatch(`/agency/deliverables/${deliverableId}`, { status, feedbackNote });
          await reload();
        }}
        onRequestUpgrade={
          role === "CLIENT"
            ? async (toTier: PackageTierId, clientMessage) => {
                await apiPost(`/agency/projects/${project.id}/upgrade-requests`, { toTier, clientMessage });
                await reload();
              }
            : undefined
        }
        onReviewUpgrade={
          role === "ADMIN"
            ? async (requestId, status, adminNote) => {
                await apiPatch(`/agency/upgrade-requests/${requestId}`, { status, adminNote });
                await reload();
              }
            : undefined
        }
      />
    </div>
  );
}
