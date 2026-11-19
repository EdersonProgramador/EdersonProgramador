export type BookClient = {
  projectId: string;
  title: string;
  status: string;
  packageTier: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  leadStatus: string | null;
  leadPackageTier: string | null;
  agentsDeployed: number;
  agents: { id: string; name: string; templateId: string; status: string }[];
  pendingApprovals: number;
  scorecard: { health: "ready" | "partial" | "needs_bootstrap" };
};

export type AgentJob = {
  id: string;
  title: string;
  status: string;
  kind: string;
  projectId: string | null;
  draftJson: Record<string, unknown> | null;
  createdAt: string;
  agent: { id: string; name: string; templateId: string };
};

export type AgentRow = {
  id: string;
  name: string;
  templateId: string;
  status: string;
  sourceProjectId: string | null;
  brandVoice: string | null;
  offerSummary: string | null;
  guardrails: string | null;
  deployments: { id: string; projectId: string; status: string }[];
};
