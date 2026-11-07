import { DEV_CODE_STUDIO_FIELD_ID, type BrandingWorkspaceData } from "@ederson-agencia/shared";

/** Evita passar o workspace do projeto anterior enquanto o novo carrega. */
export function stripStudioFieldWhileLoading(fields: BrandingWorkspaceData): BrandingWorkspaceData {
  if (typeof fields[DEV_CODE_STUDIO_FIELD_ID] !== "string") return fields;
  const next = { ...fields };
  delete next[DEV_CODE_STUDIO_FIELD_ID];
  return next;
}

/** Preserva alterações do Code Studio feitas durante o fetch do projeto. */
export function mergeProjectWorkspaceFields(
  sessionFields: BrandingWorkspaceData,
  incoming: BrandingWorkspaceData
): BrandingWorkspaceData {
  const k = DEV_CODE_STUDIO_FIELD_ID;
  const session = typeof sessionFields[k] === "string" ? sessionFields[k] : undefined;
  if (!session?.trim()) return incoming;
  const incomingStudio = typeof incoming[k] === "string" ? incoming[k] : undefined;
  if (session === incomingStudio) return incoming;
  return { ...incoming, [k]: session };
}
