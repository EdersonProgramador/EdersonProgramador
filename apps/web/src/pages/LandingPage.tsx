import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Check,
  Code2,
  ExternalLink,
  Github,
  Globe,
  Layers,
  MessageSquare,
  Rocket,
  Shield,
  Sparkles
} from "lucide-react";
import {
  AGENCY_META,
  LEGAL_NOTICES,
  MARKETING_COPY,
  PORTFOLIO_GITHUB,
  PORTFOLIO_PRODUCTION,
  type PortfolioGithubItem,
  type PortfolioProductionItem
} from "@ederson-agencia/shared";
import { BrandLogo } from "../components/brand/BrandLogo";
import { BentoServices } from "../components/landing/BentoServices";
import { CtaBand } from "../components/landing/CtaBand";
import { MoodSection } from "../components/landing/MoodSection";
import { ProHero } from "../components/landing/ProHero";
import { Reveal } from "../components/landing/Reveal";
import { SectionHeader } from "../components/landing/SectionHeader";
import { SpotlightBand } from "../components/landing/SpotlightBand";
import { usePageMood } from "../hooks/usePageMood";
import { apiGet, apiPost } from "../api";
import { scrollToLandingTop } from "../lib/landing-scroll";

const copy = MARKETING_COPY;
const legal = LEGAL_NOTICES;

const MEETING_URL = import.meta.env.VITE_MEETING_URL as string | undefined;

const processIcons = [Sparkles, Layers, Code2, Rocket];

const LANDING_NAV = [
  { href: "#servicos", label: "Serviços" },
  { href: "#processo", label: "Método" },
  { href: "#producao", label: "Projetos" },
  { href: "#investimento", label: "Investimento" },
  { href: "#reuniao", label: "Reunião" },
  { href: "#orcamento", label: "Orçamento" }
] as const;

