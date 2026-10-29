import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Check,
  Code2,
  ExternalLink,
  Github,
  Layers,
  MessageSquare,
  Rocket,
  Gift,
  Shield,
  Sparkles
} from "lucide-react";
import {
  AGENCY_META,
  LEGAL_NOTICES,
  MARKETING_COPY,
  PORTFOLIO_PRODUCTION,
  type PortfolioProductionItem
} from "@ederson-agencia/shared";
import { BrandLogo } from "../components/brand/BrandLogo";
import { OfferComparison } from "../components/landing/OfferComparison";
import { OfferPackages } from "../components/landing/OfferPackages";
import { CtaBand } from "../components/landing/CtaBand";
import { MoodSection } from "../components/landing/MoodSection";
import { ProHero } from "../components/landing/ProHero";
import { Reveal } from "../components/landing/Reveal";
import { SectionHeader } from "../components/landing/SectionHeader";
import { ProductionProjectLogo } from "../components/landing/ProductionProjectLogo";
import { SpotlightBand } from "../components/landing/SpotlightBand";
import { usePageMood } from "../hooks/usePageMood";
import { apiGet, apiPost } from "../api";
import { ThemeToggle } from "../components/theme/ThemeToggle";
import { scrollToLandingTop } from "../lib/landing-scroll";

const copy = MARKETING_COPY;
const legal = LEGAL_NOTICES;

const MEETING_URL = import.meta.env.VITE_MEETING_URL as string | undefined;

const processIcons = [Sparkles, Layers, Code2, Shield, Rocket];

const LANDING_NAV = [
  { href: "#ideia", label: "Oferta" },
  { href: "#processo", label: "Como funciona" },
  { href: "#entregas", label: "Entregáveis" },
  { href: "#pacotes", label: "Pacotes" },
  { href: "#producao", label: "Projetos" },
  { href: "#investimento", label: "Investimento" },
  { href: "#contato", label: "Contato" }
] as const;

