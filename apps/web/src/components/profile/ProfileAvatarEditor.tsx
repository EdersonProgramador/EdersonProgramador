import { useRef, useState } from "react";
import type { AuthContext, AuthUser } from "@ederson-agencia/shared";
import { ApiError, apiDelete, apiUploadForm, type LoginResponse } from "../../api";
import { useAuthStore } from "../../stores/authStore";
import { ProfileAvatarCircle } from "./ProfileAvatarCircle";

export function ProfileAvatarEditor({ user, realm }: { user: AuthUser; realm: AuthContext }) {
  const patchSession = useAuthStore((s) => s.patchSession);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheKey, setCacheKey] = useState(0);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Envie um arquivo de imagem (JPG, PNG, WebP ou GIF).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 2 MB.");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("avatar", file);
      const data = await apiUploadForm<LoginResponse & { message?: string }>("/auth/profile/avatar", form);
      patchSession(realm, data);
      setCacheKey(Date.now());
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Não foi possível enviar a foto.";
      setError(
        msg.includes("not found") || msg.includes("não encontrad")
          ? "Upload indisponível na API. Aguarde o deploy ou use a API local (VITE_DEV_API_USE_LOCAL=true)."
          : msg
      );
    } finally {
      setUploading(false);
    }
  }

  async function onRemove() {
    if (!user.avatarUrl) return;
    setError(null);
    setUploading(true);
    try {
      const data = await apiDelete<LoginResponse & { message?: string }>("/auth/profile/avatar");
      patchSession(realm, data);
      setCacheKey(Date.now());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível remover a foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <ProfileAvatarCircle user={user} size="lg" cacheKey={cacheKey} />
      <div className="flex flex-col items-center gap-2 sm:items-start">
        <p className="text-sm text-[var(--app-text-muted)]">Foto de perfil · JPG, PNG, WebP ou GIF · até 2 MB</p>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <button
            type="button"
            className="btn-secondary min-h-10 text-sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Enviando…" : user.avatarUrl ? "Trocar foto" : "Enviar foto"}
          </button>
          {user.avatarUrl ? (
            <button type="button" className="btn-ghost min-h-10 text-sm" disabled={uploading} onClick={() => void onRemove()}>
              Remover
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => void onFileChange(e)}
        />
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
