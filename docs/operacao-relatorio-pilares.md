# Relatório — Operação (Admin Agência)

Documento de referência dos quatro pilares da **Operação Ederson Programador**: Branding, Marketing, Desenvolvimento e Fórmula de Lançamento.

- **Base URL admin:** `/agencia/admin/`
- **Projeto ativo:** use `?project=<id>` nas telas da operação para sincronizar workspace e checklist.
- **Dev local (web):** `npm run dev --workspace @ederson-agencia/web` → **http://localhost:5174** (porta padrão do Vite).
- **Stack completa:** `npm run dev` na raiz (web + API).
- **Proxy dev:** por padrão o Vite aponta para a API no **Render**. Se aparecer `Route GET:.../workspace not found`, o front faz **fallback** para `branding-workspace` + `launch-operation`. Para API local com todas as rotas: `npm run dev:local-api --workspace @ederson-agencia/web` (requer Postgres + migrations).

---

## Arquitetura comum

| Peça | Descrição |
|------|-----------|
| Sidebar | Seções em caixa alta + itens (padrão Leadlovers), cor por pilar |
| Config | `packages/shared/src/*-operation-nav.ts` |
| UI | `PillarSidebarNav.tsx`, `agency-admin.css` |
| Workspace | `GET/PATCH /agency/projects/:id/workspace` — campos + checklist |
| Resumo | Progresso por pilar (`branding`, `marketing`, `development`, `formula`) |
| Legado | Aliases mantêm URLs antigas e destaque correto no menu |

---

## 1. Branding

**Cor:** violeta · **Foco:** imersão → identidade → rollout da marca.

### Menu

| Seção | Item | Rota |
|-------|------|------|
| Analisar | Estatística | `operacao/branding/estatistica` |
| Pesquisar | Diagnóstico | `operacao/branding/diagnostico` |
| Posicionar | Plataforma de marca | `operacao/branding/plataforma` |
| Criar | Identidade | `operacao/branding/identidade` |
| Aplicar | Implementação | `operacao/branding/implementacao` |

### Telas

- **Estatística:** progresso do pilar + projeções (`AdminBrandingHubPage`).
- **Etapas 1–4:** campos ricos (texto, mídia, arquivos, repeaters), upload, progresso por etapa (`AdminBrandingEtapaPage`).

### Dados

- IDs `branding:<etapa>:<secao>:<campo>` no workspace.
- Definições: `packages/shared/src/branding-workspace.ts`.

---

## 2. Marketing

**Cor:** rose · **Foco:** captar, nutrir, integrar (Leadlovers / gateways / LP).

### Menu

| Seção | Itens |
|-------|--------|
| Analisar | Estatística |
| Nutrir | Sequência, Automações, Histórico |
| Capturar | Páginas, Formulários, Pop-ups, Contatos |
| Configurações | Contas de envio, Ajustes do projeto |

### Hub (`AdminMarketingHubPage`)

| Item | Comportamento |
|------|----------------|
| Estatística | KPIs workspace + projeções |
| Sequência / Automações | Blueprint Leadlovers + sync |
| Histórico | Eventos de webhook |
| Páginas | Publicar LP + Kit LP |
| Formulários | Redireciona para checklist `conteudo-seo` |
| Pop-ups | Guia de captação + links |
| Contatos | Atalho para Leads |
| Contas de envio | Atalho Kit LP / integrações |
| Ajustes | Redireciona para `produto-oferta` |

### Aliases (URLs antigas)

| Legado | Menu |
|--------|------|
| `operacao/marketing/conteudo-seo` | Formulários |
| `operacao/marketing/captacao-trafego` | Automações |
| `operacao/produto-oferta` | Ajustes |
| `operacao/launch-kit` | Páginas |

### Integrações

- LP pública: `/l/:slug`
- Webhooks: `POST /public/webhooks/:provider/:token`
- E-mail: Resend (`RESEND_API_KEY`, `MAIL_FROM`)
- Sync: Hotmart / Leadlovers (tokens no workspace + env API)

---

## 3. Desenvolvimento

**Cor:** sky · **Foco:** front, back, dados, infra PPL (Fase 3 FL).

### Menu

| Seção | Item | Rota |
|-------|------|------|
| Analisar | Estatística | `operacao/desenvolvimento/estatistica` |
| Interface | Front-end | `operacao/desenvolvimento/front-end` |
| Serviços | Back-end | `operacao/desenvolvimento/back-end` |
| Dados | Banco de dados | `operacao/desenvolvimento/banco-de-dados` |
| Publicar | Infra & captação | `operacao/desenvolvimento/infra` → `operacao/fase-3` |

### Telas

- **Stacks técnicas:** checklists (`AdminMarketingDevPage`).
- **Fase 3:** checklist FL completo (`AdminLaunchPhasePage`).

### Aliases

| Legado | Novo |
|--------|------|
| `operacao/marketing/front-end` | `operacao/desenvolvimento/front-end` |
| `operacao/marketing/back-end` | `operacao/desenvolvimento/back-end` |
| `operacao/marketing/banco-de-dados` | `operacao/desenvolvimento/banco-de-dados` |
| `operacao/fase-3` | Infra & captação (menu) |

Checklists **conteúdo SEO** e **captação** permanecem no pilar Marketing.

---

## 4. Fórmula de Lançamento

**Cor:** âmbar · **Foco:** jornada FL (6 fases de checklist).

### Menu

| Seção | Item | Atalho menu → execução |
|-------|------|-------------------------|
| Analisar | Estatística | Hub |
| Fundamentar | Fundação | `operacao/fase-1` |
| Fundamentar | Teaser & editorial | `operacao/fase-2` |
| Pré-lançamento | PL | `operacao/fase-4` |
| Lançamento | L | `operacao/fase-5` |
| Consolidar | Pós-lançamento | `operacao/fase-6` |

Rotas amigáveis: `operacao/formula-lancamento/*` redirecionam para `operacao/fase-N`.

URLs **`operacao/fase-1` … `fase-6`** seguem válidas; o menu destaca o item FL via alias.

**Fase 3** está no pilar **Desenvolvimento** (infra/captação), não no menu FL.

---

## API e banco (deploy)

Rodar na API, quando aplicável:

```bash
npm run prisma:migrate --workspace @ederson-agencia/api
```

Migrations relevantes: workspace, branding, webhooks, launch page, launch operation checklist.

---

## Pendências / roadmap

- Pop-ups: módulo dedicado (campos + snippet na LP); hoje guia + links.
- Sync externo: exige tokens/env configurados.
- Render: uploads locais são efêmeros — usar storage/disco persistente em produção.

---

## Mapa rápido de arquivos

| Área | Caminhos |
|------|----------|
| Nav pilares | `packages/shared/src/*-operation-nav.ts` |
| Workspace | `packages/shared/src/project-workspace.ts` |
| Web admin | `apps/web/src/pages/Admin*HubPage.tsx`, `AdminBrandingEtapaPage.tsx`, `AdminLaunchPhasePage.tsx` |
| Layout | `apps/web/src/components/admin/AdminOperationsLayout.tsx` |
| Rotas | `apps/web/src/App.tsx` |
| Estilos | `apps/web/src/styles/agency-admin.css` |

---

*Gerado para a Agência Ederson Programador — Operação por cliente/projeto.*
