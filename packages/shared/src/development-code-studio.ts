/** Workspace — editor de código do pilar Desenvolvimento. */

export const DEV_CODE_STUDIO_FIELD_ID = "product:dev:code-studio";

export type DevCodeStudioFile = {
  id: string;
  name: string;
  language: string;
  content: string;
};

export type DevCodeStudioSnapshot = {
  version: 1;
  openFileId: string;
  files: DevCodeStudioFile[];
};

export function defaultDevCodeStudioSnapshot(): DevCodeStudioSnapshot {
  return {
    version: 1,
    openFileId: "main-tsx",
    files: [
      {
        id: "main-tsx",
        name: "App.tsx",
        language: "typescript",
        content: `import { useState } from "react";

/** Entrada da LP / checkout do lançamento */
export function LaunchApp() {
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/leads/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "ppl" })
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
      />
      <button type="submit">Quero participar</button>
    </form>
  );
}
`
      },
      {
        id: "api-route",
        name: "routes/leads.ts",
        language: "typescript",
        content: `import type { FastifyInstance } from "fastify";

export async function registerLeadRoutes(app: FastifyInstance) {
  app.post("/api/leads/capture", async (req, reply) => {
    const body = req.body as { email?: string; source?: string };
    if (!body.email?.includes("@")) {
      return reply.code(400).send({ error: "E-mail inválido" });
    }
    // persist + webhook Leadlovers / ActiveCampaign
    return reply.send({ ok: true });
  });
}
`
      },
      {
        id: "schema",
        name: "schema.prisma",
        language: "sql",
        content: `// Modelo mínimo — funil + pedidos do lançamento

model Lead {
  id        String   @id @default(cuid())
  email     String   @unique
  source    String
  createdAt DateTime @default(now())
}

model Order {
  id         String   @id @default(cuid())
  gateway    String
  externalId String
  status     String
  createdAt  DateTime @default(now())
}
`
      },
      {
        id: "webhook",
        name: "webhooks/hotmart.ts",
        language: "typescript",
        content: `/** Valida assinatura e normaliza payload Hotmart → CRM */
export function parseHotmartWebhook(payload: unknown) {
  // TODO: HMAC + map plan / offer / buyer email
  return payload;
}
`
      },
      {
        id: "env",
        name: ".env.example",
        language: "plaintext",
        content: `DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379
RESEND_API_KEY=
HOTMART_WEBHOOK_SECRET=
`
      }
    ]
  };
}

export function parseDevCodeStudioSnapshot(raw: unknown): DevCodeStudioSnapshot | null {
  if (!raw || typeof raw !== "string" || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as DevCodeStudioSnapshot;
    if (parsed.version !== 1 || !Array.isArray(parsed.files) || parsed.files.length === 0) return null;
    const openFileId = parsed.files.some((f) => f.id === parsed.openFileId)
      ? parsed.openFileId
      : parsed.files[0].id;
    return { ...parsed, openFileId };
  } catch {
    return null;
  }
}

export function serializeDevCodeStudioSnapshot(snapshot: DevCodeStudioSnapshot): string {
  return JSON.stringify(snapshot);
}
