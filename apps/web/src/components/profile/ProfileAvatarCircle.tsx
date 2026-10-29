import { Link } from "react-router-dom";
import type { AuthUser } from "@ederson-agencia/shared";
import { apiAssetUrl } from "../../api";
import { useAuthStore } from "../../stores/authStore";

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

const sizeClass = {
  sm: "h-11 w-11 text-xs",
  lg: "h-24 w-24 text-xl"
} as const;

export function ProfileAvatarCircle({
  user,
  size = "lg",
  cacheKey
}: {
  user: Pick<AuthUser, "name" | "avatarUrl">;
  size?: keyof typeof sizeClass;
  cacheKey?: number;
}) {
  const avatarSrc = user.avatarUrl
    ? `${apiAssetUrl(user.avatarUrl)}${cacheKey != null ? `?v=${cacheKey}` : ""}`
    : null;
  const dim = size === "sm" ? 44 : 96;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--app-border)] bg-[var(--app-hover)] font-semibold text-[var(--app-text-muted)] ${sizeClass[size]}`}
      aria-hidden={Boolean(avatarSrc)}
    >
      {avatarSrc ? (
        <img src={avatarSrc} alt="" className="h-full w-full object-cover" width={dim} height={dim} />
      ) : (
        initialsFromName(user.name)
      )}
    </div>
  );
}

export function ProfileAvatarNavLink({ user, to }: { user: AuthUser; to: string }) {
  const avatarTick = useAuthStore((s) => s.profileAvatarTick);
  return (
    <Link
      to={to}
      className="inline-flex shrink-0 rounded-full transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary,#3b82f6)]"
      aria-label="Meu perfil"
    >
      <ProfileAvatarCircle user={user} size="sm" cacheKey={avatarTick || undefined} />
    </Link>
  );
}
