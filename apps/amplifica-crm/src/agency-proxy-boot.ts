/**
 * When the CRM is loaded under the Agency Admin origin
 * (http://localhost:5174/amplifica-crm/...), absolute `/api` and `/env-config`
 * must be rewritten to `/amplifica-crm/...` so they hit the Vite proxy → CRM :3010.
 */
const PUBLIC_PREFIX = "/amplifica-crm";

function underAgencyProxy(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname || "";
  return path === PUBLIC_PREFIX || path.startsWith(`${PUBLIC_PREFIX}/`);
}

export function installAgencyProxyBoot() {
  if (!underAgencyProxy()) return;

  const prefix = PUBLIC_PREFIX;
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
        if (u.origin === window.location.origin && (u.pathname.startsWith("/api") || u.pathname === "/env-config.js")) {
          const next = new Request(`${prefix}${u.pathname}${u.search}`, input);
          return originalFetch(next, init);
        }
      } catch {
        /* fall through */
      }
    }
    return originalFetch(input, init);
  };

  // Socket.IO default path
  (window as unknown as { __CRM_SOCKET_PATH?: string }).__CRM_SOCKET_PATH = `${prefix}/socket.io`;
}
