import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AGENCY_APP_BASE } from "@ederson-agencia/shared";
import { Bell } from "lucide-react";
import { apiGet, apiPatch, apiPost } from "../../api";

type NotificationRow = {
  id: string;
  kind: string;
  title: string;
  body: string;
  projectId: string | null;
  readAt: string | null;
  createdAt: string;
};

const POLL_MS = 20_000;

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function AgencyNotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const knownUnreadRef = useRef(0);
  const seenIdsRef = useRef(new Set<string>());
  const desktopEnabledRef = useRef(
    typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"
  );

  const pushDesktopAlerts = useCallback((incoming: NotificationRow[]) => {
    if (!desktopEnabledRef.current || typeof window === "undefined" || !("Notification" in window)) return;
    const fresh = incoming.filter((n) => !n.readAt);
    for (const n of fresh.slice(0, 3)) {
      try {
        new Notification(n.title, { body: n.body, tag: n.id });
      } catch {
        /* ignore */
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ notifications: NotificationRow[]; unreadCount: number }>("/agency/notifications");
      const list = data.notifications ?? [];
      const count = data.unreadCount ?? list.filter((n) => !n.readAt).length;
      if (seenIdsRef.current.size === 0) {
        for (const n of list) seenIdsRef.current.add(n.id);
      } else {
        const fresh = list.filter((n) => !n.readAt && !seenIdsRef.current.has(n.id));
        if (fresh.length) pushDesktopAlerts(fresh);
        for (const n of list) seenIdsRef.current.add(n.id);
      }
      knownUnreadRef.current = count;
      setRows(list);
      setUnreadCount(count);
    } catch {
      /* sessão ou rede — silencioso no poll */
    } finally {
      setLoading(false);
    }
  }, [pushDesktopAlerts]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function markRead(id: string) {
    await apiPatch(`/agency/notifications/${id}/read`, {});
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, readAt: new Date().toISOString() } : r)));
    setUnreadCount((c) => Math.max(0, c - 1));
    knownUnreadRef.current = Math.max(0, knownUnreadRef.current - 1);
  }

  async function markAll() {
    await apiPost("/agency/notifications/mark-all-read", {});
    const now = new Date().toISOString();
    setRows((prev) => prev.map((r) => ({ ...r, readAt: r.readAt ?? now })));
    setUnreadCount(0);
    knownUnreadRef.current = 0;
  }

  async function enableDesktopAlerts() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    desktopEnabledRef.current = perm === "granted";
  }

  return (
    <div ref={rootRef} className="agency-notifications relative">
      <button
        type="button"
        className="agency-notifications__trigger btn-secondary inline-flex min-h-11 min-w-11 items-center justify-center p-2"
        aria-label={unreadCount > 0 ? `Notificações (${unreadCount} novas)` : "Notificações"}
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          void refresh();
        }}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadCount > 0 ? (
          <span className="agency-notifications__badge" aria-hidden>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="agency-notifications__panel" role="dialog" aria-label="Centro de notificações">
          <div className="agency-notifications__head">
            <h2 className="text-sm font-semibold text-[var(--app-text)]">Notificações</h2>
            <div className="flex flex-wrap items-center gap-2">
              {unreadCount > 0 ? (
                <button type="button" className="btn-ghost text-xs" onClick={() => void markAll()}>
                  Marcar todas
                </button>
              ) : null}
              <button type="button" className="btn-ghost text-xs" onClick={() => void enableDesktopAlerts()}>
                Alertas no navegador
              </button>
              <button type="button" className="btn-ghost text-xs" onClick={() => void refresh()} disabled={loading}>
                Atualizar
              </button>
            </div>
          </div>

          <ul className="agency-notifications__list">
            {rows.length === 0 ? (
              <li className="agency-notifications__empty text-sm text-[var(--app-text-muted)]">
                Nenhuma notificação por enquanto.
              </li>
            ) : (
              rows.map((n) => (
                <li
                  key={n.id}
                  className={`agency-notifications__item${n.readAt ? " is-read" : " is-unread"}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--app-text)]">{n.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--app-text-muted)]">{n.body}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--app-text-subtle)]">
                      {formatWhen(n.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {n.projectId ? (
                      <Link
                        to={`${AGENCY_APP_BASE}/projetos/${n.projectId}`}
                        className="text-xs text-emerald-400 hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        Ver projeto
                      </Link>
                    ) : n.kind === "lead" ? (
                      <Link
                        to={`${AGENCY_APP_BASE}/leads`}
                        className="text-xs text-emerald-400 hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        Ver leads
                      </Link>
                    ) : null}
                    {!n.readAt ? (
                      <button type="button" className="text-xs text-emerald-400 hover:underline" onClick={() => void markRead(n.id)}>
                        Lida
                      </button>
                    ) : null}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
