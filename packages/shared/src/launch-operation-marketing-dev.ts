/** Marketing · Desenvolvimento — trilhas técnicas do lançamento (Operação admin). */

import type { LaunchOperationChecklistItem } from "./launch-operation-phases.js";

export type MarketingDevStackId = "front-end" | "back-end" | "banco-de-dados";

export type MarketingDevStack = {
  id: MarketingDevStackId;
  navLabel: string;
  title: string;
  subtitle: string;
  items: LaunchOperationChecklistItem[];
};

/** Conteúdo esvaziado — a sequência será redefinida pela agência. */
export const MARKETING_DEV_STACKS: readonly MarketingDevStack[] = [];

export function getMarketingDevStack(id: string): MarketingDevStack | undefined {
  return MARKETING_DEV_STACKS.find((s) => s.id === id);
}

export function marketingDevTaskId(stackId: MarketingDevStackId, itemIndex: number): string {
  return `marketing-dev:${stackId}:i${itemIndex}`;
}

export function marketingDevAllTaskIds(): string[] {
  return MARKETING_DEV_STACKS.flatMap((stack) =>
    stack.items.map((_item, index) => marketingDevTaskId(stack.id, index))
  );
}
