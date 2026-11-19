import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Persiste entregável aprovado no destino (branding / campanha / notas de projeto).
 */
export async function applyAgentJob(jobId: string): Promise<{ applied: string[] }> {
  const job = await prisma.agencyAgentJob.findUnique({
    where: { id: jobId },
    include: { agent: true }
  });
  if (!job) throw new Error("Job não encontrado");

  const draft = asRecord(job.draftJson);
  const kind = String(draft.deliverableKind ?? "");
  const projectId = job.projectId ?? job.agent.sourceProjectId;
  const applied: string[] = [];

  if (kind === "branding_patch" && projectId) {
    const patch = asRecord(draft.brandingPatch);
    if (Object.keys(patch).length) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (project) {
        const current = asRecord(project.brandingWorkspaceJson);
        const next = { ...current, ...patch, "agents.lastAppliedAt": new Date().toISOString() };
        await prisma.project.update({
          where: { id: projectId },
          data: { brandingWorkspaceJson: next as Prisma.InputJsonValue }
        });
        applied.push("brandingWorkspaceJson");
      }
    }
  }

  if (kind === "campaign_sequence") {
    const campaignDraft = asRecord(draft.campaignDraft);
    const name = typeof campaignDraft.name === "string" ? campaignDraft.name : `Campanha · ${job.agent.name}`;
    const sequence = campaignDraft.sequence;
    await prisma.marketingCampaign.create({
      data: {
        name,
        channel: typeof campaignDraft.channel === "string" ? campaignDraft.channel : "email",
        kind: typeof campaignDraft.kind === "string" ? campaignDraft.kind : "ACQUISITION",
        status: "DRAFT",
        sequenceJson: (sequence ?? null) as Prisma.InputJsonValue,
        subject: typeof draft.subject === "string" ? draft.subject : null,
        bodyHtml: typeof draft.body === "string" ? draft.body : null
      }
    });
    applied.push("marketingCampaign");
  }

  if (kind === "stack_pick" && projectId) {
    const picks = asRecord(draft.stackPick);
    if (Object.keys(picks).length) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (project) {
        const current = asRecord(project.projectWorkspaceJson);
        const next = {
          ...current,
          ...Object.fromEntries(
            Object.entries(picks)
              .filter(([k]) => k !== "notes")
              .map(([k, v]) => [`product:stack:${k}`, v])
          ),
          "agents.stackNotes": picks.notes ?? null,
          "agents.lastAppliedAt": new Date().toISOString()
        };
        await prisma.project.update({
          where: { id: projectId },
          data: { projectWorkspaceJson: next as Prisma.InputJsonValue }
        });
        applied.push("projectWorkspaceJson");
      }
    }
  }

  if ((kind === "proposal_pack" || kind === "content_draft" || kind === "sales_script" || kind === "launch_plan") && projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project) {
      const current = asRecord(project.projectWorkspaceJson);
      const key = `agents.deliverable.${kind}.${job.id}`;
      const next = {
        ...current,
        [key]: draft,
        "agents.lastProposalAt": kind === "proposal_pack" ? new Date().toISOString() : current["agents.lastProposalAt"]
      };
      await prisma.project.update({
        where: { id: projectId },
        data: { projectWorkspaceJson: next as Prisma.InputJsonValue }
      });
      applied.push("projectWorkspaceJson");
    }
  }

  if (kind === "code_snippet" && projectId) {
    const snippet = asRecord(draft.codeSnippet);
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project && snippet.path) {
      const current = asRecord(project.projectWorkspaceJson);
      const next = {
        ...current,
        [`agents.snippet.${String(snippet.path)}`]: snippet,
        "agents.lastAppliedAt": new Date().toISOString()
      };
      await prisma.project.update({
        where: { id: projectId },
        data: { projectWorkspaceJson: next as Prisma.InputJsonValue }
      });
      applied.push("codeSnippet");
    }
  }

  return { applied };
}
