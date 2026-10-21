import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Code2,
  ExternalLink,
  Github,
  Globe,
  Layers,
  Rocket,
  Sparkles,
  Zap
} from "lucide-react";
import {
  AGENCY_META,
  MARKETING_COPY,
  PORTFOLIO_GITHUB,
  PORTFOLIO_PRODUCTION,
  type PortfolioGithubItem,
  type PortfolioProductionItem
} from "@ederson-agencia/shared";
import { apiGet, apiPost } from "../api";

const copy = MARKETING_COPY;

type LandingPayload = {
  production: PortfolioProductionItem[];
  github: PortfolioGithubItem[];
};

function SalesNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-blue-matte/20 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link to="/" className="group flex flex-col">
          <span className="text-sm font-bold tracking-wide text-white group-hover:text-blue-glow">
            {copy.brand}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-white/40">{copy.domainLabel}</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#servicos" className="btn-ghost">
            Serviços
          </a>
          <a href="#processo" className="btn-ghost">
            Processo
          </a>
          <a href="#producao" className="btn-ghost">
            Projetos
          </a>
          <a href="#investimento" className="btn-ghost">
            Investimento
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="btn-ghost hidden sm:inline">
            {copy.loginCta}
          </Link>
          <a href="#orcamento" className="btn-primary px-4 py-2.5 text-xs md:text-sm">
            Orçamento
          </a>
        </div>
      </div>
    </header>
  );
}

function SalesFooter() {
  return (
    <footer className="border-t border-blue-matte/20 bg-black py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-8">
        <div className="text-center md:text-left">
          <p className="font-semibold text-white">{copy.brand}</p>
          <p className="mt-1 text-sm text-white/50">{copy.footer.tagline}</p>
        </div>
        <div className="flex items-center gap-4">
          <a href={AGENCY_META.github} target="_blank" rel="noreferrer" className="btn-ghost inline-flex gap-1">
            <Github className="h-4 w-4" /> GitHub
          </a>
          <a href={`https://${copy.domainLabel}`} className="text-sm text-white/40">
            {copy.domainLabel}
          </a>
        </div>
        <p className="text-xs text-white/35">
          © {new Date().getFullYear()} {copy.brand}. {copy.footer.rights}
        </p>
      </div>
    </footer>
  );
}

