/** Desenvolvimento — análise e escolha inicial de stack (mercado atual). */

export type DevTechOption = {
  id: string;
  label: string;
  hint?: string;
  /** Agrupa cards na UI (Linguagens, Frameworks, …). */
  group?: string;
};

export type DevTechStackCategory = {
  id: string;
  navLabel: string;
  title: string;
  description: string;
  adminPath: string;
  fieldId: string;
  options: readonly DevTechOption[];
};

const F = (layer: string) => `product:stack:${layer}`;

export const DEVELOPMENT_TECH_STACK_CATEGORIES: readonly DevTechStackCategory[] = [
  {
    id: "visao",
    navLabel: "Visão geral",
    title: "Stack — visão geral",
    description: "Panorama das escolhas técnicas do lançamento antes de codar LPs, API e infra.",
    adminPath: "operacao/desenvolvimento/stack",
    fieldId: F("visao-notas"),
    options: []
  },
  {
    id: "front-end",
    navLabel: "Front-end",
    title: "Stack — Front-end",
    description: "Linguagens, frameworks, UI e entrega web/mobile para LP, checkout e área de membros.",
    adminPath: "operacao/desenvolvimento/stack-front-end",
    fieldId: F("front-end"),
    options: [
      { id: "ts", label: "TypeScript", group: "Linguagens", hint: "Padrão recomendado para produtos digitais." },
      { id: "js", label: "JavaScript (ES202+)", group: "Linguagens", hint: "Scripts leves ou legado." },
      { id: "react-vite", label: "React 19 + Vite", group: "Frameworks (React)", hint: "SPA/MPA — stack padrão agência." },
      { id: "next", label: "Next.js (App Router)", group: "Frameworks (React)", hint: "SSR/SSG, SEO, rotas híbridas." },
      { id: "remix", label: "Remix / React Router 7", group: "Frameworks (React)", hint: "Web standards, forms." },
      { id: "gatsby", label: "Gatsby", group: "Frameworks (React)", hint: "Conteúdo estático + GraphQL." },
      { id: "vue-vite", label: "Vue 3 + Vite", group: "Frameworks (Vue)", hint: "Curva suave, Composition API." },
      { id: "nuxt", label: "Nuxt 3", group: "Frameworks (Vue)", hint: "SSR Vue, módulos." },
      { id: "angular", label: "Angular 19+", group: "Outros frameworks", hint: "Enterprise, TypeScript nativo." },
      { id: "sveltekit", label: "SvelteKit", group: "Outros frameworks", hint: "Bundle pequeno, reatividade." },
      { id: "solid", label: "SolidStart", group: "Outros frameworks", hint: "Performance, fine-grained." },
      { id: "astro", label: "Astro", group: "Outros frameworks", hint: "Conteúdo + ilhas interativas." },
      { id: "tailwind", label: "Tailwind CSS + shadcn/ui", group: "UI & estilo", hint: "Design system rápido." },
      { id: "mui", label: "Material UI (MUI)", group: "UI & estilo", hint: "Componentes React densos." },
      { id: "chakra", label: "Chakra UI", group: "UI & estilo", hint: "Acessibilidade, DX." },
      { id: "bootstrap", label: "Bootstrap 5", group: "UI & estilo", hint: "Landing clássica, time marketing." },
      { id: "rn-web", label: "React Native (Web + app)", group: "Mobile & híbrido", hint: "Um código, app stores." },
      { id: "flutter-web", label: "Flutter Web", group: "Mobile & híbrido", hint: "UI pixel-perfect cross." },
      { id: "capacitor", label: "Capacitor + web app", group: "Mobile & híbrido", hint: "Wrap SPA em app nativo." },
      { id: "wordpress", label: "WordPress + tema", group: "CMS & builders", hint: "Autonomia do cliente no conteúdo." },
      { id: "webflow", label: "Webflow", group: "CMS & builders", hint: "Design-first, export ou embed." },
      { id: "framer", label: "Framer Sites", group: "CMS & builders", hint: "LP animada, publicação rápida." },
      { id: "elementor", label: "WordPress + Elementor", group: "CMS & builders", hint: "Page builder visual." },
      { id: "static-tailwind", label: "HTML + Tailwind (estático)", group: "CMS & builders", hint: "LP ultra leve na CDN." }
    ]
  },
  {
    id: "back-end",
    navLabel: "Back-end",
    title: "Stack — Back-end",
    description: "Linguagens, runtimes e frameworks de API, auth, webhooks e integrações.",
    adminPath: "operacao/desenvolvimento/stack-back-end",
    fieldId: F("back-end"),
    options: [
      { id: "node-ts", label: "Node.js + TypeScript", group: "Linguagens", hint: "Ecossistema npm, full-stack JS." },
      { id: "bun", label: "Bun", group: "Linguagens", hint: "Runtime rápido, bundler integrado." },
      { id: "deno", label: "Deno", group: "Linguagens", hint: "TypeScript nativo, edge." },
      { id: "python", label: "Python 3.12+", group: "Linguagens", hint: "Dados, IA, automação." },
      { id: "go", label: "Go", group: "Linguagens", hint: "Concorrência, binário único." },
      { id: "rust", label: "Rust", group: "Linguagens", hint: "Performance e segurança." },
      { id: "php", label: "PHP 8.3+", group: "Linguagens", hint: "Hosting amplo no BR." },
      { id: "java", label: "Java / Kotlin (JVM)", group: "Linguagens", hint: "Enterprise, Android." },
      { id: "csharp", label: "C# / .NET 8", group: "Linguagens", hint: "ASP.NET Core, Azure." },
      { id: "ruby", label: "Ruby", group: "Linguagens", hint: "Rails, produtividade." },
      { id: "elixir", label: "Elixir", group: "Linguagens", hint: "Phoenix, tempo real." },
      { id: "node-fastify", label: "Fastify", group: "Frameworks (Node)", hint: "API rápida — Ederson Agência." },
      { id: "node-nest", label: "NestJS", group: "Frameworks (Node)", hint: "Módulos, DI, OpenAPI." },
      { id: "node-express", label: "Express", group: "Frameworks (Node)", hint: "Maior base de tutoriais." },
      { id: "hono", label: "Hono", group: "Frameworks (Node)", hint: "Edge, Workers, leve." },
      { id: "elysia", label: "Elysia (Bun)", group: "Frameworks (Node)", hint: "Type-safe, performance." },
      { id: "python-fastapi", label: "FastAPI", group: "Frameworks (Python)", hint: "Async, OpenAPI automático." },
      { id: "python-django", label: "Django", group: "Frameworks (Python)", hint: "Admin, ORM, monólito." },
      { id: "python-flask", label: "Flask", group: "Frameworks (Python)", hint: "Microserviços simples." },
      { id: "laravel", label: "Laravel", group: "Frameworks (PHP)", hint: "Eloquent, queues, Forge." },
      { id: "symfony", label: "Symfony", group: "Frameworks (PHP)", hint: "Componentes enterprise." },
      { id: "rails", label: "Ruby on Rails 7+", group: "Outros frameworks", hint: "Convención over configuration." },
      { id: "spring", label: "Spring Boot 3", group: "Outros frameworks", hint: "Microserviços Java." },
      { id: "aspnet", label: "ASP.NET Core", group: "Outros frameworks", hint: "Minimal APIs, Blazor." },
      { id: "phoenix", label: "Phoenix (Elixir)", group: "Outros frameworks", hint: "Channels, liveview." },
      { id: "axum", label: "Axum (Rust)", group: "Outros frameworks", hint: "Tokio, type-safe." },
      { id: "graphql", label: "GraphQL (Apollo / Yoga)", group: "Estilo de API", hint: "Schema único, mobile." },
      { id: "trpc", label: "tRPC", group: "Estilo de API", hint: "End-to-end types com TS." },
      { id: "rest-openapi", label: "REST + OpenAPI", group: "Estilo de API", hint: "Padrão integrações FL." },
      { id: "grpc", label: "gRPC", group: "Estilo de API", hint: "Microserviços internos." },
      { id: "auth-jwt", label: "JWT próprio", group: "Auth", hint: "Controle total portal." },
      { id: "auth-clerk", label: "Clerk", group: "Auth", hint: "SaaS auth + UI." },
      { id: "auth-auth0", label: "Auth0 / Okta", group: "Auth", hint: "Enterprise SSO." },
      { id: "auth-supabase", label: "Supabase Auth", group: "Auth", hint: "Magic link, OAuth." },
      { id: "serverless", label: "AWS Lambda / Functions", group: "Serverless", hint: "Escala por evento." },
      { id: "supabase-edge", label: "Supabase Edge Functions", group: "Serverless", hint: "Deno deploy." }
    ]
  },
  {
    id: "dados",
    navLabel: "Dados & cache",
    title: "Stack — Dados & cache",
    description: "Bancos relacionais, NoSQL, cache, busca e analytics para pico de lançamento.",
    adminPath: "operacao/desenvolvimento/stack-dados",
    fieldId: F("dados"),
    options: [
      { id: "postgres", label: "PostgreSQL 16+", group: "Relacional (SQL)", hint: "Padrão — Render Managed PG." },
      { id: "mysql", label: "MySQL 8", group: "Relacional (SQL)", hint: "Hosting tradicional." },
      { id: "mariadb", label: "MariaDB", group: "Relacional (SQL)", hint: "Fork MySQL, open source." },
      { id: "sqlserver", label: "Microsoft SQL Server", group: "Relacional (SQL)", hint: "Ecossistema .NET." },
      { id: "oracle", label: "Oracle Database", group: "Relacional (SQL)", hint: "Enterprise legado." },
      { id: "cockroach", label: "CockroachDB", group: "Relacional (SQL)", hint: "Distribuído, compatible PG." },
      { id: "neon", label: "Neon (Postgres serverless)", group: "Cloud SQL", hint: "Branching, scale to zero." },
      { id: "supabase-db", label: "Supabase (Postgres)", group: "Cloud SQL", hint: "Auth, realtime, storage." },
      { id: "planetscale", label: "PlanetScale (MySQL)", group: "Cloud SQL", hint: "Branches, Vitess." },
      { id: "aurora", label: "Amazon Aurora", group: "Cloud SQL", hint: "AWS managed PG/MySQL." },
      { id: "mongodb", label: "MongoDB Atlas", group: "NoSQL & documentos", hint: "Flex schema, agregações." },
      { id: "dynamodb", label: "Amazon DynamoDB", group: "NoSQL & documentos", hint: "Key-value AWS scale." },
      { id: "firebase", label: "Firebase Firestore", group: "NoSQL & documentos", hint: "Mobile, rules, sync." },
      { id: "couchbase", label: "Couchbase", group: "NoSQL & documentos", hint: "JSON + N1QL." },
      { id: "redis", label: "Redis 7 / Valkey", group: "Cache & filas", hint: "Sessão, BullMQ, rate limit." },
      { id: "memcached", label: "Memcached", group: "Cache & filas", hint: "Cache simples RAM." },
      { id: "keydb", label: "KeyDB", group: "Cache & filas", hint: "Multithread Redis-like." },
      { id: "elastic", label: "Elasticsearch", group: "Busca & analytics", hint: "Logs, full-text, Kibana." },
      { id: "meilisearch", label: "Meilisearch", group: "Busca & analytics", hint: "Busca instantânea UX." },
      { id: "algolia", label: "Algolia", group: "Busca & analytics", hint: "SaaS search, typo-tolerant." },
      { id: "clickhouse", label: "ClickHouse", group: "Busca & analytics", hint: "Analytics colunar." },
      { id: "pgvector", label: "PostgreSQL + pgvector", group: "IA & vetores", hint: "Embeddings no SQL." },
      { id: "pinecone", label: "Pinecone", group: "IA & vetores", hint: "Vector DB managed." },
      { id: "sqlite", label: "SQLite / Turso / libSQL", group: "Edge & embed", hint: "Protótipo, edge replicas." },
      { id: "appwrite", label: "Appwrite DB", group: "BaaS", hint: "Backend open source." }
    ]
  },
  {
    id: "infra",
    navLabel: "Infra & deploy",
    title: "Stack — Infra & deploy",
    description: "Cloud, PaaS, containers e CI/CD para web, API e workers.",
    adminPath: "operacao/desenvolvimento/stack-infra",
    fieldId: F("infra"),
    options: [
      { id: "render", label: "Render", group: "PaaS", hint: "Web + worker + PG — blueprint agência." },
      { id: "vercel", label: "Vercel", group: "PaaS", hint: "Front Next/static, previews." },
      { id: "netlify", label: "Netlify", group: "PaaS", hint: "Jamstack, forms, functions." },
      { id: "railway", label: "Railway", group: "PaaS", hint: "Deploy rápido full-stack." },
      { id: "fly", label: "Fly.io", group: "PaaS", hint: "Containers edge global." },
      { id: "heroku", label: "Heroku", group: "PaaS", hint: "Legado, add-ons." },
      { id: "aws", label: "Amazon Web Services (AWS)", group: "Cloud hyperscaler", hint: "ECS, RDS, S3, CloudFront." },
      { id: "gcp", label: "Google Cloud (GCP)", group: "Cloud hyperscaler", hint: "Cloud Run, GKE, Firebase." },
      { id: "azure", label: "Microsoft Azure", group: "Cloud hyperscaler", hint: ".NET, Entra ID." },
      { id: "digitalocean", label: "DigitalOcean", group: "Cloud VPS", hint: "Droplets, App Platform." },
      { id: "cloudflare", label: "Cloudflare (Pages + Workers)", group: "Edge & CDN", hint: "CDN, WAF, zero egress." },
      { id: "docker-vps", label: "VPS + Docker Compose", group: "Self-host", hint: "Coolify, Portainer, Hetzner." },
      { id: "k8s", label: "Kubernetes (EKS/GKE/AKS)", group: "Orquestração", hint: "Escala enterprise." },
      { id: "terraform", label: "Terraform / OpenTofu", group: "IaC", hint: "Infra as code." },
      { id: "github-actions", label: "GitHub Actions CI/CD", group: "CI/CD", hint: "Pipeline deploy automático." },
      { id: "hybrid", label: "Híbrido (CDN estático + API dedicada)", group: "Arquitetura", hint: "Static Vercel/CF + API Render." }
    ]
  },
  {
    id: "automacao",
    navLabel: "Automação & filas",
    title: "Stack — Automação & filas",
    description: "Filas, workflows, webhooks e integração com CRM/e-mail.",
    adminPath: "operacao/desenvolvimento/stack-automacao",
    fieldId: F("automacao"),
    options: [
      { id: "bullmq", label: "BullMQ + Redis", group: "Filas (Node)", hint: "Retries, delayed jobs." },
      { id: "bee-queue", label: "Bee-Queue", group: "Filas (Node)", hint: "Simples, Redis." },
      { id: "celery", label: "Celery + Redis/Rabbit", group: "Filas (Python)", hint: "Tasks Python maduras." },
      { id: "sidekiq", label: "Sidekiq (Ruby)", group: "Filas (Ruby)", hint: "Rails background." },
      { id: "sqs", label: "Amazon SQS", group: "Filas (cloud)", hint: "Managed, scale infinito." },
      { id: "pubsub", label: "Google Pub/Sub", group: "Filas (cloud)", hint: "Event-driven GCP." },
      { id: "rabbitmq", label: "RabbitMQ", group: "Message broker", hint: "AMQP, routing complexo." },
      { id: "kafka", label: "Apache Kafka", group: "Message broker", hint: "Stream, alto volume." },
      { id: "inngest", label: "Inngest", group: "Workflows", hint: "Serverless steps, retries." },
      { id: "temporal", label: "Temporal.io", group: "Workflows", hint: "Orquestração durable." },
      { id: "n8n", label: "n8n", group: "Low-code", hint: "Self-host ou cloud." },
      { id: "make-zapier", label: "Make / Zapier", group: "Low-code", hint: "MVPs sem código." },
      { id: "webhooks-native", label: "Webhooks nativos (API portal)", group: "Integração FL", hint: "Hotmart/Kiwify → leads." },
      { id: "leadlovers-api", label: "Leadlovers API", group: "Integração FL", hint: "Tags e sequências." },
      { id: "activecampaign", label: "ActiveCampaign API", group: "Integração FL", hint: "Automação e-mail BR." }
    ]
  },
  {
    id: "pagamentos",
    navLabel: "Pagamentos",
    title: "Stack — Pagamentos & checkout",
    description: "Gateways e checkout do lançamento (Brasil e internacional).",
    adminPath: "operacao/desenvolvimento/stack-pagamentos",
    fieldId: F("pagamentos"),
    options: [
      { id: "hotmart", label: "Hotmart", group: "Infoprodutos BR", hint: "FL, afiliados, club." },
      { id: "kiwify", label: "Kiwify", group: "Infoprodutos BR", hint: "Checkout rápido, Pix." },
      { id: "monetizze", label: "Monetizze", group: "Infoprodutos BR", hint: "Afiliados, recorrência." },
      { id: "eduzz", label: "Eduzz", group: "Infoprodutos BR", hint: "Nutror, afiliados." },
      { id: "stripe", label: "Stripe", group: "Internacional", hint: "Cartão global, Billing." },
      { id: "paddle", label: "Paddle", group: "Internacional", hint: "MoR, SaaS tax." },
      { id: "paypal", label: "PayPal", group: "Internacional", hint: "Confiança global." },
      { id: "asaas", label: "Asaas", group: "Brasil (Pix/boleto)", hint: "Pix, assinaturas BR." },
      { id: "pagseguro", label: "PagSeguro / PagBank", group: "Brasil (Pix/boleto)", hint: "Marketplace UOL." },
      { id: "mercadopago", label: "Mercado Pago", group: "Brasil (Pix/boleto)", hint: "Pix, checkout transparente." },
      { id: "pagarme", label: "Pagar.me (Stone)", group: "Brasil (Pix/boleto)", hint: "API developer-friendly." },
      { id: "iugu", label: "Iugu", group: "Brasil (Pix/boleto)", hint: "Assinaturas, split." },
      { id: "checkout-proprio", label: "Checkout próprio + gateway API", group: "Custom", hint: "PCI delegado ao gateway." }
    ]
  },
  {
    id: "email",
    navLabel: "E-mail transacional",
    title: "Stack — E-mail transacional",
    description: "Envio PPL, CPL, carrinho e notificações operacionais.",
    adminPath: "operacao/desenvolvimento/stack-email",
    fieldId: F("email"),
    options: [
      { id: "resend", label: "Resend", group: "API moderna", hint: "Padrão kit lançamento agência." },
      { id: "postmark", label: "Postmark", group: "API moderna", hint: "Entregabilidade alta." },
      { id: "sendgrid", label: "SendGrid (Twilio)", group: "Volume enterprise", hint: "Templates, analytics." },
      { id: "ses", label: "Amazon SES", group: "Volume enterprise", hint: "Custo baixo na AWS." },
      { id: "mailgun", label: "Mailgun", group: "Volume enterprise", hint: "API madura, logs." },
      { id: "brevo", label: "Brevo (Sendinblue)", group: "Brasil / EU", hint: "Transacional + marketing." },
      { id: "mailchimp-tx", label: "Mailchimp Transactional (Mandrill)", group: "Brasil / EU", hint: "Integração MC." },
      { id: "leadlovers-mail", label: "Leadlovers (nutrição)", group: "Nutrição FL", hint: "Complemento à API." },
      { id: "activecampaign-mail", label: "ActiveCampaign", group: "Nutrição FL", hint: "Automação BR." }
    ]
  }
] as const;

