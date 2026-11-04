import type { Prisma } from "@prisma/client";
import {
  workspaceFieldIdValid,
  checklistTaskIdValid,
  hydrateProjectWorkspace,
  projectWorkspaceToLegacyColumns,
  type BrandingFieldValue,
  type ProjectWorkspaceDocument
} from "@ederson-agencia/shared";
import { prisma } from "../prisma.js";

type ProjectWorkspaceRow = {
  id?: string;
  projectWorkspaceJson: unknown;
  brandingWorkspaceJson: unknown;
  launchOpCheckedJson: unknown;
};

export function loadProjectWorkspace(row: ProjectWorkspaceRow): ProjectWorkspaceDocument {
  return hydrateProjectWorkspace({
    projectWorkspaceJson: row.projectWorkspaceJson,
    brandingWorkspaceJson: row.brandingWorkspaceJson,
    launchOpCheckedJson: row.launchOpCheckedJson
  });
}

export async function persistProjectWorkspace(
  projectId: string,
  doc: ProjectWorkspaceDocument
): Promise<ProjectWorkspaceDocument> {
  const legacy = projectWorkspaceToLegacyColumns(doc);
  await prisma.project.update({
    where: { id: projectId },
    data: {
      projectWorkspaceJson: legacy.projectWorkspaceJson as Prisma.InputJsonValue,
      brandingWorkspaceJson: legacy.brandingWorkspaceJson as Prisma.InputJsonValue,
      launchOpCheckedJson: legacy.launchOpCheckedJson as Prisma.InputJsonValue
    }
  });
  return legacy.projectWorkspaceJson;
}

export async function patchProjectWorkspaceField(
  projectId: string,
  fieldId: string,
  value: BrandingFieldValue | null
): Promise<ProjectWorkspaceDocument> {
  if (!workspaceFieldIdValid(fieldId)) {
    throw Object.assign(new Error("fieldId inválido."), { statusCode: 400 });
  }
  const row = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      projectWorkspaceJson: true,
      brandingWorkspaceJson: true,
      launchOpCheckedJson: true
    }
  });
  if (!row) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });

  const doc = loadProjectWorkspace(row);
  if (value === null) delete doc.fields[fieldId];
  else doc.fields[fieldId] = value;
  return persistProjectWorkspace(projectId, doc);
}

export async function patchProjectWorkspaceTask(
  projectId: string,
  taskId: string,
  done: boolean
): Promise<ProjectWorkspaceDocument> {
  if (!checklistTaskIdValid(taskId)) {
    throw Object.assign(new Error("taskId inválido."), { statusCode: 400 });
  }
  const row = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      projectWorkspaceJson: true,
      brandingWorkspaceJson: true,
      launchOpCheckedJson: true
    }
  });
  if (!row) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });

  const doc = loadProjectWorkspace(row);
  if (done) doc.checklist[taskId] = true;
  else delete doc.checklist[taskId];
  return persistProjectWorkspace(projectId, doc);
}