function SalesNav({ scrolled }: { scrolled: boolean }) {
  return (
    <header
      className={`site-nav fixed inset-x-0 top-0 z-50 border-b transition duration-700 ${
        scrolled ? "is-scrolled border-white/10 bg-black/88" : "border-transparent bg-black/40"
      } backdrop-blur-xl`}
    >
      <div className="landing-container">
        <div className="site-nav__bar relative flex items-center justify-between gap-2 py-3 sm:gap-3 sm:py-3.5 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-3 md:py-3 lg:gap-4 xl:gap-6 xl:py-3.5">
          <a
            href="#topo"
            className="group relative z-20 shrink-0 md:justify-self-start md:self-center"
            aria-label={`${copy.brand} — voltar ao início`}
            onClick={(event) => {
              event.preventDefault();
              scrollToLandingTop();
            }}
          >
            <BrandLogo size="sm" className="md:hidden" />
            <span className="site-nav__logo-slot hidden md:inline-flex">
              <BrandLogo size="md" />
            </span>
          </a>
          <nav
            className="site-nav__links site-nav__links--center hidden items-center justify-center gap-1 overflow-x-auto px-1 md:col-start-2 md:flex md:justify-self-center lg:gap-2.5 xl:gap-4 2xl:gap-5"
            aria-label="Seções da página"
          >
            {LANDING_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="btn-ghost shrink-0 whitespace-nowrap px-1 text-[11px] md:px-1.5 lg:text-sm xl:px-2 xl:text-[0.9375rem] 2xl:text-base"
              >
                {item.label}
              </a>
            ))}
            <a
              href={AGENCY_META.resumePath}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost shrink-0 whitespace-nowrap px-1 text-[11px] md:px-1.5 lg:text-sm xl:px-2 xl:text-[0.9375rem] 2xl:text-base"
            >
              Currículo
            </a>
          </nav>
          <div className="relative z-20 flex shrink-0 items-center justify-end gap-1.5 sm:gap-2 md:col-start-3 md:justify-self-end xl:gap-3">
            <ThemeToggle compact />
            <Link
              to="/login"
              className="btn-ghost inline-flex min-h-11 max-w-[7.5rem] items-center truncate px-2 text-xs sm:max-w-none sm:px-3 sm:text-sm"
            >
              {copy.loginCta}
            </Link>
            <a
              href="#contato"
              className="btn-primary inline-flex min-h-11 items-center whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:py-2.5 lg:text-sm"
            >
              Contato
            </a>
          </div>
        </div>
        <nav
          className="-mx-1 flex gap-1 overflow-x-auto border-t border-white/[0.06] py-2 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
          aria-label="Seções da página (mobile)"
        >
          {LANDING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="landing-mobile-pill inline-flex min-h-11 shrink-0 items-center rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/75 transition hover:border-white/20 hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <a
            href={AGENCY_META.resumePath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-sky-400/25 bg-sky-500/10 px-3.5 py-2 text-xs font-medium text-sky-200/90 transition hover:border-sky-400/40"
          >
            Currículo
          </a>
          <Link
            to="/login"
            className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-xs font-medium text-white/90 transition hover:border-white/25"
          >
            {copy.loginCta}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SalesFooter() {
  return (
    <footer className="landing-footer border-t border-white/10 py-14">
      <div className="landing-container space-y-8">
        <p className="text-center text-xs leading-relaxed text-white/40 md:text-left">{legal.shortDisclaimer}</p>
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <BrandLogo size="sm" />
            <p className="mt-3 text-sm text-white/50">{copy.footer.tagline}</p>
            <a
              href={AGENCY_META.resumePath}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
            >
              {AGENCY_META.resumeLabel}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {LANDING_NAV.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-white/45 transition hover:text-blue-glow">
                {item.label}
              </a>
            ))}
            <a
              href={AGENCY_META.resumePath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/45 transition hover:text-blue-glow"
            >
              Currículo
            </a>
            <a href={AGENCY_META.github} target="_blank" rel="noreferrer" className="btn-ghost inline-flex gap-1">
              <Github className="h-4 w-4" /> GitHub
            </a>
            <Link to="/cursos" className="text-sm text-white/45 transition hover:text-blue-glow">
              Academia — cursos
            </Link>
            <Link to="/academia/entrar" className="text-sm text-white/45 transition hover:text-blue-glow">
              {copy.academyLoginCta}
            </Link>
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
    <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
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
                Entregas desta fase
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
              <a href="#contato" className="btn-secondary mt-8 w-full sm:w-auto">
                {copy.aida.attention.ctaPrimary}
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
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [preferredPackage, setPreferredPackage] = useState("");
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
    const syncPackageFromHash = () => {
      const raw = window.location.hash;
      const query = raw.includes("?") ? raw.slice(raw.indexOf("?") + 1) : "";
      const pacote = new URLSearchParams(query).get("pacote");
      if (pacote === "essential" || pacote === "professional" || pacote === "advanced") {
        setPreferredPackage(pacote);
      }
    };
    syncPackageFromHash();
    window.addEventListener("hashchange", syncPackageFromHash);
    return () => window.removeEventListener("hashchange", syncPackageFromHash);
  }, []);

  useEffect(() => {
    void apiGet<{ production?: PortfolioProductionItem[] }>("/public/landing")
      .then((payload) => {
        if (payload.production?.length) setProduction(payload.production);
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
        budgetHint: form.get("budgetHint"),
        packageTier: form.get("packageTier") || undefined
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
    <div className="landing-shell surface-light relative bg-[var(--app-bg-solid)] text-[var(--app-text)]">
      <div className="pointer-events-none fixed inset-0 cinema-grid opacity-[0.14]" aria-hidden />

      <SalesNav scrolled={scrolled} />

      <ProHero production={production} />

      <MoodSection mood="energy" id="ideia" className="landing-section-y">
        <div className="landing-container">
          <SectionHeader
            label={copy.offer.productName}
            title={copy.offer.productSubtitle}
            description={copy.offer.promise}
          />
          <SectionHeader
            className="mt-12"
            label={copy.aida.interest.label}
            title={copy.aida.interest.title}
            description={copy.aida.interest.subtitle}
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
            {copy.aida.interest.highlights.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel)] p-4 shadow-sm sm:p-5"
              >
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--mood-accent)]" aria-hidden />
                <span className="text-sm leading-relaxed text-[var(--app-text)]">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-3xl text-base leading-relaxed text-[var(--app-text-muted)] md:text-lg">{copy.aida.interest.pivot}</p>
        </div>
      </MoodSection>

      <MoodSection mood="logic" id="processo" className="landing-section-y">
        <div className="landing-container">
          <SectionHeader
            label={copy.process.label}
            title={copy.process.title}
            description={copy.process.subtitle}
          />
          <p className="mt-6 max-w-3xl text-[var(--app-text-muted)]">{copy.process.body}</p>
          <p className="mt-4 font-display text-lg font-semibold text-[var(--app-text)]">{copy.process.punchline}</p>
          <ProcessTimeline />
        </div>
      </MoodSection>

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
                      <ProductionProjectLogo site={site} />
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

      <MoodSection mood="spectrum" id="entregas" className="landing-section-y">
        <div className="landing-container">
          <SectionHeader
            label={copy.deliverables.label}
            title={copy.deliverables.title}
            description={copy.deliverables.subtitle}
          />
          <ul className="mt-10 grid gap-2 sm:grid-cols-2">
            {copy.deliverables.items.map((item) => (
              <li
                key={item}
                className="flex gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)] px-4 py-3 text-sm text-[var(--app-text)]"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm leading-relaxed text-[var(--app-text-muted)]">{copy.deliverables.note}</p>
        </div>
      </MoodSection>

      <MoodSection mood="vault" id="bonus" className="landing-section-y">
        <div className="landing-container">
          <SectionHeader label={copy.bonuses.label} title={copy.bonuses.title} />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {copy.bonuses.items.map((bonus) => (
              <article key={bonus.title} className="panel p-6">
                <Gift className="h-6 w-6 text-sky-400" aria-hidden />
                <h3 className="mt-4 font-display text-lg font-semibold text-[var(--app-text)]">{bonus.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">{bonus.text}</p>
              </article>
            ))}
          </div>
        </div>
      </MoodSection>

      <MoodSection mood="value" id="pacotes" className="landing-section-y">
        <div className="landing-container">
          <SectionHeader label={copy.packages.label} title={copy.packages.title} description={copy.packages.subtitle} />
          <OfferPackages />
          <OfferComparison />
        </div>
      </MoodSection>

      <MoodSection mood="calm" id="investimento" className="landing-section-y">
        <div className="landing-container grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeader label={copy.pricing.label} title={copy.pricing.title} description={copy.pricing.subtitle} />
            <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--app-border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--app-hover)] text-[var(--app-text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Oferta</th>
                    <th className="px-4 py-3 font-medium">Faixa ilustrativa</th>
                  </tr>
                </thead>
                <tbody>
                  {copy.pricing.rows.map((row) => (
                    <tr key={row.offer} className="border-t border-[var(--app-border)]">
                      <td className="px-4 py-3 text-[var(--app-text)]">{row.offer}</td>
                      <td className="px-4 py-3 font-medium text-blue-glow">{row.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--app-text-muted)]">{copy.pricing.disclaimer}</p>
            <ul className="mt-6 space-y-2">
              {copy.pricing.bullets.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-[var(--app-text-muted)]">
                  <Check className="h-4 w-4 shrink-0 text-sky-500" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <SectionHeader label={copy.commercialTerms.label} title={copy.commercialTerms.title} />
              <div className="mt-6 space-y-5">
                {copy.commercialTerms.items.map((term) => (
                  <div key={term.title}>
                    <h4 className="font-display text-base font-semibold text-[var(--app-text)]">{term.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">{term.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 space-y-4 text-sm text-[var(--app-text-muted)]">
              {copy.motivation.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <div id="garantia" className="panel-glow scroll-mt-28 p-8">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-glow" />
              <p className="section-label">{copy.guarantee.label}</p>
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold text-[var(--app-text)]">{copy.guarantee.title}</h3>
            <p className="mt-2 text-sm font-medium text-sky-600 dark:text-sky-300">{copy.guarantee.period}</p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--app-text-muted)]">{copy.guarantee.body}</p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--app-text-subtle)]">Não inclui automaticamente</p>
            <ul className="mt-3 space-y-2">
              {copy.guarantee.excludes.map((line) => (
                <li key={line} className="text-sm text-[var(--app-text-muted)]">
                  · {line}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-[var(--app-text-subtle)]">{copy.guarantee.legalNote}</p>
          </div>
        </div>
      </MoodSection>

      <MoodSection mood="launch" id="contato" className="landing-section-y">
        <div className="landing-container">
          <Reveal>
            <p className="section-label">{copy.aida.action.label}</p>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold md:text-4xl">{copy.aida.action.title}</h2>
            <p className="mt-4 max-w-2xl text-white/60">{copy.meeting.subtitle}</p>
            <p className="mt-3 text-sm font-medium text-sky-200/90">{copy.aida.action.urgencyNote}</p>
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
                    <a href="#formulario" className="btn-primary mt-6">
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

      <MoodSection mood="commit" id="resumo" className="landing-section-y !py-12 md:!py-16">
        <div className="landing-container max-w-3xl">
          <p className="section-label">{copy.offer.productName}</p>
          <h2 className="pro-headline mt-2 text-2xl md:text-3xl">{copy.brand}</h2>
          <dl className="mt-8 space-y-4 text-sm leading-relaxed text-[var(--app-text-muted)] md:text-base">
            <div>
              <dt className="font-semibold text-[var(--app-text)]">Objetivo</dt>
              <dd className="mt-1">{copy.offer.salesSummary.promise}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--app-text)]">Inclui</dt>
              <dd className="mt-1">{copy.offer.salesSummary.includes}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--app-text)]">Bônus</dt>
              <dd className="mt-1">{copy.offer.salesSummary.bonuses}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--app-text)]">Investimento</dt>
              <dd className="mt-1">{copy.offer.salesSummary.investment}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--app-text)]">Garantia</dt>
              <dd className="mt-1">{copy.offer.salesSummary.guarantee}</dd>
            </div>
          </dl>
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

      <MoodSection mood="commit" id="formulario" className="landing-section-y scroll-mt-28">
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
                <select className="input" name="intent" defaultValue="app" aria-label="Intenção do contato">
                  <option value="app">Quero desenvolver meu aplicativo</option>
                  <option value="reuniao">Quero agendar uma conversa</option>
                  <option value="orcamento">Quero proposta por mensagem</option>
                </select>
                <select
                  className="input"
                  name="packageTier"
                  value={preferredPackage}
                  onChange={(e) => setPreferredPackage(e.target.value)}
                  aria-label="Pacote de interesse"
                >
                  <option value="">Pacote de interesse (opcional)</option>
                  <option value="essential">Essencial — validar ideia (ref. R$ 5.900)</option>
                  <option value="professional">Profissional — produto completo (ref. R$ 12.900)</option>
                  <option value="advanced">Avançado — maior complexidade (a partir de R$ 24.900)</option>
                </select>
                <input className="input" name="name" placeholder="Nome" required autoComplete="name" />
                <input className="input" type="email" name="email" placeholder="E-mail" required autoComplete="email" />
                <input className="input" name="phone" placeholder="WhatsApp" autoComplete="tel" />
                <input className="input" name="company" placeholder="Empresa" autoComplete="organization" />
                <input className="input" name="budgetHint" placeholder="Faixa de investimento (opcional)" />
                <textarea
                  className="input min-h-32"
                  name="message"
                  placeholder="Descreva sua ideia de aplicativo: problema, público, funcionalidades essenciais e prazo…"
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
                  {submitting ? "Enviando…" : "Enviar minha ideia"}
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