export function devTechStackCategoryByAdminSegment(segment: string): DevTechStackCategory | undefined {
  if (segment === "stack") {
    return DEVELOPMENT_TECH_STACK_CATEGORIES.find((c) => c.id === "visao");
  }
  if (segment.startsWith("stack-")) {
    const layer = segment.slice("stack-".length);
    return DEVELOPMENT_TECH_STACK_CATEGORIES.find((c) => c.id === layer);
  }
  return undefined;
}

export function devTechStackFieldIds(): string[] {
  return DEVELOPMENT_TECH_STACK_CATEGORIES.map((c) => c.fieldId);
}

export function findDevTechOptionByStoredValue(stored: string): DevTechOption | undefined {
  if (!stored.trim()) return undefined;
  for (const cat of DEVELOPMENT_TECH_STACK_CATEGORIES) {
    const hit = cat.options.find((o) => o.label === stored || o.id === stored);
    if (hit) return hit;
  }
  return undefined;
}

/** Item id da nav Stack (`stack-front-end`, …) → categoria do catálogo. */
export function devTechStackCategoryByNavItemId(navItemId: string): DevTechStackCategory | undefined {
  if (!navItemId.startsWith("stack-")) return undefined;
  const catId = navItemId === "stack-visao" ? "visao" : navItemId.slice("stack-".length);
  return DEVELOPMENT_TECH_STACK_CATEGORIES.find((c) => c.id === catId);
}

/** Agrupa opções preservando ordem das seções. */
export function devTechOptionsByGroup(category: DevTechStackCategory): { group: string; options: DevTechOption[] }[] {
  const map = new Map<string, DevTechOption[]>();
  for (const opt of category.options) {
    const g = opt.group ?? "Opções";
    const list = map.get(g) ?? [];
    list.push(opt);
    map.set(g, list);
  }
  return Array.from(map.entries()).map(([group, options]) => ({ group, options }));
}
