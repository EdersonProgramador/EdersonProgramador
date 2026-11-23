/**
 * Quando o CRM roda sob o Vite da agência
 * (http://localhost:5174/agencia/admin/...), `/api` e `/env-config`
 * precisam do prefixo do app para bater no proxy → CRM :3010.
 */
function resolvePublicPrefix(): string | null {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname || "";
  if (path === "/agencia/admin" || path.startsWith("/agencia/admin/")) return "/agencia/admin";
  if (path === "/amplifica-crm" || path.startsWith("/amplifica-crm/")) return "/amplifica-crm";
  return null;
}

export function installAgencyProxyBoot() {
  const prefix = resolvePublicPrefix();
  if (!prefix) return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string") {
      if (input.startsWith("/api") || input === "/env-config.js" || input === "/sw.js") {
        return originalFetch(`${prefix}${input}`, init);
      }
      return originalFetch(input, init);
    }
    if (input instanceof URL) {
      const path = input.pathname;
      if (path.startsWith("/api") || path === "/env-config.js" || path === "/sw.js") {
        const next = new URL(input);
        next.pathname = `${prefix}${path}`;
        return originalFetch(next, init);
      }
    }
    if (typeof Request !== "undefined" && input instanceof Request) {
      try {
        const u = new URL(input.url, window.location.origin);
        if (
          u.origin === window.location.origin &&
          (u.pathname.startsWith("/api") || u.pathname === "/env-config.js")
        ) {
          const next = new Request(`${prefix}${u.pathname}${u.search}`, input);
          return originalFetch(next, init);
        }
      } catch {
        /* fall through */
      }
    }
    return originalFetch(input, init);
  };

  (window as unknown as { __CRM_SOCKET_PATH?: string }).__CRM_SOCKET_PATH = `${prefix}/socket.io`;
}
