import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ClipboardList,
  ExternalLink,
  Github,
  Layers,
  Lightbulb,
  Rocket,
  Shield,
  Trophy
} from "lucide-react";
import {
  AGENCY_META,
  LEGAL_NOTICES,
  LAUNCH_FUNNEL_COPY,
  MARKETING_COPY,
} from "@ederson-agencia/shared";
import { BrandLogo } from "../components/brand/BrandLogo";
import { OfferPackages } from "../components/landing/OfferPackages";
import { SectionHeader } from "../components/landing/SectionHeader";
import { apiPost } from "../api";
import { scrollToLandingTop } from "../lib/landing-scroll";
import { FunnelMarquee } from "../components/landing/funnel/FunnelMarquee";
import { FunnelHeroVsl } from "../components/landing/funnel/FunnelHeroVsl";
import { FunnelSaleToasts } from "../components/landing/funnel/FunnelSaleToasts";
import { FunnelCommunitySection } from "../components/landing/funnel/FunnelCommunitySection";
import { FunnelPipelineInline } from "../components/landing/funnel/FunnelPipelineInline";
import { FunnelSection } from "../components/landing/funnel/FunnelSection";
import { FunnelSocialProofStrip } from "../components/landing/funnel/FunnelSocialProofStrip";
import { FunnelBenefitsSection } from "../components/landing/funnel/FunnelBenefitsSection";
import { FunnelGuaranteeSection } from "../components/landing/funnel/FunnelGuaranteeSection";
import { FunnelTopicsStrip } from "../components/landing/funnel/FunnelTopicsStrip";
import { FunnelStickyCta } from "../components/landing/funnel/FunnelStickyCta";
import { useThemeStore } from "../stores/themeStore";
import { LeadCaptureProvider, useLeadCapture } from "../components/landing/lead-capture-context";

const copy = MARKETING_COPY;
const legal = LEGAL_NOTICES;

const MEETING_URL = import.meta.env.VITE_MEETING_URL as string | undefined;

const processIcons = [Lightbulb, ClipboardList, Layers, Rocket, Trophy];

const PROCESS_TIER_ACTIVE: Record<string, string> = {
  iniciante: "border-sky-400/50 bg-[#0c0c0f] shadow-[0_0_24px_rgb(56_189_248_/_0.18)]",
  estrategia: "border-indigo-400/50 bg-[#0c0c0f] shadow-[0_0_24px_rgb(129_140_248_/_0.18)]",
  construcao: "border-violet-400/50 bg-[#0c0c0f] shadow-[0_0_24px_rgb(167_139_250_/_0.18)]",
  impulso: "border-orange-400/50 bg-[#0c0c0f] shadow-[0_0_24px_rgb(251_146_60_/_0.2)]",
  maestria: "border-emerald-400/50 bg-[#0c0c0f] shadow-[0_0_24px_rgb(74_222_128_/_0.22)]"
};

const PROCESS_TIER_DOT: Record<string, string> = {
  iniciante: "bg-sky-400 shadow-[0_0_12px_rgb(56_189_248_/_0.65)]",
  estrategia: "bg-indigo-400 shadow-[0_0_12px_rgb(129_140_248_/_0.65)]",
  construcao: "bg-violet-400 shadow-[0_0_12px_rgb(167_139_250_/_0.65)]",
  impulso: "bg-orange-400 shadow-[0_0_12px_rgb(251_146_60_/_0.65)]",
  maestria: "bg-emerald-400 shadow-[0_0_12px_rgb(52_211_153_/_0.6)]"
};

const PROCESS_TIER_ICON: Record<string, string> = {
  iniciante: "bg-sky-500/15 text-sky-300",
  estrategia: "bg-indigo-500/15 text-indigo-300",
  construcao: "bg-violet-500/15 text-violet-300",
  impulso: "bg-orange-500/15 text-orange-300",
  maestria: "bg-emerald-500/15 text-emerald-300"
};

