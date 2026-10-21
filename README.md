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

Escolha **uma** configuração (Settings → General → Root Directory):

| Root Directory | Output Directory (Build) | Observação |
|----------------|--------------------------|------------|
| `./` (raiz do repo) | `apps/web/dist` | Usa `vercel.json` na raiz |
| `apps/web` | `dist` | Usa `apps/web/vercel.json` |

Em **Build & Development**, deixe Framework Preset como **Other** ou deixe o `vercel.json` mandar (evite sobrescrever Output Directory com `dist` na raiz do monorepo).

Opcional: `VITE_API_URL` quando a API estiver no ar.

## Deploy da API

Hospede em Render/Railway com `DATABASE_URL`, `JWT_SECRET` forte e `WEB_ORIGIN` incluindo o domínio do site.

## Segurança

- Não publique senhas, tokens ou dumps de banco no repositório.
- Use `JWT_SECRET` longo e aleatório em produção.
- Defina credenciais de administrador **somente** via variáveis de ambiente no servidor.
- Mantenha `.env`, `*.db` e `node_modules` fora do Git (já listados no `.gitignore`).