export function LandingPage() {
  const [production, setProduction] = useState(PORTFOLIO_PRODUCTION);
  const [github, setGithub] = useState(PORTFOLIO_GITHUB);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void apiGet<{ production?: PortfolioProductionItem[]; github?: PortfolioGithubItem[] }>("/public/landing")
      .then((payload) => {
        if (payload.production?.length) setProduction(payload.production);
        if (payload.github?.length) setGithub(payload.github);
      })
      .catch(() => undefined);
  }, []);

  async function onLeadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setLeadStatus(null);
    const form = new FormData(event.currentTarget);
    try {
      const res = await apiPost<{ message: string }>("/public/leads", {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        company: form.get("company"),
        message: form.get("message"),
        budgetHint: form.get("budgetHint")
      });
      setLeadStatus(res.message);
      event.currentTarget.reset();
    } catch (error) {
      setLeadStatus(error instanceof Error ? error.message : "Não foi possível enviar. Tente de novo ou use o e-mail.");
    } finally {
      setSubmitting(false);
    }
  }

  const processIcons = [Sparkles, Layers, Code2, Rocket];

  return (
    <div className="relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 cinema-grid opacity-40" aria-hidden />
      <div className="pointer-events-none fixed inset-0 cinema-vignette" aria-hidden />
      <div
        className="pointer-events-none fixed left-1/2 top-0 h-[520px] w-[720px] -translate-x-1/2 animate-pulse-glow rounded-full bg-blue-matte/20 blur-[120px]"
        aria-hidden
      />

      <SalesNav />

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col justify-center px-4 pb-20 pt-28 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="section-label animate-fade-up mb-6">{copy.hero.eyebrow}</p>
          <h1 className="hero-title animate-fade-up max-w-5xl [animation-delay:80ms]">{copy.hero.title}</h1>
          <p className="animate-fade-up mt-8 max-w-2xl text-lg leading-relaxed text-white/65 [animation-delay:160ms] md:text-xl">
            {copy.hero.subtitle}
          </p>
          <div className="animate-fade-up mt-10 flex flex-wrap gap-4 [animation-delay:240ms]">
            <a href="#orcamento" className="btn-primary">
              {copy.hero.ctaPrimary}
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            <a href="#producao" className="btn-secondary">
              {copy.hero.ctaSecondary}
            </a>
          </div>
          <div className="mt-20 flex justify-center md:justify-start">
            <a href="#servicos" className="flex flex-col items-center gap-2 text-white/40 transition hover:text-blue-glow">
              <span className="text-xs uppercase tracking-widest">Explore</span>
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* Trust / Production */}
      <section id="producao" className="relative border-y border-blue-matte/15 bg-void/80 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="section-label">{copy.trust.title}</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold md:text-4xl">{copy.trust.subtitle}</h2>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {production.map((site) => (
              <a
                key={site.url}
                href={site.url}
                target="_blank"
                rel="noreferrer"
                className="panel-glow group relative overflow-hidden p-8 transition duration-500 hover:border-blue-glow/40"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-matte/20 blur-2xl transition group-hover:bg-blue-glow/25" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-deep/80 text-blue-glow">
                      <Globe className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold group-hover:text-blue-glow">{site.name}</h3>
                      <p className="text-sm text-blue-glow/70">{site.url.replace("https://", "")}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-white/30 group-hover:text-white" />
                </div>
                <p className="relative mt-4 text-sm leading-relaxed text-white/60">{site.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicos" className="relative py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="section-label">{copy.services.title}</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold md:text-4xl">{copy.services.subtitle}</h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {copy.services.items.map((item, i) => (
              <article key={item.title} className="panel p-8 transition hover:border-blue-matte-light/50">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-deep text-blue-glow">
                  {i === 0 ? <Code2 className="h-5 w-5" /> : i === 1 ? <Zap className="h-5 w-5" /> : i === 2 ? <Layers className="h-5 w-5" /> : <Rocket className="h-5 w-5" />}
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="processo" className="relative border-t border-blue-matte/15 bg-gradient-to-b from-void to-black py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="section-label">{copy.process.title}</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold md:text-4xl">{copy.process.subtitle}</h2>
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {copy.process.steps.map((step, index) => {
              const Icon = processIcons[index] ?? Sparkles;
              return (
                <div key={step.title} className="relative">
                  <span className="text-5xl font-black text-blue-deep">{String(index + 1).padStart(2, "0")}</span>
                  <Icon className="mt-4 h-6 w-6 text-blue-glow" />
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{step.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GitHub portfolio strip */}
      <section className="relative py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-label">Código aberto & estudos</p>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">{github.length}+ repositórios no GitHub</h2>
            </div>
            <a href={AGENCY_META.github} target="_blank" rel="noreferrer" className="btn-secondary">
              <Github className="mr-2 h-4 w-4" />
              Ver perfil
            </a>
          </div>
          <div className="mt-10 flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
            {github.map((repo) => (
              <a
                key={repo.url}
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="panel min-w-[260px] shrink-0 p-5 transition hover:border-blue-glow/40"
              >
                <p className="font-medium text-white">{repo.name}</p>
                <p className="mt-1 text-xs text-blue-glow/80">{repo.language}</p>
                <p className="mt-3 line-clamp-2 text-xs text-white/50">{repo.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="investimento" className="relative border-t border-blue-matte/15 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="section-label">{copy.pricing.title}</p>
              <h2 className="mt-4 text-3xl font-bold md:text-4xl">{copy.pricing.subtitle}</h2>
              <p className="mt-8 text-4xl font-bold text-blue-glow md:text-5xl">{copy.pricing.highlight}</p>
              <p className="mt-4 text-white/60">{copy.pricing.note}</p>
            </div>
            <ul className="panel-glow space-y-4 p-8">
              {copy.pricing.bullets.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-white/75">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-glow" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative bg-void/50 py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <p className="section-label text-center">Dúvidas frequentes</p>
          <div className="mt-10 space-y-4">
            {copy.faq.map((item) => (
              <details key={item.q} className="panel group p-6 open:border-blue-matte-light/40">
                <summary className="cursor-pointer list-none font-medium text-white marker:content-none group-open:text-blue-glow">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Form */}
      <section id="orcamento" className="relative py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="panel-glow overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="border-b border-blue-matte/20 p-10 md:p-14 lg:border-b-0 lg:border-r">
                <p className="section-label">{copy.cta.formTitle}</p>
                <h2 className="mt-4 text-3xl font-bold md:text-4xl">{copy.cta.title}</h2>
                <p className="mt-4 text-white/60">{copy.cta.subtitle}</p>
              </div>
              <form className="space-y-4 p-10 md:p-14" onSubmit={onLeadSubmit}>
                <input className="input" name="name" placeholder="Nome" required />
                <input className="input" type="email" name="email" placeholder="E-mail" required />
                <input className="input" name="phone" placeholder="WhatsApp" />
                <input className="input" name="company" placeholder="Empresa" />
                <input className="input" name="budgetHint" placeholder="Faixa de investimento (opcional)" />
                <textarea
                  className="input min-h-32"
                  name="message"
                  placeholder="Conte sobre o sistema: o que precisa fazer, para quem, prazo desejado…"
                  required
                />
                <button type="submit" className="btn-primary w-full" disabled={submitting}>
                  {submitting ? "Enviando…" : "Enviar pedido de orçamento"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                {leadStatus ? <p className="text-sm text-blue-glow">{leadStatus}</p> : null}
              </form>
            </div>
          </div>
        </div>
      </section>

      <SalesFooter />
    </div>
  );
}
