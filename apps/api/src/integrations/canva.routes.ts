import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  BRANDING_PALETTE_FIELD_ID,
  buildCanvaAutofillData,
  CANVA_INTEGRATION_FIELD_IDS,
  formatPaletteForCanvaClipboard,
  parseBrandingPaletteField,
  readCanvaIntegrationStatus
} from "@ederson-agencia/shared";
import { requireRole } from "../auth.js";
import { env } from "../env.js";
import {
  buildCanvaAuthorizeUrl,
  canvaDisconnectFields,
  canvaEnvConfig,
  canvaTokenFieldsFromOAuth,
  exchangeCanvaAuthorizationCode,
  fetchCanvaUserProfile,
  createCanvaAutofillJob,
  generatePkce,
  getValidCanvaAccessToken,
  pollCanvaAutofillJob,
  signCanvaOAuthState,
  verifyCanvaOAuthState
} from "./canva-connect.js";
import {
  loadProjectWorkspace,
  patchProjectWorkspaceField,
  persistProjectWorkspace
} from "../agency/project-workspace-persist.js";
import type { AuthUser } from "@ederson-agencia/shared";
import { prisma } from "../prisma.js";

async function assertProjectAccess(user: AuthUser, projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
  if (user.role === "ADMIN") return project;
  if (user.role === "FREELANCER" && project.freelancerId === user.id) return project;
  if (user.role === "CLIENT" && project.clientId === user.id) return project;
  throw Object.assign(new Error("Acesso negado."), { statusCode: 403 });
}

async function mergeWorkspaceFields(
  projectId: string,
  entries: Record<string, string | null>
): Promise<void> {
  const row = await prisma.project.findUnique({
    where: { id: projectId },
    select: { projectWorkspaceJson: true, brandingWorkspaceJson: true, launchOpCheckedJson: true }
  });
  if (!row) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
  const doc = loadProjectWorkspace(row);
  for (const [key, val] of Object.entries(entries)) {
    if (val === null || val === "") delete doc.fields[key];
    else doc.fields[key] = val;
  }
  await persistProjectWorkspace(projectId, doc);
}

