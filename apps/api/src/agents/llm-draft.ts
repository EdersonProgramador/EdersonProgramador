import { env } from "../env.js";
import type { AgentDraftContext } from "./agent-drafts.js";
import { buildStructuredAgentDraft } from "./agent-drafts.js";

/**
 * Híbrido: tenta OpenAI-compatible se OPENAI_API_KEY existir; senão gerador estruturado.
 */
export async function generateAgentDraft(ctx: AgentDraftContext): Promise<{
  draft: Record<string, unknown>;
  source: "llm" | "structured";
}> {
  const structured = buildStructuredAgentDraft(ctx);
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) return { draft: structured, source: "structured" };

  const baseUrl = (env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = env.OPENAI_MODEL || "gpt-4o-mini";

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Você é um agente especialista de agência de marketing/branding. Responda só JSON válido, enriquecendo o rascunho estruturado sem inventar preços fora do pack."
          },
          {
            role: "user",
            content: JSON.stringify({
              instruction: "Refine e complete o draft mantendo deliverableKind e chaves principais.",
              context: ctx,
              draft: structured
            })
          }
        ]
      })
    });
    if (!res.ok) return { draft: structured, source: "structured" };
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return { draft: structured, source: "structured" };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      draft: { ...structured, ...parsed, deliverableKind: structured.deliverableKind },
      source: "llm"
    };
  } catch {
    return { draft: structured, source: "structured" };
  }
}
