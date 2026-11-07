/** Playbook operacional — fases FL e checklist (admin da agência). */

import { MARKETING_DEV_STACKS, marketingDevAllTaskIds, marketingDevTaskId } from "./launch-operation-marketing-dev.js";

export type LaunchOperationPillarId = "branding" | "marketing-tech" | "formula";

export type LaunchOperationPillar = {
  id: LaunchOperationPillarId;
  shortLabel: string;
  title: string;
  description: string;
};

export const LAUNCH_OPERATION_PILLARS: Record<LaunchOperationPillarId, LaunchOperationPillar> = {
  branding: {
    id: "branding",
    shortLabel: "Branding",
    title: "Pilar Branding",
    description: "Sequência em definição."
  },
  "marketing-tech": {
    id: "marketing-tech",
    shortLabel: "Marketing & Tech",
    title: "Pilar Marketing Digital e Tecnologia",
    description: "Sequência em definição."
  },
  formula: {
    id: "formula",
    shortLabel: "Fórmula de Lançamento",
    title: "Pilar Fórmula de Lançamento",
    description: "Sequência em definição."
  }
};

export const LAUNCH_OPERATION_PILLAR_ORDER: LaunchOperationPillarId[] = ["branding", "marketing-tech", "formula"];

export type LaunchOperationChecklistItem = {
  text: string;
  pillars: LaunchOperationPillarId[];
};

export type LaunchOperationSection = {
  heading: string;
  primaryPillar: LaunchOperationPillarId;
  items: LaunchOperationChecklistItem[];
};

export type LaunchOperationPhase = {
  id: string;
  order: number;
  emoji: string;
  navLabel: string;
  title: string;
  subtitle: string;
  pillarFocus: LaunchOperationPillarId[];
  pillarBridge: string;
  sections: LaunchOperationSection[];
  relatedAdminPaths?: { label: string; pathSuffix: string }[];
};

/** Conteúdo esvaziado — a sequência FL será redefinida pela agência. */
export const LAUNCH_OPERATION_PHASES: readonly LaunchOperationPhase[] = [];

export function getLaunchOperationPhase(id: string): LaunchOperationPhase | undefined {
  return LAUNCH_OPERATION_PHASES.find((p) => p.id === id);
}

export function adjacentLaunchOperationPhase(
  phaseId: string,
  direction: "prev" | "next"
): LaunchOperationPhase | undefined {
  const index = LAUNCH_OPERATION_PHASES.findIndex((p) => p.id === phaseId);
  if (index === -1) return undefined;
  const nextIndex = direction === "prev" ? index - 1 : index + 1;
  return LAUNCH_OPERATION_PHASES[nextIndex];
}

export function launchOperationTaskId(phaseId: string, sectionIndex: number, itemIndex: number): string {
  return `${phaseId}:s${sectionIndex}:i${itemIndex}`;
}

export function parseLaunchOpCheckedJson(value: unknown): Record<string, boolean> {
  if (value === null || value === undefined) return {};
  if (typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, boolean> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (typeof val === "boolean") out[key] = val;
  }
  return out;
}

function iterPhaseTasks(
  phase: LaunchOperationPhase,
  fn: (phaseId: string, sectionIndex: number, itemIndex: number, item: LaunchOperationChecklistItem) => void
) {
  phase.sections.forEach((section, sectionIndex) => {
    section.items.forEach((item, itemIndex) => fn(phase.id, sectionIndex, itemIndex, item));
  });
}

export function launchOperationAllTaskIds(): string[] {
  const phaseIds = LAUNCH_OPERATION_PHASES.flatMap((phase) => {
    const ids: string[] = [];
    iterPhaseTasks(phase, (phaseId, si, ii) => {
      ids.push(launchOperationTaskId(phaseId, si, ii));
    });
    return ids;
  });
  return [...phaseIds, ...marketingDevAllTaskIds()];
}

export function launchOperationProgress(checked: Record<string, boolean>): {
  total: number;
  done: number;
  percent: number;
} {
  const ids = launchOperationAllTaskIds();
  const done = ids.filter((id) => checked[id]).length;
  const total = ids.length;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function launchOperationPhaseProgress(
  phase: LaunchOperationPhase,
  checked: Record<string, boolean>
): { total: number; done: number; percent: number } {
  let total = 0;
  let done = 0;
  iterPhaseTasks(phase, (phaseId, si, ii) => {
    total += 1;
    const id = launchOperationTaskId(phaseId, si, ii);
    if (checked[id]) done += 1;
  });
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

export function launchOperationPillarProgress(
  pillarId: LaunchOperationPillarId,
  checked: Record<string, boolean>
): { total: number; done: number; percent: number } {
  let total = 0;
  let done = 0;
  for (const phase of LAUNCH_OPERATION_PHASES) {
    iterPhaseTasks(phase, (phaseId, si, ii, item) => {
      if (!item.pillars.includes(pillarId)) return;
      total += 1;
      const id = launchOperationTaskId(phaseId, si, ii);
      if (checked[id]) done += 1;
    });
  }
  for (const stack of MARKETING_DEV_STACKS) {
    stack.items.forEach((item, index) => {
      if (!item.pillars.includes(pillarId)) return;
      total += 1;
      const id = marketingDevTaskId(stack.id, index);
      if (checked[id]) done += 1;
    });
  }
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
