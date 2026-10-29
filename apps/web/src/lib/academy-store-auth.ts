import { apiPost } from "../api";

/** Garante senha da conta de teste quando a API expõe sync (Render). Falha silenciosa. */
export async function warmAcademyStoreTestAccount(): Promise<void> {
  try {
    await apiPost("/public/academy/sync-test-aluno", {});
  } catch {
    /* rota desligada ou rede */
  }
}

export function normalizeAuthFields(email: unknown, password: unknown) {
  return {
    email: String(email ?? "")
      .trim()
      .toLowerCase(),
    password: String(password ?? "")
  };
}
