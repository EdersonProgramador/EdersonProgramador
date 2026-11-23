/** Gera ID estável para salas de videochamada internas (Amplifica CRM). */
export function createMeetingRoomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `ea-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  return `ea-${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36).slice(-4)}`;
}

/** URL completa para convidar participantes (respeita base `/agencia/admin/`). */
export function meetingInviteUrl(roomId: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set("roomId", roomId);
  return url.toString();
}

export function setMeetingRoomInUrl(roomId: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set("roomId", roomId);
  window.history.pushState({}, "", `${url.pathname}${url.search}`);
}

export function clearMeetingRoomFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete("roomId");
  window.history.pushState({}, "", `${url.pathname}${url.search}`);
}