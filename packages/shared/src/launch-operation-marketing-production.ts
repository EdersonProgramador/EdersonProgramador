/** Marketing — fases de produção (checklist espelha tarefas das fases FL, mesmos IDs). */

import type { LaunchOperationChecklistItem } from "./launch-operation-phases.js";
import {
  LAUNCH_OPERATION_PHASES,
  launchOperationTaskId,
  type LaunchOperationPhase
} from "./launch-operation-phases.js";
import { getMarketingDevStack, type MarketingDevStack } from "./launch-operation-marketing-dev.js";

export type MarketingProductionViewId = "conteudo-seo" | "captacao-trafego";

export type MarketingProductionTaskRef = {
  phaseId: string;
  sectionIndex: number;
  itemIndex: number;
};

export type MarketingProductionView = {
  type: "production";
  id: MarketingProductionViewId;
  navLabel: string;
  title: string;
  subtitle: string;
  refs: readonly MarketingProductionTaskRef[];
};

function phaseById(phaseId: string): LaunchOperationPhase | undefined {
  return LAUNCH_OPERATION_PHASES.find((p) => p.id === phaseId);
}

function itemAt(ref: MarketingProductionTaskRef): LaunchOperationChecklistItem | undefined {
  const phase = phaseById(ref.phaseId);
  return phase?.sections[ref.sectionIndex]?.items[ref.itemIndex];
}

export const MARKETING_PRODUCTION_VIEWS: readonly MarketingProductionView[] = [
  {
    type: "production",
    id: "conteudo-seo",
    navLabel: "Conteúdo, SEO & aquecimento",
    title: "Marketing — Conteúdo, SEO & aquecimento",
    subtitle:
      "Distribuição orgânica, palavras-chave e calendário teaser antes do PPL — avatar certo aquecido com a voz da marca.",
    refs: [
      { phaseId: "fase-2", sectionIndex: 1, itemIndex: 0 },
      { phaseId: "fase-2", sectionIndex: 2, itemIndex: 0 },
      { phaseId: "fase-2", sectionIndex: 2, itemIndex: 1 },
      { phaseId: "fase-1", sectionIndex: 4, itemIndex: 0 },
      { phaseId: "fase-1", sectionIndex: 4, itemIndex: 1 }
    ]
  },
  {
    type: "production",
    id: "captacao-trafego",
    navLabel: "Captação, automação & tráfego",
    title: "Marketing — Captação, automação & tráfego (PPL)",
    subtitle:
      "LPs no ar, e-mail entregando, pixels ativos e mídia paga capturando inscritos — mesmo playbook da Fase 3 FL.",
    refs: [
      { phaseId: "fase-3", sectionIndex: 0, itemIndex: 0 },
      { phaseId: "fase-3", sectionIndex: 0, itemIndex: 1 },
      { phaseId: "fase-3", sectionIndex: 1, itemIndex: 0 },
      { phaseId: "fase-3", sectionIndex: 1, itemIndex: 1 },
      { phaseId: "fase-3", sectionIndex: 2, itemIndex: 0 },
      { phaseId: "fase-3", sectionIndex: 2, itemIndex: 1 },
      { phaseId: "fase-3", sectionIndex: 3, itemIndex: 0 },
      { phaseId: "fase-3", sectionIndex: 3, itemIndex: 1 }
    ]
  }
] as const;

export function getMarketingProductionView(id: string): MarketingProductionView | undefined {
  return MARKETING_PRODUCTION_VIEWS.find((v) => v.id === id);
}

export function getMarketingOperationPage(id: string):
  | { kind: "dev"; stack: MarketingDevStack }
  | { kind: "production"; view: MarketingProductionView }
  | undefined {
  const dev = getMarketingDevStack(id);
  if (dev) return { kind: "dev", stack: dev };
  const production = getMarketingProductionView(id);
  if (production) return { kind: "production", view: production };
  return undefined;
}

export function marketingProductionResolvedItems(
  view: MarketingProductionView
): { taskId: string; item: LaunchOperationChecklistItem }[] {
  const out: { taskId: string; item: LaunchOperationChecklistItem }[] = [];
  for (const ref of view.refs) {
    const item = itemAt(ref);
    if (!item) continue;
    out.push({
      taskId: launchOperationTaskId(ref.phaseId, ref.sectionIndex, ref.itemIndex),
      item
    });
  }
  return out;
}
