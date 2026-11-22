# Amplifica CRM — embed no Agency Admin

Este app é o Amplifica CRM embutido em `/agencia/admin/crm/:view`.

## Dev

```bash
# na raiz do monorepo
npm run dev:crm
# ou com web + api + crm
npm run dev
```

Abre em `http://localhost:3010` (porta padrão do monorepo; evita conflito com outras instâncias em `:3000`).
O admin embute com `?embed=1&view=leads`.

Override: `VITE_AMPLIFICA_CRM_URL` no web e `PORT` no CRM.

## Env

Copie `.env.example` → `.env` (já pode existir). `JWT_SECRET` é obrigatório.

## Nota

Não faz parte do npm workspaces do monorepo (evita hoisting). Dependências ficam em `apps/amplifica-crm/node_modules`.
