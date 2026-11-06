/** Workspace — editor de código do pilar Desenvolvimento. */

import { migrateSnapshotToV2 } from "./development-code-studio-fs.js";

export const DEV_CODE_STUDIO_FIELD_ID = "product:dev:code-studio";

export type DevCodeStudioFolder = {
  id: string;
  path: string;
};

export type DevCodeStudioFile = {
  id: string;
  path: string;
  language: string;
  content: string;
};

export type DevCodeStudioSnapshot = {
  version: 2;
  openFileId: string;
  folders: DevCodeStudioFolder[];
  files: DevCodeStudioFile[];
};

export function defaultDevCodeStudioSnapshot(): DevCodeStudioSnapshot {
  return {
    version: 2,
    openFileId: "main-tsx",
    folders: [
      { id: "folder-src", path: "src" },
      { id: "folder-api--routes", path: "api/routes" },
      { id: "folder-prisma", path: "prisma" },
      { id: "folder-webhooks", path: "webhooks" }
    ],
    files: [
      {
        id: "main-tsx",
        path: "src/App.tsx",
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
        path: "api/routes/leads.ts",
        language: "typescript",
        content: `import type { FastifyInstance } from "fastify";

export async function registerLeadRoutes(app: FastifyInstance) {
  app.post("/api/leads/capture", async (req, reply) => {
    const body = req.body as { email?: string; source?: string };
    if (!body.email?.includes("@")) {
      return reply.code(400).send({ error: "E-mail inválido" });
    }
    return reply.send({ ok: true });
  });
}
`
      },
      {
        id: "schema",
        path: "prisma/schema.prisma",
        language: "sql",
        content: `model Lead {
  id        String   @id @default(cuid())
  email     String   @unique
  source    String
  createdAt DateTime @default(now())
}
`
      },
      {
        id: "webhook",
        path: "webhooks/hotmart.ts",
        language: "typescript",
        content: `export function parseHotmartWebhook(payload: unknown) {
  return payload;
}
`
      },
      {
        id: "env",
        path: ".env.example",
        language: "plaintext",
        content: `DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379
`
      }
    ]
  };
}

export function parseDevCodeStudioSnapshot(raw: unknown): DevCodeStudioSnapshot | null {
  if (!raw || typeof raw !== "string" || !raw.trim()) return null;
  try {
    const migrated = migrateSnapshotToV2(JSON.parse(raw));
    return migrated;
  } catch {
    return null;
  }
}

export function serializeDevCodeStudioSnapshot(snapshot: DevCodeStudioSnapshot): string {
  return JSON.stringify(snapshot);
}