export async function registerCanvaRoutes(app: FastifyInstance): Promise<void> {
  app.get("/agency/projects/:id/canva/status", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    await assertProjectAccess(request.agencyUser!, params.id);
    const cfg = canvaEnvConfig();
    const row = await prisma.project.findUnique({
      where: { id: params.id },
      select: { projectWorkspaceJson: true, brandingWorkspaceJson: true, launchOpCheckedJson: true }
    });
    if (!row) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
    const workspace = loadProjectWorkspace(row);
    const status = readCanvaIntegrationStatus(workspace.fields, Boolean(cfg));
    return { status, redirectUri: cfg?.redirectUri };
  });

  app.post("/agency/projects/:id/canva/authorize", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const user = request.agencyUser!;
    await assertProjectAccess(user, params.id);
    const cfg = canvaEnvConfig();
    if (!cfg) {
      throw Object.assign(new Error("Configure CANVA_CLIENT_ID e CANVA_CLIENT_SECRET na API."), { statusCode: 503 });
    }
    const { verifier, challenge } = generatePkce();
    await patchProjectWorkspaceField(params.id, CANVA_INTEGRATION_FIELD_IDS.pkceVerifier, verifier);

    const state = signCanvaOAuthState({
      projectId: params.id,
      userId: user.id,
      exp: Date.now() + 15 * 60_000
    });
    const authorizeUrl = buildCanvaAuthorizeUrl(cfg, challenge, state);
    return { authorizeUrl };
  });

  app.post("/agency/projects/:id/canva/disconnect", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    await assertProjectAccess(request.agencyUser!, params.id);
    const clears = Object.fromEntries(canvaDisconnectFields().map((k) => [k, null]));
    await mergeWorkspaceFields(params.id, clears);
    return { ok: true };
  });

  app.post("/agency/projects/:id/canva/sync-brand", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    await assertProjectAccess(request.agencyUser!, params.id);
    const cfg = canvaEnvConfig();
    if (!cfg) {
      throw Object.assign(new Error("Canva Connect não configurado no servidor."), { statusCode: 503 });
    }
    const row = await prisma.project.findUnique({
      where: { id: params.id },
      select: { projectWorkspaceJson: true, brandingWorkspaceJson: true, launchOpCheckedJson: true }
    });
    if (!row) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
    const workspace = loadProjectWorkspace(row);
    const token = await getValidCanvaAccessToken(cfg, workspace.fields);
    if (!token) {
      throw Object.assign(new Error("Conecte a conta Canva antes de sincronizar."), { statusCode: 400 });
    }
    const palette = parseBrandingPaletteField(workspace.fields[BRANDING_PALETTE_FIELD_ID]);
    const clipboard = formatPaletteForCanvaClipboard(palette.swatches.filter((s) => s.hex.trim()));
    const profile = await fetchCanvaUserProfile(token);

    if (token !== workspace.fields[CANVA_INTEGRATION_FIELD_IDS.accessToken]) {
      const expiresAt = new Date(Date.now() + 4 * 3600_000).toISOString();
      await mergeWorkspaceFields(params.id, {
        [CANVA_INTEGRATION_FIELD_IDS.accessToken]: token,
        [CANVA_INTEGRATION_FIELD_IDS.expiresAt]: expiresAt
      });
    }

    return {
      ok: true,
      profileName: profile?.display_name,
      paletteClipboard: clipboard,
      message:
        "API pública do Canva não expõe gravação direta do Brand Kit para todas as contas. Use a paleta copiada no Brand Kit ou Autofill com brand templates.",
      docs: "https://www.canva.dev/docs/connect/"
    };
  });

  app.post("/agency/projects/:id/canva/autofill", async (request) => {
    requireRole(request.agencyUser ?? null, ["ADMIN"]);
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z
      .object({
        brandTemplateId: z.string().min(3).max(120).optional(),
        title: z.string().min(1).max(200).optional()
      })
      .parse(request.body ?? {});
    await assertProjectAccess(request.agencyUser!, params.id);
    const cfg = canvaEnvConfig();
    if (!cfg) {
      throw Object.assign(new Error("Canva Connect não configurado no servidor."), { statusCode: 503 });
    }
    const row = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        title: true,
        projectWorkspaceJson: true,
        brandingWorkspaceJson: true,
        launchOpCheckedJson: true
      }
    });
    if (!row) throw Object.assign(new Error("Projeto não encontrado."), { statusCode: 404 });
    const workspace = loadProjectWorkspace(row);
    const token = await getValidCanvaAccessToken(cfg, workspace.fields);
    if (!token) {
      throw Object.assign(new Error("Conecte a conta Canva antes do autofill."), { statusCode: 400 });
    }
    const storedTemplate = workspace.fields[CANVA_INTEGRATION_FIELD_IDS.brandTemplateId];
    const brandTemplateId =
      body.brandTemplateId?.trim() ||
      (typeof storedTemplate === "string" ? storedTemplate.trim() : "");
    if (!brandTemplateId) {
      throw Object.assign(new Error("Informe o brand template ID (Canva) no painel ou no body."), { statusCode: 400 });
    }
    const data = buildCanvaAutofillData(workspace.fields);
    if (Object.keys(data).length === 0) {
      throw Object.assign(new Error("Workspace sem textos para autofill — preencha Branding/Produto."), { statusCode: 400 });
    }
    const title = body.title?.trim() || `${row.title} · Autofill`;
    const { jobId } = await createCanvaAutofillJob(token, brandTemplateId, title, data);
    const result = await pollCanvaAutofillJob(token, jobId);
    const designUrl = result.editUrl ?? result.viewUrl ?? "";
    await mergeWorkspaceFields(params.id, {
      [CANVA_INTEGRATION_FIELD_IDS.brandTemplateId]: brandTemplateId,
      [CANVA_INTEGRATION_FIELD_IDS.lastAutofillJobId]: jobId,
      [CANVA_INTEGRATION_FIELD_IDS.lastDesignUrl]: designUrl || null,
      [CANVA_INTEGRATION_FIELD_IDS.lastAutofillAt]: new Date().toISOString()
    });
    if (token !== workspace.fields[CANVA_INTEGRATION_FIELD_IDS.accessToken]) {
      await mergeWorkspaceFields(params.id, {
        [CANVA_INTEGRATION_FIELD_IDS.accessToken]: token,
        [CANVA_INTEGRATION_FIELD_IDS.expiresAt]: new Date(Date.now() + 4 * 3600_000).toISOString()
      });
    }
    return {
      ok: true,
      jobId,
      designId: result.designId,
      editUrl: result.editUrl,
      viewUrl: result.viewUrl,
      autofillKeys: Object.keys(data)
    };
  });

  /** Callback OAuth (sem Bearer) — valida `state` assinado. */
  app.get("/agency/canva/oauth/callback", async (request, reply) => {
    const query = z
      .object({
        code: z.string().optional(),
        state: z.string().optional(),
        error: z.string().optional()
      })
      .parse(request.query);

    const failRedirect = `${env.WEB_ORIGIN.replace(/\/$/, "")}/agencia/admin/operacao/branding/brandbook?canva=error`;

    if (query.error || !query.code || !query.state) {
      return reply.redirect(failRedirect);
    }

    const payload = verifyCanvaOAuthState(query.state);
    if (!payload) {
      return reply.redirect(failRedirect);
    }

    const cfg = canvaEnvConfig();
    if (!cfg) {
      return reply.redirect(failRedirect);
    }

    const row = await prisma.project.findUnique({
      where: { id: payload.projectId },
      select: { projectWorkspaceJson: true, brandingWorkspaceJson: true, launchOpCheckedJson: true }
    });
    if (!row) {
      return reply.redirect(failRedirect);
    }
    const workspace = loadProjectWorkspace(row);
    const verifierRaw = workspace.fields[CANVA_INTEGRATION_FIELD_IDS.pkceVerifier];
    const verifier = typeof verifierRaw === "string" ? verifierRaw.trim() : "";
    if (!verifier) {
      return reply.redirect(failRedirect);
    }

    try {
      const token = await exchangeCanvaAuthorizationCode(cfg, query.code, verifier);
      const profile = await fetchCanvaUserProfile(token.access_token);
      const tokenFields = canvaTokenFieldsFromOAuth(token, profile?.display_name);
      await mergeWorkspaceFields(payload.projectId, {
        ...tokenFields,
        [CANVA_INTEGRATION_FIELD_IDS.pkceVerifier]: null
      } as Record<string, string | null>);
    } catch {
      return reply.redirect(failRedirect);
    }

    const ok = `${env.WEB_ORIGIN.replace(/\/$/, "")}/agencia/admin/operacao/branding/brandbook?project=${encodeURIComponent(payload.projectId)}&canva=connected`;
    return reply.redirect(ok);
  });
}
