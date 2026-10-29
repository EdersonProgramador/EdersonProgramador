import type { AuthContext } from "@ederson-agencia/shared";
import { inferAuthContextFromPath, loginPathForContext } from "@ederson-agencia/shared";

export type SessionExpiredDetail = {
  realm: AuthContext | "unknown";
  returnPath: string;
};

type SessionExpiredHandler = (detail: SessionExpiredDetail) => void;

let handler: SessionExpiredHandler | null = null;
let handling = false;

export function setSessionExpiredHandler(next: SessionExpiredHandler | null) {
  handler = next;
}

export function notifySessionExpired(realm: AuthContext | "unknown", returnPath: string) {
  if (!handler || handling) return;
  handling = true;
  try {
    handler({ realm, returnPath });
  } finally {
    window.setTimeout(() => {
      handling = false;
    }, 500);
  }
}

export function realmForSessionExpiry(
  realm: AuthContext | "unknown",
  returnPath: string
): AuthContext {
  if (realm === "agency" || realm === "academy") return realm;
  return inferAuthContextFromPath(returnPath.split("?")[0] ?? returnPath) ?? "agency";
}

export function loginPathWithReturn(context: AuthContext, returnPath: string) {
  return { pathname: loginPathForContext(context), state: { from: returnPath } as const };
}
