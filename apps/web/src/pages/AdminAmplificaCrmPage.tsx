import { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  AMPLIFICA_CRM_VIEWS,
  type AmplificaCrmView
} from "@ederson-agencia/shared";

const ADMIN = `${AGENCY_APP_BASE}/admin`;

/** Same-origin CRM on the Agency Vite host (:5174) — backend :3010 stays behind the proxy. */
const CRM_PUBLIC_BASE = "/amplifica-crm";
const CRM_EMBED_SESSION_URL = `${CRM_PUBLIC_BASE}/api/embed/session`;

function isAmplificaCrmView(value: string): value is AmplificaCrmView {
  return (AMPLIFICA_CRM_VIEWS as readonly string[]).includes(value);
}

type EmbedSession = { token: string; user: unknown };

function buildCrmSrc(view: string, session: EmbedSession | null) {
  const url = new URL(
    `${CRM_PUBLIC_BASE}/`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost:5174"
  );
  url.searchParams.set("embed", "1");
  url.searchParams.set("view", view);
  if (session) {
    url.searchParams.set("embedToken", session.token);
    url.searchParams.set("embedUser", JSON.stringify(session.user));
  }
  return url.toString();
}

export function AdminAmplificaCrmPage() {
  const { view: rawView } = useParams<{ view: string }>();
  const view = rawView && isAmplificaCrmView(rawView) ? rawView : "dashboard";
  const [session, setSession] = useState<EmbedSession | null>(null);
  const [iframeFailed, setIframeFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();

    const loadSession = async () => {
      try {
        const res = await fetch(CRM_EMBED_SESSION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
          signal: ac.signal
        });
        if (!res.ok) return;
        const data = (await res.json()) as { token?: string; user?: unknown };
        if (!data.token || !data.user || cancelled) return;
        setSession({ token: data.token, user: data.user });
      } catch {
        /* CRM login UI still available inside the frame */
      }
    };

    void loadSession();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, []);

  const src = useMemo(() => buildCrmSrc(view, session), [view, session]);

  if (rawView && !isAmplificaCrmView(rawView)) {
    return <Navigate to={`${ADMIN}/crm/dashboard`} replace />;
  }

  return (
    <div className="opus-crm-embed opus-crm-embed--full">
      {iframeFailed ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            display: "grid",
            placeItems: "center",
            background: "#fff",
            fontFamily: "Poppins, system-ui, sans-serif",
            padding: "2rem",
            textAlign: "center"
          }}
        >
          <div style={{ maxWidth: 440 }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827" }}>CRM não carregou</h2>
            <p style={{ marginTop: "0.75rem", color: "#6b7280", fontSize: "0.9rem" }}>
              Na raiz rode <code>npm run dev:crm</code> (proxy em <code>{CRM_PUBLIC_BASE}</code>) e recarregue.
            </p>
            <button
              type="button"
              className="opus-workspace-top__link"
              style={{ marginTop: "1.25rem", display: "inline-flex" }}
              onClick={() => {
                setIframeFailed(false);
                window.location.reload();
              }}
            >
              Recarregar
            </button>
          </div>
        </div>
      ) : null}

      <iframe
        key={session ? `sso-${view}` : `boot-${view}`}
        title={`Amplifica CRM — ${view}`}
        className="opus-crm-embed__frame"
        src={src}
        allow="clipboard-read; clipboard-write; microphone; camera"
        onLoad={() => setIframeFailed(false)}
        onError={() => setIframeFailed(true)}
      />
    </div>
  );
}
