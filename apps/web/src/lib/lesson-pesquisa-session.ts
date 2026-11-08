import type { LessonPesquisaTab } from "./lesson-google-pesquisa";

export type LessonPesquisaSessionState = {
  draftQuery: string;
  activeQuery: string;
  tab: LessonPesquisaTab;
  iframeGeneration: number;
};

const sessionKey = (lessonSlug: string) => `academy-lesson-pesquisa:${lessonSlug}`;
const handoffKey = (lessonSlug: string) => `academy-pesquisa-handoff-fichamento:${lessonSlug}`;

export function loadLessonPesquisaSession(lessonSlug: string): LessonPesquisaSessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(sessionKey(lessonSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LessonPesquisaSessionState;
    if (!parsed || typeof parsed.activeQuery !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveLessonPesquisaSession(lessonSlug: string, state: LessonPesquisaSessionState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(sessionKey(lessonSlug), JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

/** Ao sair da pesquisa em tela cheia para o fichamento, abrir aba Pesquisa com o mesmo estado. */
export function markPesquisaHandoffToFichamento(lessonSlug: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(handoffKey(lessonSlug), "1");
  } catch {
    /* ignore */
  }
}

export function consumePesquisaHandoffToFichamento(lessonSlug: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = handoffKey(lessonSlug);
    const shouldOpen = sessionStorage.getItem(key) === "1";
    if (shouldOpen) sessionStorage.removeItem(key);
    return shouldOpen;
  } catch {
    return false;
  }
}
