# Ederson Programador — Site & Portal

Monorepo com landing comercial, **portal da agência** (projetos/contrato) e **área de cursos** internos (FL + futuros), web + API.

## Requisitos

- Node.js 20+

## Desenvolvimento local

1. Copie `.env.example` para `.env` na raiz e **preencha com valores seus** (nunca commite o `.env`).
2. Instale dependências e suba o ambiente:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

- Web: http://localhost:5174  
- API: http://localhost:3333/health  

Opcional: `npm run prisma:seed` apenas se você configurou as variáveis de seed no `.env` (veja `.env.example`).

## Deploy na Vercel (front)

O `vercel.json` na raiz define install, build e **`outputDirectory: dist`**. O script `build` do web copia `apps/web/dist` → `./dist` na Vercel (`VERCEL=1`).

**Settings → General → Root Directory:** deixe **vazio** (raiz do repositório).

**Settings → Build and Deployment:** remova overrides de Framework Preset (Vite) se o log mostrar só `@ederson-agencia/web build` — ou alinhe manualmente:

- Install: `npm install --workspace=@ederson-agencia/web --workspace=@ederson-agencia/shared --include-workspace-root`
- Build: `npm run vercel-build` (ou o comando do `vercel.json`)
- Output: **`dist`** (raiz do repo; gerado automaticamente após o Vite)

**Settings → Git → Production Branch:** `main`

Se o Root Directory estiver em `apps/web`, o `apps/web/vercel.json` aplica os mesmos comandos (Output continua `dist` dentro de `apps/web`).

## Deploy da API (Render Blueprint)

O repositório inclui [`render.yaml`](render.yaml) (projeto **edersonprogramador-backend** / **production**, API + Postgres na região **Virginia**, EUA — Render ainda não tem São Paulo).

1. [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint** → conecte `EdersonProgramador/EdersonProgramador`.
2. Antes do primeiro deploy, defina no serviço **ederson-agencia-api** (secrets, não commitar):
   - `ADMIN_EMAIL` — e-mail do admin
   - `ADMIN_PASSWORD` — mesma senha do login (mín. 6; recomendado 12+)
3. Aguarde o deploy; copie a URL pública (ex.: `https://ederson-agencia-api.onrender.com`).
4. Teste: `GET https://…/health` → `{ "status": "ok" }`.
5. **Vercel** → Settings → Environment Variables:
   - `VITE_API_URL` = URL da API (sem barra no final)
   - Redeploy do front (Production).

`JWT_SECRET` e `DATABASE_URL` vêm do Blueprint. Depois do primeiro admin criado, pode setar `ADMIN_BOOTSTRAP=false` no Render.

No **plano free**, as migrations rodam no **start** do serviço (não há `preDeployCommand`).

**Local:** a API usa **PostgreSQL** (não SQLite). Suba um Postgres local ou use a URL do Render só em dev se preferir.

## Portal logado (Agência + Cursos)

Após login → **`/app`** (hub):

| Área | Rotas | Função |
|------|--------|--------|
| **Cursos** | `/app/cursos`, `/app/cursos/fl-formula-de-lancamento/…` | Trilha FL (341 aulas), progresso na conta |
| **Agência** | `/app/admin`, `/app/cliente`, `/app/freelancer` | Leads, projetos, fases do contrato |

Conteúdo FL: `packages/courses-fl/data/` (importado do portal `Desktop/FL`). Vídeos/PDFs **não** vão para o Git — configure na API:

```env
FL_MEDIA_ROOT=C:\Users\EDERSON\Desktop\FL\media
```

Compras futuras (PIX/cartão/boleto): modelo `CourseOrder` + `POST /courses/:slug/checkout` (stub 501 até integrar gateway).

**Admin:** `/app/admin/cursos` — criar/editar cursos, liberar matrícula por e-mail, marcar pedido pago (`POST /admin/courses/orders/:id/mark-paid`).

Sincronizar JSON do FL: `npm run sync:fl-data` (copia de `Desktop/FL/data`).

## Segurança

- Não publique senhas, tokens ou dumps de banco no repositório.
- Use `JWT_SECRET` longo e aleatório em produção.
- Defina credenciais de administrador **somente** via variáveis de ambiente no servidor.
- Mantenha `.env`, `*.db` e `node_modules` fora do Git (já listados no `.gitignore`).
