import { ACADEMY_APP_BASE, loginPathForContext } from "@ederson-agencia/shared";
import { env } from "../env.js";

export type AcademyAccessEmailPayload = {
  to: string;
  name: string;
  courseTitle: string;
  loginUrl: string;
  isNewAccount: boolean;
  temporaryPassword?: string;
};

function buildHtml(payload: AcademyAccessEmailPayload) {
  const credBlock = payload.isNewAccount && payload.temporaryPassword
    ? `<p><strong>Senha provisória:</strong> ${payload.temporaryPassword}<br/>Altere após o primeiro acesso.</p>`
    : `<p>Use a senha da sua conta existente. Se esqueceu, fale com o suporte.</p>`;

  return `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
      <h1 style="font-size:1.25rem">Bem-vindo(a) à Academia Ederson Programador</h1>
      <p>Olá, ${payload.name}!</p>
      <p>Sua matrícula em <strong>${payload.courseTitle}</strong> foi confirmada.</p>
      ${credBlock}
      <p><a href="${payload.loginUrl}">Entrar na Academia</a></p>
      <p style="font-size:0.875rem;color:#555">Depois do login, acesse <strong>Meus cursos</strong> para iniciar a trilha.</p>
    </div>
  `.trim();
}

export async function sendAcademyAccessEmail(
  payload: AcademyAccessEmailPayload,
  log: { info: (obj: unknown, msg?: string) => void; warn: (obj: unknown, msg?: string) => void }
): Promise<{ sent: boolean; devPreview?: AcademyAccessEmailPayload }> {
  const from = env.MAIL_FROM;
  const apiKey = env.RESEND_API_KEY;

  if (!apiKey || !from) {
    log.info({ to: payload.to, loginUrl: payload.loginUrl, isNew: payload.isNewAccount }, "E-mail de acesso (MAIL_FROM/RESEND não configurados)");
    return { sent: false, devPreview: payload };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: `Acesso ao curso: ${payload.courseTitle}`,
      html: buildHtml(payload)
    })
  });

  if (!res.ok) {
    const text = await res.text();
    log.warn({ status: res.status, text }, "Falha ao enviar e-mail Resend");
    return { sent: false, devPreview: payload };
  }

  return { sent: true };
}

export function academyLoginUrl(): string {
  const origin = env.WEB_ORIGIN.split(",")[0]?.trim() || "http://localhost:5174";
  return `${origin}${loginPathForContext("academy")}`;
}

export function academyCourseUrl(slug: string): string {
  const origin = env.WEB_ORIGIN.split(",")[0]?.trim() || "http://localhost:5174";
  return `${origin}${ACADEMY_APP_BASE}/cursos/${slug}`;
}
