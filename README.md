# Ederson Agência

Monorepo da agência freelancer **Ederson Programador**, com página de vendas e portal autenticado (cliente, freelancer e admin).

Stack alinhada ao **ATLLY / AppTreino**:

- **Web:** React 18, Vite, Tailwind CSS, React Router, Zustand, Axios, Zod
- **API:** Fastify, Prisma, JWT, CORS, rate limit
- **Shared:** pacote TypeScript com contrato padrão e tipos

O **modelo de contrato** (valores, fases, multas, hora técnica) vem do arquivo `MODELO_CONTRATO.docx` e está codificado em `@ederson-agencia/shared` (`CONTRACT_DEFAULTS`).

## Pré-requisitos

- Node.js 20+

## Configuração

```bash
cd ederson-agencia
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

- Landing: http://localhost:5174  
- API: http://localhost:3333/health  

## Contas demo (seed)

| Papel       | E-mail                 | Senha        |
|------------|------------------------|--------------|
| Admin      | admin@ederson.dev      | admin123456  |
| Cliente    | cliente@exemplo.dev    | cliente123   |
| Freelancer | freelancer@exemplo.dev | freela123    |

## Fluxo

1. Visitante preenche **Solicitar proposta** na landing → lead no admin.
2. Admin converte lead em **projeto** (cliente precisa ter conta).
3. Projeto nasce com **4 fases** do contrato (gráfico, lógica, conteúdo, deploy).
4. Cliente / freelancer / admin atualizam status das fases no painel.

## Deploy na Vercel (`edersonprogramador.com.br`)

1. Importe o repositório na Vercel (root do monorepo — o `vercel.json` na raiz já aponta para `apps/web/dist`).
2. Domínio customizado: **edersonprogramador.com.br** (e opcional `www` → redirect).
3. A landing e o portfólio funcionam **sem API** (dados em `@ederson-agencia/shared`).
4. Para **login** e **formulário de leads** em produção, hospede a API (Render/Railway/etc.) e configure na Vercel:
   - `VITE_API_URL` = URL pública da API
   - Na API: `WEB_ORIGIN` incluindo `https://edersonprogramador.com.br`

## Deploy da API (Render ou similar)

- Bind `0.0.0.0:$PORT`, `DATABASE_URL` PostgreSQL recomendado.
- Defina `JWT_SECRET`, `WEB_ORIGIN` e variáveis de admin.
