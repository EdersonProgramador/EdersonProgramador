import { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  AGENCY_CRM_BASE,
  AMPLIFICA_CRM_VIEWS,
  type AmplificaCrmView
} from "@ederson-agencia/shared";

const ADMIN = `${AGENCY_APP_BASE}/admin`;

function isAmplificaCrmView(value: string): value is AmplificaCrmView {
  return (AMPLIFICA_CRM_VIEWS as readonly string[]).includes(value);
}

/**
 * Entra no CRM em página cheia (sem iframe):
 * `/agencia/admin/?view=…` é servido pelo app CRM via proxy Vite.
 */
export function AdminAmplificaCrmPage() {
  const { view: rawView } = useParams<{ view: string }>();
  const [searchParams] = useSearchParams();
  const viewFromQuery = searchParams.get("view");
  const view =
    (rawView && isAmplificaCrmView(rawView) && rawView) ||
    (viewFromQuery && isAmplificaCrmView(viewFromQuery) && viewFromQuery) ||
    "dashboard";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const enter = async () => {
      const target = new URL(AGENCY_CRM_BASE + "/", window.location.origin);
      target.searchParams.set("view", view);

      try {
        const res = await Promise.race([
          fetch(`${AGENCY_CRM_BASE}/api/embed/session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}"
          }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000))
        ]);

        if (!res || !res.ok || !res.headers.get("content-type")?.includes("application/json")) {
          throw new Error("O serviço do CRM não está conectado a este domínio.");
        }

        const data = (await res.json()) as { token?: string; user?: unknown };
        if (!data.token || !data.user) {
          throw new Error("O serviço do CRM não retornou uma sessão válida.");
        }
        target.searchParams.set("embedToken", data.token);
        target.searchParams.set("embedUser", JSON.stringify(data.user));
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Não foi possível conectar ao serviço do CRM."
          );
        }
        return;
      }

      if (!cancelled) {
        window.location.replace(target.pathname + target.search);
      }
    };

    void enter();

    return () => {
      cancelled = true;
    };
  }, [view]);

  if (rawView && !isAmplificaCrmView(rawView)) {
    return <Navigate to={`${ADMIN}/crm/dashboard`} replace />;
  }

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "Poppins, system-ui, sans-serif",
        color: "#6b7280",
        padding: "2rem",
        textAlign: "center"
      }}
    >
      <div>
        <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>
          {error ?? "Abrindo sistema da agência…"}
        </p>
        {error ? (
          <button
            type="button"
            className="opus-workspace-top__link"
            style={{ marginTop: "1rem", display: "inline-flex" }}
            onClick={() => window.location.reload()}
          >
            Tentar de novo
          </button>
        ) : null}
      </div>
    </div>
  );
}
