# Ederson Programador — Site & Portal

Monorepo com landing comercial e portal autenticado (web + API).

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

O `vercel.json` na raiz define install, build e **`outputDirectory: apps/web/dist`** (onde o Vite grava o artefato).

**Settings → General → Root Directory:** deixe **vazio** (raiz do repositório).

**Settings → Build and Deployment:** remova overrides de Framework Preset (Vite) se o log mostrar só `@ederson-agencia/web build` — ou alinhe manualmente:

- Install: `npm install --workspace=@ederson-agencia/web --workspace=@ederson-agencia/shared --include-workspace-root`
- Build: `npm run vercel-build` (ou o comando do `vercel.json`)
- Output: **`apps/web/dist`** (não `dist` na raiz)

**Settings → Git → Production Branch:** `main`

Se o Root Directory estiver em `apps/web`, o `apps/web/vercel.json` aplica os mesmos comandos (Output continua `dist` dentro de `apps/web`).

Opcional: `VITE_API_URL` quando a API estiver no ar.

## Deploy da API

Hospede em Render/Railway com `DATABASE_URL`, `JWT_SECRET` forte e `WEB_ORIGIN` incluindo o domínio do site.

## Segurança

- Não publique senhas, tokens ou dumps de banco no repositório.
- Use `JWT_SECRET` longo e aleatório em produção.
- Defina credenciais de administrador **somente** via variáveis de ambiente no servidor.
- Mantenha `.env`, `*.db` e `node_modules` fora do Git (já listados no `.gitignore`).
