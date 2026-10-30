import { useEffect, useState } from "react";
import { apiPatch, apiPost } from "../../api";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export function ClientNotificationsBanner({
  initial,
  unreadCount
}: {
  initial: NotificationRow[];
  unreadCount: number;
}) {
  const [rows, setRows] = useState(initial);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  if (rows.length === 0) return null;

  async function markRead(id: string) {
    await apiPatch(`/agency/notifications/${id}/read`, {});
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, readAt: new Date().toISOString() } : r)));
  }

  async function markAll() {
    await apiPost("/agency/notifications/mark-all-read", {});
    setRows((prev) => prev.map((r) => ({ ...r, readAt: r.readAt ?? new Date().toISOString() })));
  }

  const unread = rows.filter((r) => !r.readAt);

  return (
    <section className="panel space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--app-text)]">
          Notificações {unreadCount > 0 ? `(${unreadCount} novas)` : ""}
        </h2>
        {unread.length ? (
          <button type="button" className="btn-ghost text-xs" onClick={() => void markAll()}>
            Marcar todas como lidas
          </button>
        ) : null}
      </div>
      <ul className="space-y-2">
        {rows.slice(0, 5).map((n) => (
          <li
            key={n.id}
            className={`rounded-lg border px-3 py-2 text-sm ${
              n.readAt ? "border-[var(--app-border)] opacity-70" : "border-sky-500/40 bg-sky-500/5"
            }`}
          >
            <p className="font-medium">{n.title}</p>
            <p className="text-[var(--app-text-muted)]">{n.body}</p>
            {!n.readAt ? (
              <button type="button" className="mt-1 text-xs text-brand-primary hover:underline" onClick={() => void markRead(n.id)}>
                Marcar como lida
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
