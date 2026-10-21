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

## Deploy

- **Front (Vercel):** importe o repositório; o `vercel.json` na raiz aponta para `apps/web/dist`.
- **API:** hospede separadamente (Render, Railway, etc.), com `DATABASE_URL`, `JWT_SECRET` forte e `WEB_ORIGIN` do domínio do site.
- Configure `VITE_API_URL` na Vercel quando a API estiver pública.

## Segurança

- Não publique senhas, tokens ou dumps de banco no repositório.
- Use `JWT_SECRET` longo e aleatório em produção.
- Defina credenciais de administrador **somente** via variáveis de ambiente no servidor.
- Mantenha `.env`, `*.db` e `node_modules` fora do Git (já listados no `.gitignore`).
