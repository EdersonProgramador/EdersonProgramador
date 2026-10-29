import { createWriteStream, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import type { Readable } from "node:stream";
import { env } from "../env.js";

const ALLOWED_MIME = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);

const MAX_BYTES = 2 * 1024 * 1024;

export function uploadsRoot(): string {
  const base = env.UPLOAD_ROOT?.trim()
    ? resolve(env.UPLOAD_ROOT.trim())
    : resolve(process.cwd(), "uploads");
  const avatars = resolve(base, "avatars");
  if (!existsSync(avatars)) mkdirSync(avatars, { recursive: true });
  return avatars;
}

export function avatarPublicPath(userId: string, ext: string): string {
  return `/uploads/avatars/${userId}${ext}`;
}

export function avatarFileName(userId: string, ext: string): string {
  return `${userId}${ext}`;
}

export function resolveAvatarFile(relativeUrl: string | null | undefined): string | null {
  if (!relativeUrl?.startsWith("/uploads/avatars/")) return null;
  const name = relativeUrl.replace("/uploads/avatars/", "");
  if (!/^[a-z0-9]{10,40}\.(jpg|jpeg|png|webp|gif)$/i.test(name)) return null;
  const full = resolve(uploadsRoot(), name);
  if (!full.startsWith(uploadsRoot())) return null;
  return existsSync(full) ? full : null;
}

export function deleteAvatarFile(relativeUrl: string | null | undefined): void {
  const full = resolveAvatarFile(relativeUrl);
  if (!full) return;
  try {
    unlinkSync(full);
  } catch {
    /* arquivo já removido */
  }
}

export async function saveAvatarUpload(
  userId: string,
  mimeType: string,
  stream: Readable,
  reportedSize?: number
): Promise<{ avatarUrl: string; ext: string }> {
  const ext = ALLOWED_MIME.get(mimeType);
  if (!ext) {
    throw Object.assign(new Error("Use JPG, PNG, WebP ou GIF (até 2 MB)."), { statusCode: 400 });
  }
  if (reportedSize != null && reportedSize > MAX_BYTES) {
    throw Object.assign(new Error("Imagem maior que 2 MB."), { statusCode: 400 });
  }

  removeAvatarFilesForUser(userId);

  const dir = uploadsRoot();
  const fileName = avatarFileName(userId, ext);
  const dest = resolve(dir, fileName);
  if (!dest.startsWith(dir)) {
    throw Object.assign(new Error("Caminho inválido."), { statusCode: 400 });
  }

  await pipeline(stream, createWriteStream(dest));

  return { avatarUrl: avatarPublicPath(userId, ext), ext };
}

export function removeAvatarFilesForUser(userId: string): void {
  const dir = uploadsRoot();
  const prefix = `${userId}.`;
  for (const name of readdirSafe(dir)) {
    if (name.startsWith(prefix)) {
      try {
        unlinkSync(resolve(dir, name));
      } catch {
        /* ignore */
      }
    }
  }
}

function readdirSafe(dir: string): string[] {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}