/** Links completos (mobile / rodapé) */
const LANDING_NAV = [
  { href: "#topo", label: "Vídeo" },
  { href: "#comunidade", label: "Comunidade" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#processo", label: "Como funciona" },
  { href: "#entregas", label: "Entregáveis" },
  { href: "#pacotes", label: "Pacotes" },
  { href: "#producao", label: "Projetos" },
  { href: "#contato", label: "Contato" }
] as const;

/** Header desktop — poucos itens para não colidir com logo e CTA */
const LANDING_NAV_HEADER = [
  { href: "#topo", label: "Vídeo" },
  { href: "#comunidade", label: "Comunidade" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#pacotes", label: "Pacotes" },
  { href: "#contato", label: "Contato" }
] as const;

const NAV_CTA_SHORT = "Reservar vaga";

function SalesNav({ scrolled, onOpenCapture }: { scrolled: boolean; onOpenCapture?: () => void }) {
  return (
    <header
      className={`site-nav site-nav--commercial fixed inset-x-0 top-0 z-50 border-b transition duration-500 ${
        scrolled ? "is-scrolled border-white/10 bg-black/88" : "border-transparent bg-black/40"
      } backdrop-blur-xl`}
    >
      <div className="landing-container">
        <div className="site-nav__bar site-nav__bar--funnel relative flex min-w-0 items-center justify-between gap-2 py-3 sm:gap-3 sm:py-3.5 lg:grid lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,auto)] lg:items-center lg:gap-3 lg:py-3 xl:gap-4 2xl:gap-6">
          <a
            href="#topo"
            className="group relative z-20 min-w-0 shrink-0 lg:justify-self-start lg:self-center"
            aria-label={`${copy.brand} — voltar ao início`}
            onClick={(event) => {
              event.preventDefault();
              scrollToLandingTop();
            }}
          >
            <BrandLogo size="sm" className="max-w-[11rem] lg:hidden" />
            <span className="site-nav__logo-slot hidden max-w-[14rem] lg:inline-flex 2xl:max-w-none">
              <BrandLogo size="md" />
            </span>
          </a>
          <nav
            className="site-nav__links site-nav__links--center hidden min-w-0 items-center justify-center gap-0.5 overflow-x-auto px-1 lg:col-start-2 lg:flex lg:justify-self-center lg:gap-1 2xl:gap-2"
            aria-label="Seções da página"
          >
            {LANDING_NAV_HEADER.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="btn-ghost shrink-0 whitespace-nowrap px-1.5 text-[11px] xl:text-xs 2xl:px-2 2xl:text-sm"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="relative z-20 flex min-w-0 shrink-0 items-center justify-end gap-1 sm:gap-1.5 lg:col-start-3 lg:justify-self-end lg:gap-2 2xl:gap-3">
            <Link
              to="/login"
              className="btn-ghost hidden min-h-10 items-center px-2 text-xs sm:inline-flex lg:text-sm"
            >
              {copy.loginCta}
            </Link>
            {onOpenCapture ? (
              <button
                type="button"
                className="btn-primary btn-primary--conversion inline-flex min-h-10 max-w-[9.5rem] items-center justify-center truncate px-2.5 py-2 text-[10px] font-bold uppercase leading-tight sm:max-w-none sm:px-3 sm:text-xs xl:min-h-11 xl:px-4 2xl:text-sm"
                onClick={onOpenCapture}
              >
                <span className="2xl:hidden">{NAV_CTA_SHORT}</span>
                <span className="hidden 2xl:inline">{LAUNCH_FUNNEL_COPY.heroVsl.primaryCta}</span>
              </button>
            ) : (
              <a
                href="#contato"
                className="btn-primary inline-flex min-h-11 items-center whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:py-2.5 lg:text-sm"
              >
                Contato
              </a>
            )}
          </div>
        </div>
        <nav
          className="-mx-1 flex gap-1 overflow-x-auto border-t border-white/[0.06] py-2 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
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

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
      <div className="process-rail space-y-3">
        {copy.process.steps.map((step, index) => {
          const Icon = processIcons[index] ?? Lightbulb;
          const isActive = active === index;
          const tier = "tier" in step && step.tier ? step.tier : "iniciante";
          return (
            <button
              key={step.title}
              type="button"
              onClick={() => setActive(index)}
              className={`relative flex w-full gap-4 rounded-2xl border p-5 text-left transition duration-300 md:pl-14 ${
                isActive ? PROCESS_TIER_ACTIVE[tier] : "border-white/10 bg-[#0a0a0c] hover:border-white/20"
              }`}
            >
              <span
                className={`absolute left-4 top-6 hidden h-2.5 w-2.5 rounded-full md:block ${
                  isActive ? PROCESS_TIER_DOT[tier] : "bg-white/20"
                }`}
              />
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${PROCESS_TIER_ICON[tier]}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wide text-white/45">
                  Fase {step.phase}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{step.text}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="funnel-benefit-card sticky top-[calc(var(--hero-nav-offset,6rem)+0.75rem)] p-6 sm:p-8 md:p-10">
        {copy.process.steps.map((step, index) =>
          active === index ? (
            <div key={step.title} className="animate-fade-up">
              <span className="inline-block rounded-full border border-emerald-500/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                Entregas desta fase
              </span>
              <p className="mt-4 font-mono text-xs text-white/45">Fase {step.phase}</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{step.days}</p>
              <ul className="mt-6 space-y-3">
                {step.deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="#pacotes" className="btn-secondary mt-8 w-full sm:w-auto">
                Ver pacotes e valores
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
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
    <FunnelSection className="!py-16">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-emerald-400" />
        <p className="section-label">Transparência jurídica</p>
      </div>
      <h2 className="mt-4 max-w-2xl font-display text-2xl font-bold text-white md:text-3xl">
        Informação clara antes de qualquer contrato
      </h2>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <article id="privacidade" className="funnel-benefit-card scroll-mt-28 p-6 legal-doc text-slate-300">
          <h3 className="font-display text-xl font-semibold text-white">{legal.privacy.title}</h3>
          <p className="mt-2 text-xs text-white/45">{legal.privacy.updated}</p>
          <div className="mt-4 space-y-4">
            {legal.privacy.sections.map((block) => (
              <div key={block.heading}>
                <h4 className="font-medium text-white/90">{block.heading}</h4>
                <p className="mt-1 text-sm">{block.body}</p>
              </div>
            ))}
          </div>
        </article>
        <article id="termos" className="funnel-benefit-card scroll-mt-28 p-6 legal-doc text-slate-300">
          <h3 className="font-display text-xl font-semibold text-white">{legal.terms.title}</h3>
          <div className="mt-4 space-y-4">
            {legal.terms.sections.map((block) => (
              <div key={block.heading}>
                <h4 className="font-medium text-white/90">{block.heading}</h4>
                <p className="mt-1 text-sm">{block.body}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </FunnelSection>
  );
}

export function LandingPage() {
  return (
    <LeadCaptureProvider>
      <LandingPageContent />
    </LeadCaptureProvider>
  );
}

function LandingPageContent() {
  const { openCapture } = useLeadCapture();
  const setTheme = useThemeStore((s) => s.setTheme);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [preferredPackage, setPreferredPackage] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.add("landing-active");
    const stored = useThemeStore.getState().theme;
    setTheme("night");
    return () => {
      document.body.classList.remove("landing-active");
      setTheme(stored);
    };
  }, [setTheme]);

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
    <div className="landing-shell landing-shell--commercial landing-shell--funnel-aggressive relative bg-[var(--app-bg-solid)] text-[var(--app-text)]">

      <FunnelSaleToasts />
      <SalesNav scrolled={scrolled} onOpenCapture={() => openCapture()} />

      <FunnelMarquee />
      <FunnelHeroVsl />
      <FunnelCommunitySection />
      <FunnelSocialProofStrip />
      <FunnelBenefitsSection />

      <FunnelSection id="processo">
        <SectionHeader
          label={copy.process.label}
          title={copy.process.title}
          description={copy.process.subtitle}
        />
        <FunnelPipelineInline />
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-slate-400">{copy.process.punchline}</p>
        <ProcessTimeline />
      </FunnelSection>

      <FunnelSection id="entregas">
        <SectionHeader
          label={copy.deliverables.label}
          title={copy.deliverables.title}
          description={copy.deliverables.subtitle}
        />
        <ul className="mt-8 grid gap-2 sm:grid-cols-2">
          {copy.deliverables.items.map((item) => (
            <li key={item} className="funnel-benefit-card flex gap-2 px-4 py-3 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-white/45">{copy.deliverables.note}</p>
      </FunnelSection>

      <FunnelTopicsStrip />

      <FunnelSection id="pacotes">
        <SectionHeader label={copy.packages.label} title={copy.packages.title} description={copy.packages.subtitle} />
        <OfferPackages />
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-slate-400">{copy.pricing.disclaimer}</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {copy.commercialTerms.items.map((term) => (
            <div key={term.title} className="funnel-benefit-card p-5">
              <h4 className="font-display text-base font-semibold text-white">{term.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{term.body}</p>
            </div>
          ))}
        </div>
      </FunnelSection>

      <FunnelGuaranteeSection />

      <FunnelSection narrow id="faq">
        <SectionHeader label="FAQ" title="Dúvidas frequentes" align="center" className="mx-auto" />
        <div className="mt-10 space-y-3">
          {copy.faq.map((item) => (
            <details key={item.q} className="funnel-benefit-card group p-5 open:border-emerald-500/30">
              <summary className="cursor-pointer list-none font-medium text-white marker:content-none group-open:text-emerald-300">
                {item.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>
      </FunnelSection>

      <FunnelSection id="contato" className="scroll-mt-28">
        <div id="formulario" className="funnel-benefit-card overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
              <p className="section-label">{copy.cta.formTitle}</p>
              <h2 className="mt-4 font-display text-2xl font-bold text-white md:text-3xl">{copy.cta.title}</h2>
              <p className="mt-3 text-sm text-slate-400">{copy.cta.subtitle}</p>
              {MEETING_URL ? (
                <a
                  href={MEETING_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary mt-6 inline-flex text-sm"
                >
                  Agendar videoconferência
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              ) : null}
            </div>
            <form className="space-y-4 p-6 sm:p-8 lg:p-10" onSubmit={onLeadSubmit}>
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
      </FunnelSection>

      <LegalSection />
      <p className="landing-container border-t border-white/10 py-8 text-center text-[11px] leading-relaxed text-white/40">
        {LAUNCH_FUNNEL_COPY.disclaimer}
      </p>
      <SalesFooter />
      <FunnelStickyCta />
    </div>
  );
}