function SalesNav({ scrolled }: { scrolled: boolean }) {
  return (
    <header
      className={`site-nav fixed inset-x-0 top-0 z-50 border-b transition duration-700 ${
        scrolled ? "is-scrolled border-white/10 bg-black/88" : "border-transparent bg-black/40"
      } backdrop-blur-xl`}
    >
      <div className="landing-container">
        <div className="flex items-center justify-between gap-4 py-3 md:py-3.5">
          <a
            href="#topo"
            className="group shrink-0"
            aria-label={`${copy.brand} — voltar ao início`}
            onClick={(event) => {
              event.preventDefault();
              scrollToLandingTop();
            }}
          >
            <BrandLogo size="sm" compact className="md:hidden" />
            <BrandLogo size="md" className="hidden md:flex" />
          </a>
          <nav
            className="hidden items-center gap-5 lg:flex xl:gap-7"
            aria-label="Seções da página"
          >
            {LANDING_NAV.map((item) => (
              <a key={item.href} href={item.href} className="btn-ghost whitespace-nowrap">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost hidden sm:inline">
              {copy.loginCta}
            </Link>
            <a href="#reuniao" className="btn-primary px-4 py-2.5 text-xs md:text-sm">
              Agendar
            </a>
          </div>
        </div>
        <nav
          className="-mx-1 flex gap-1 overflow-x-auto border-t border-white/[0.06] py-2 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
          aria-label="Seções da página"
        >
          {LANDING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/75 transition hover:border-white/20 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function SalesFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#07090c] py-14">
      <div className="landing-container space-y-8">
        <p className="text-center text-xs leading-relaxed text-white/40 md:text-left">{legal.shortDisclaimer}</p>
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <BrandLogo size="sm" showDomain={false} />
            <p className="mt-3 text-sm text-white/50">{copy.footer.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {LANDING_NAV.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-white/45 transition hover:text-blue-glow">
                {item.label}
              </a>
            ))}
            <a href={AGENCY_META.github} target="_blank" rel="noreferrer" className="btn-ghost inline-flex gap-1">
              <Github className="h-4 w-4" /> GitHub
            </a>
            {copy.footer.legalLinks.map((link) => (
              <a key={link.id} href={`#${link.id}`} className="text-sm text-white/45 transition hover:text-blue-glow">
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} {copy.brand}. {copy.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}

function ProcessTimeline() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const step = copy.process.steps[active];
    document.getElementById("processo")?.setAttribute("data-step-mood", step.mood);
  }, [active]);

  useEffect(() => {
    document.getElementById("processo")?.setAttribute("data-step-mood", copy.process.steps[0].mood);
  }, []);

  return (
    <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
      <div className="process-rail space-y-3">
        {copy.process.steps.map((step, index) => {
          const Icon = processIcons[index] ?? Sparkles;
          const isActive = active === index;
          return (
            <button
              key={step.title}
              type="button"
              onClick={() => setActive(index)}
              className={`relative flex w-full gap-4 rounded-2xl border p-5 text-left transition duration-300 md:pl-14 ${
                isActive
                  ? "border-[var(--mood-accent)]/50 bg-white/[0.06] shadow-glow-sm"
                  : "border-white/10 bg-white/[0.02] hover:border-blue-matte/40"
              }`}
            >
              <span
                className={`absolute left-4 top-6 hidden h-2.5 w-2.5 rounded-full md:block ${
                  isActive ? "bg-[var(--mood-accent)] shadow-[0_0_12px_var(--mood-accent)]" : "bg-white/20"
                }`}
              />
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-deep/80 text-blue-glow">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-mono text-[11px] text-white/45">
                  Fase {step.phase} · {step.days}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-white/55">{step.text}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="panel-glow sticky top-[calc(var(--hero-nav-offset,6rem)+0.75rem)] overflow-hidden p-6 sm:p-8 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 mood-glow-orb rounded-full blur-3xl" />
        {copy.process.steps.map((step, index) =>
          active === index ? (
            <div key={step.title} className="relative animate-fade-up">
              <span className="chip border-[var(--mood-accent)]/30 text-[var(--mood-accent)]">
                Entregáveis desta fase
              </span>
              <h3 className="mt-6 font-display text-2xl font-bold">{step.title}</h3>
              <ul className="mt-6 space-y-3">
                {step.deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-white/75">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mood-accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="#reuniao" className="btn-secondary mt-8 w-full sm:w-auto">
                Quero começar por aqui
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

function LegalSection() {
  return (
    <MoodSection mood="legal" className="landing-section-y !py-16 md:!py-20">
      <div className="landing-container space-y-10 md:space-y-12">
        <Reveal>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-glow" />
            <p className="section-label">Transparência jurídica</p>
          </div>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold md:text-4xl">
            Informação clara antes de qualquer contrato
          </h2>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal delayMs={80}>
            <article id="privacidade" className="panel scroll-mt-28 p-6 md:p-8">
              <h3 className="font-display text-xl font-semibold">{legal.privacy.title}</h3>
              <p className="mt-2 text-xs text-white/45">{legal.privacy.updated}</p>
              <div className="legal-doc mt-4 space-y-4">
                {legal.privacy.sections.map((block) => (
                  <div key={block.heading}>
                    <h4 className="font-medium text-white/90">{block.heading}</h4>
                    <p className="mt-1">{block.body}</p>
                  </div>
                ))}
              </div>
            </article>
          </Reveal>
          <Reveal delayMs={160}>
            <article id="termos" className="panel scroll-mt-28 p-6 md:p-8">
              <h3 className="font-display text-xl font-semibold">{legal.terms.title}</h3>
              <div className="legal-doc mt-4 space-y-4">
                {legal.terms.sections.map((block) => (
                  <div key={block.heading}>
                    <h4 className="font-medium text-white/90">{block.heading}</h4>
                    <p className="mt-1">{block.body}</p>
                  </div>
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </MoodSection>
  );
}

export function LandingPage() {
  const [production, setProduction] = useState(PORTFOLIO_PRODUCTION);
  const [github, setGithub] = useState(PORTFOLIO_GITHUB);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  usePageMood();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.add("landing-active");
    return () => document.body.classList.remove("landing-active");
  }, []);

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
    if (!consent) {
      setLeadStatus("Marque o consentimento LGPD para enviar.");
      return;
    }
    setSubmitting(true);
    setLeadStatus(null);
    const form = new FormData(event.currentTarget);
    const intent = String(form.get("intent") ?? "mensagem");
    const baseMessage = String(form.get("message") ?? "").trim();
    const message = `[Intenção: ${intent}]\n\n${baseMessage}\n\n[LGPD: consentimento registrado em ${new Date().toISOString()}]`;

    try {
      const res = await apiPost<{ message: string }>("/public/leads", {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        company: form.get("company"),
        message,
        budgetHint: form.get("budgetHint")
      });
      setLeadStatus(res.message);
      event.currentTarget.reset();
      setConsent(false);
    } catch (error) {
      setLeadStatus(error instanceof Error ? error.message : "Não foi possível enviar. Tente de novo ou use o e-mail.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="landing-shell relative bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0 cinema-grid opacity-[0.14]" aria-hidden />

      <SalesNav scrolled={scrolled} />

      <ProHero production={production} />

      {/* I — Interest */}
      <MoodSection mood="energy" id="interesse" className="landing-section-y">
        <div className="landing-container">
          <SectionHeader label={copy.aida.interest.label} title={copy.aida.interest.title} description={copy.aida.interest.subtitle} />
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {copy.aida.interest.pains.map((pain, i) => (
              <li key={pain} className="pain-card h-full">
                <div className="relative z-[1]">
                  <span className="font-mono text-xs text-[var(--mood-label)]">Desafio 0{i + 1}</span>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">{pain}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-3xl text-base leading-relaxed text-white/75 md:text-lg">{copy.aida.interest.pivot}</p>
        </div>
      </MoodSection>

      {/* Desire — production */}
      <SpotlightBand id="producao" moodTrack="desire">
          <SectionHeader label={copy.aida.desire.label} title={copy.trust.title} description={copy.trust.subtitle} />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {production.map((site) => (
                <a
                  key={site.url}
                  href={site.url}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-card group relative flex h-full flex-col overflow-hidden p-8"
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
                  <p className="relative mt-4 flex-1 text-sm leading-relaxed text-white/60">{site.description}</p>
                  <div className="relative mt-4 flex flex-wrap gap-2">
                    {site.tags.map((tag) => (
                      <span key={tag} className="chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                </a>
            ))}
          </div>
      </SpotlightBand>

      <MoodSection mood="spectrum" id="servicos" className="landing-section-y">
        <div className="landing-container">
          <SectionHeader label={copy.services.title} title={copy.services.subtitle} />
          <BentoServices />
        </div>
      </MoodSection>

      {/* Process — step by step */}
      <MoodSection mood="logic" id="processo" className="landing-section-y">
        <div className="landing-container">
          <SectionHeader label={copy.process.title} title={copy.process.subtitle} />
          <ProcessTimeline />
        </div>
      </MoodSection>

      {/* GitHub */}
      <MoodSection mood="vault" className="landing-section-y">
        <div className="landing-container">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-label">Código aberto & estudos</p>
                <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">{github.length}+ repositórios no GitHub</h2>
              </div>
              <a href={AGENCY_META.github} target="_blank" rel="noreferrer" className="btn-secondary">
                <Github className="mr-2 h-4 w-4" />
                Ver perfil
              </a>
            </div>
          </Reveal>
          <div className="mt-10 flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
            {github.map((repo, i) => (
              <Reveal key={repo.url} delayMs={Math.min(i * 40, 200)}>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="panel block min-w-[260px] shrink-0 p-5 transition hover:border-blue-glow/35"
                >
                  <p className="font-medium text-white">{repo.name}</p>
                  <p className="mt-1 font-mono text-xs text-blue-glow/80">{repo.language}</p>
                  <p className="mt-3 line-clamp-2 text-xs text-white/50">{repo.description}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </MoodSection>

      {/* Pricing */}
      <MoodSection mood="value" id="investimento" className="landing-section-y">
        <div className="landing-container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <p className="section-label">{copy.pricing.title}</p>
              <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">{copy.pricing.subtitle}</h2>
              <p className="mt-8 font-display text-4xl font-bold text-blue-glow md:text-5xl">{copy.pricing.highlight}</p>
              <p className="mt-4 text-sm text-white/55">{copy.pricing.note}</p>
              <p className="mt-3 text-xs text-white/40">{legal.shortDisclaimer}</p>
            </Reveal>
            <Reveal delayMs={120}>
              <ul className="panel-glow space-y-4 p-8">
                {copy.pricing.bullets.map((line) => (
                  <li key={line} className="flex gap-3 text-sm text-white/75">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-glow" />
                    {line}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </MoodSection>

      {/* Meeting — Action */}
      <MoodSection mood="launch" id="reuniao" className="landing-section-y">
        <div className="landing-container">
          <Reveal>
            <p className="section-label">{copy.aida.action.label}</p>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold md:text-4xl">{copy.meeting.title}</h2>
            <p className="mt-4 max-w-2xl text-white/60">{copy.meeting.subtitle}</p>
            <p className="mt-2 text-sm text-white/45">{copy.aida.action.urgencyNote}</p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {copy.meeting.options.map((opt, i) => (
              <Reveal key={opt.title} delayMs={i * 100}>
                <article className="panel-glow flex h-full flex-col p-8">
                  <div className="flex items-center gap-3">
                    {i === 0 ? <Calendar className="h-5 w-5 text-blue-glow" /> : <MessageSquare className="h-5 w-5 text-blue-glow" />}
                    <span className="chip">{opt.duration}</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold">{opt.title}</h3>
                  <p className="mt-3 flex-1 text-sm text-white/60">{opt.text}</p>
                  {i === 0 && MEETING_URL ? (
                    <a href={MEETING_URL} target="_blank" rel="noreferrer" className="btn-primary mt-6">
                      {opt.cta}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  ) : (
                    <a href="#orcamento" className="btn-primary mt-6">
                      {opt.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  )}
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delayMs={200}>
            <div className="panel mt-10 p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-white/45">Pauta da reunião</p>
              <ol className="mt-4 grid gap-3 md:grid-cols-2">
                {copy.meeting.agenda.map((item, idx) => (
                  <li key={item} className="flex gap-3 text-sm text-white/70">
                    <span className="font-mono text-blue-glow/80">{String(idx + 1).padStart(2, "0")}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </MoodSection>

      <CtaBand />

      {/* FAQ */}
      <MoodSection mood="calm" className="landing-section-y">
        <div className="landing-container max-w-3xl">
          <Reveal>
            <p className="section-label text-center">Dúvidas frequentes</p>
          </Reveal>
          <div className="mt-10 space-y-4">
            {copy.faq.map((item, i) => (
              <Reveal key={item.q} delayMs={i * 60}>
                <details className="panel group p-6 open:border-white/20">
                  <summary className="cursor-pointer list-none font-medium text-white marker:content-none group-open:text-blue-glow">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </MoodSection>

      {/* Form */}
      <MoodSection mood="commit" id="orcamento" className="landing-section-y">
        <div className="landing-container">
          <div className="panel-glow overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="border-b border-blue-matte/20 p-6 sm:p-8 md:p-12 lg:border-b-0 lg:border-r lg:p-14">
                <Reveal>
                  <p className="section-label">{copy.cta.formTitle}</p>
                  <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">{copy.cta.title}</h2>
                  <p className="mt-4 text-white/60">{copy.cta.subtitle}</p>
                  <p className="mt-4 text-xs leading-relaxed text-white/40">{legal.shortDisclaimer}</p>
                </Reveal>
              </div>
              <form className="space-y-4 p-6 sm:p-8 md:p-12 lg:p-14" onSubmit={onLeadSubmit}>
                <select className="input" name="intent" defaultValue="reuniao" aria-label="Intenção do contato">
                  <option value="reuniao">Quero agendar reunião de diagnóstico</option>
                  <option value="orcamento">Quero orçamento por mensagem</option>
                </select>
                <input className="input" name="name" placeholder="Nome" required autoComplete="name" />
                <input className="input" type="email" name="email" placeholder="E-mail" required autoComplete="email" />
                <input className="input" name="phone" placeholder="WhatsApp" autoComplete="tel" />
                <input className="input" name="company" placeholder="Empresa" autoComplete="organization" />
                <input className="input" name="budgetHint" placeholder="Faixa de investimento (opcional)" />
                <textarea
                  className="input min-h-32"
                  name="message"
                  placeholder="Conte sobre o sistema: objetivo, usuários, prazo desejado…"
                  required
                />
                <label className="flex cursor-pointer gap-3 text-left text-xs leading-relaxed text-white/55">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-blue-matte/50 bg-black accent-blue-glow"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                  />
                  {legal.formConsentLabel}{" "}
                  <a href="#privacidade" className="text-blue-glow underline-offset-2 hover:underline">
                    Ler política
                  </a>
                </label>
                <button type="submit" className="btn-primary w-full" disabled={submitting}>
                  {submitting ? "Enviando…" : "Enviar briefing"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                {leadStatus ? <p className="text-sm text-blue-glow">{leadStatus}</p> : null}
              </form>
            </div>
          </div>
        </div>
      </MoodSection>

      <LegalSection />
      <SalesFooter />
    </div>
  );
}
