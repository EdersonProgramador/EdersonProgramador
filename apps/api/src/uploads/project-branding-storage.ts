import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { extname, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import type { Readable } from "node:stream";
import { env } from "../env.js";

const MAX_BYTES = 80 * 1024 * 1024;

const MIME_EXT = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
  ["application/pdf", ".pdf"],
  ["audio/mpeg", ".mp3"],
  ["audio/mp4", ".m4a"],
  ["audio/wav", ".wav"],
  ["audio/x-wav", ".wav"],
  ["audio/ogg", ".ogg"],
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
  ["video/quicktime", ".mov"],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".docx"
  ],
  ["application/msword", ".doc"],
  [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xlsx"
  ],
  ["application/zip", ".zip"]
]);

function brandingRoot(): string {
  const base = env.UPLOAD_ROOT?.trim()
    ? resolve(env.UPLOAD_ROOT.trim())
    : resolve(process.cwd(), "uploads");
  const dir = resolve(base, "branding");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function safeProjectId(projectId: string): boolean {
  return /^[a-z0-9]{10,40}$/i.test(projectId);
}

export function brandingPublicPath(projectId: string, fileName: string): string {
  return `/uploads/branding/${projectId}/${fileName}`;
}

export function resolveBrandingFile(projectId: string, fileName: string): string | null {
  if (!safeProjectId(projectId)) return null;
  if (!/^[a-z0-9_-]{8,120}\.[a-z0-9]{2,5}$/i.test(fileName)) return null;
  const projectDir = resolve(brandingRoot(), projectId);
  const full = resolve(projectDir, fileName);
  if (!full.startsWith(projectDir)) return null;
  return existsSync(full) ? full : null;
}

export async function saveBrandingUpload(
  projectId: string,
  fieldId: string,
  mimeType: string,
  originalName: string,
  stream: Readable,
  reportedSize?: number
): Promise<{ url: string; name: string; mimeType: string; uploadedAt: string }> {
  if (!safeProjectId(projectId)) {
    throw Object.assign(new Error("Projeto inválido."), { statusCode: 400 });
  }
  if (fieldId.length > 120 || !/^branding:[a-z0-9:-]+$/i.test(fieldId)) {
    throw Object.assign(new Error("Campo inválido."), { statusCode: 400 });
  }
  const ext = MIME_EXT.get(mimeType) ?? extname(originalName).toLowerCase();
  if (!ext || ext === ".") {
    throw Object.assign(new Error("Tipo de arquivo não permitido."), { statusCode: 400 });
  }
  if (reportedSize != null && reportedSize > MAX_BYTES) {
    throw Object.assign(new Error("Arquivo maior que 80 MB."), { statusCode: 400 });
  }

  const projectDir = resolve(brandingRoot(), projectId);
  if (!existsSync(projectDir)) mkdirSync(projectDir, { recursive: true });

  const token = randomBytes(8).toString("hex");
  const fileName = `${token}${ext}`;
  const dest = resolve(projectDir, fileName);
  if (!dest.startsWith(projectDir)) {
    throw Object.assign(new Error("Caminho inválido."), { statusCode: 400 });
  }

  await pipeline(stream, createWriteStream(dest));

  const uploadedAt = new Date().toISOString();
  return {
    url: brandingPublicPath(projectId, fileName),
    name: originalName.slice(0, 200) || fileName,
    mimeType,
    uploadedAt
  };
}

export function deleteBrandingFile(projectId: string, relativeUrl: string): void {
  if (!relativeUrl.startsWith(`/uploads/branding/${projectId}/`)) return;
  const fileName = relativeUrl.split("/").pop() ?? "";
  const full = resolveBrandingFile(projectId, fileName);
  if (!full) return;
  try {
    unlinkSync(full);
  } catch {
    /* ignore */
  }
}
