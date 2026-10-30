import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Mail,
  Radio,
  Shield,
  Sparkles,
  Video
} from "lucide-react";
import { LEGAL_NOTICES, MARKETING_COPY, SEED_LAUNCH_COPY, SEED_LAUNCH_PATH } from "@ederson-agencia/shared";
import { BrandLogo } from "../components/brand/BrandLogo";
import { MoodSection } from "../components/landing/MoodSection";
import { Reveal } from "../components/landing/Reveal";
import { SectionHeader } from "../components/landing/SectionHeader";
import { usePageMood } from "../hooks/usePageMood";
import { apiPost } from "../api";
import { ThemeToggle } from "../components/theme/ThemeToggle";
import { scrollToLandingTop } from "../lib/landing-scroll";

const copy = SEED_LAUNCH_COPY;
const legal = LEGAL_NOTICES;
const brand = MARKETING_COPY.brand;

function SeedNav({ scrolled }: { scrolled: boolean }) {
  return (
    <header
      className={`site-nav fixed inset-x-0 top-0 z-50 border-b transition duration-700 ${
        scrolled ? "is-scrolled border-white/10 bg-black/88" : "border-transparent bg-black/40"
      } backdrop-blur-xl`}
    >
      <div className="landing-container">
        <div className="flex items-center justify-between gap-2 py-3 sm:py-3.5">
          <Link
            to={SEED_LAUNCH_PATH}
            className="shrink-0"
            aria-label={`${brand} — ${copy.meta.title}`}
            onClick={() => scrollToLandingTop()}
          >
            <BrandLogo size="sm" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Seções do lançamento">
            {copy.nav.map((item) => (
              <a key={item.href} href={item.href} className="btn-ghost px-2 text-sm">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle compact />
            <Link to="/" className="btn-ghost hidden text-sm sm:inline-flex">
              {copy.footer.backHome}
            </Link>
            <a href="#inscricao" className="btn-primary inline-flex min-h-11 items-center px-3 py-2 text-xs sm:text-sm">
              Inscrição
            </a>
          </div>
        </div>
        <nav
          className="-mx-1 flex gap-1 overflow-x-auto border-t border-white/[0.06] py-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Seções (mobile)"
        >
          {copy.nav.map((item) => (
            <a key={item.href} href={item.href} className="btn-ghost shrink-0 whitespace-nowrap px-2 text-xs">
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SeedLaunchPage() {
  const [scrolled, setScrolled] = useState(false);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  usePageMood();

  useEffect(() => {
    document.title = copy.meta.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", copy.meta.description);
  }, []);

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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setLeadStatus("Marque o consentimento LGPD para enviar.");
      return;
    }
    setSubmitting(true);
    setLeadStatus(null);
    const form = new FormData(event.currentTarget);
    const challenge = String(form.get("challenge") ?? "").trim();
    const message = [
      "[Funil: Lançamento Semente — App do Zero ao Lançamento]",
      `[Intenção: inscrição aula gratuita]`,
      challenge ? `\nDesafio informado:\n${challenge}` : "",
      `\n[LGPD: consentimento em ${new Date().toISOString()}]`
    ].join("");

    try {
      const res = await apiPost<{ message: string }>("/public/leads", {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        company: form.get("company"),
        message
      });
      setLeadStatus(`${res.message} ${copy.form.successHint}`);
      event.currentTarget.reset();
      setConsent(false);
    } catch (error) {
      setLeadStatus(error instanceof Error ? error.message : "Não foi possível enviar. Tente de novo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="landing-shell surface-light relative bg-[var(--app-bg-solid)] text-[var(--app-text)]">
      <div className="pointer-events-none fixed inset-0 cinema-grid opacity-[0.14]" aria-hidden />
      <SeedNav scrolled={scrolled} />

      <section
        id="topo"
        data-mood-track="trust"
        className="pro-hero scroll-mt-0 relative overflow-hidden pb-10 pt-[calc(var(--hero-nav-offset,6rem)+0.75rem)] sm:pb-12 lg:pb-14"
      >
        <div className="mesh-hero pointer-events-none absolute inset-0" aria-hidden />
        <div className="mesh-hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="landing-container relative z-[1]">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-12">
            <div className="flex min-w-0 flex-col gap-4 md:gap-5">
              <div className="inline-flex w-fit flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
                <Radio className="h-3.5 w-3.5 shrink-0 text-sky-400" aria-hidden />
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/80 sm:text-[11px]">
                  {copy.event.badge}
                </span>
              </div>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sky-200/90">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0" aria-hidden />
                  {copy.event.dateLine}
                </span>
                <span className="hidden text-white/30 sm:inline" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1.5 text-white/65">
                  <Clock className="h-4 w-4 shrink-0" aria-hidden />
                  {copy.event.duration}
                </span>
              </p>
              <h1 className="hero-title max-w-[22ch] text-balance">
                <span className="hero-title-gradient">{copy.hero.title}</span>
              </h1>
              <p className="max-w-[36rem] text-base leading-relaxed text-white/70 sm:text-lg">{copy.hero.subtitle}</p>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                <a href="#inscricao" className="btn-primary btn-glow group w-full px-5 py-3 sm:w-auto">
                  {copy.hero.ctaPrimary}
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
                </a>
                <a href="#aquecimento" className="btn-secondary w-full px-5 py-3 sm:w-auto">
                  {copy.hero.ctaSecondary}
                </a>
              </div>
              <p className="text-xs text-white/50">{copy.hero.trustLine}</p>
            </div>

            <div className="pro-mockup-ring rounded-2xl p-[1px]">
              <div className="pro-mockup pro-mockup--chrome surface-dark overflow-hidden rounded-[15px]">
                <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-2.5">
                  <Video className="h-4 w-4 text-sky-400" aria-hidden />
                  <span className="font-mono text-[10px] text-white/50">Live · App do Zero ao Lançamento</span>
                </div>
                <div className="space-y-4 bg-gradient-to-b from-[#0f172a] to-[#070b14] p-6 sm:p-8">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-sky-300/80">{copy.live.label}</p>
                  <ul className="space-y-2.5 text-sm leading-relaxed text-white/75">
                    {copy.live.bullets.slice(0, 3).map((line) => (
                      <li key={line} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/90" aria-hidden />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="rounded-xl border border-dashed border-white/15 p-3 text-xs leading-relaxed text-white/45">
                    {copy.event.format}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MoodSection mood="energy" id="aula" className="landing-section-y scroll-mt-28">
        <div className="landing-container">
          <SectionHeader label={copy.avatar.label} title={copy.avatar.title} />
          <ul className="mt-8 grid gap-3 lg:grid-cols-3">
            {copy.avatar.items.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel)] p-5 shadow-sm"
              >
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--mood-accent)]" aria-hidden />
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-[var(--app-text-muted)]">{copy.avatar.notFor}</p>

          <SectionHeader
            className="mt-16"
            label={copy.live.label}
            title={copy.live.title}
            description={copy.live.note}
          />
          <ul className="mt-8 space-y-3">
            {copy.live.bullets.map((line) => (
              <li
                key={line}
                className="flex gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-panel)]/80 px-4 py-3 text-sm leading-relaxed"
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mood-accent)]" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </MoodSection>

      <MoodSection mood="logic" id="aquecimento" className="landing-section-y scroll-mt-28">
        <div className="landing-container">
          <SectionHeader label={copy.cpl.label} title={copy.cpl.title} description={copy.cpl.subtitle} />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {copy.cpl.items.map((item, i) => (
              <Reveal key={item.step} delayMs={i * 80}>
                <article className="panel h-full p-6">
                  <p className="font-mono text-xs uppercase tracking-widest text-blue-glow">{item.step}</p>
                  <h3 className="mt-3 font-display text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{item.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </MoodSection>

      <MoodSection mood="desire" id="prova" className="landing-section-y scroll-mt-28">
        <div className="landing-container">
          <SectionHeader label={copy.proof.label} title={copy.proof.title} />
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {copy.proof.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-panel)] p-6 text-center"
              >
                <p className="font-display text-4xl font-bold text-[var(--mood-accent)]">{stat.value}</p>
                <p className="mt-1 text-sm font-medium">{stat.label}</p>
                <p className="mt-1 text-xs text-[var(--app-text-muted)]">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </MoodSection>

      <MoodSection mood="calm" className="landing-section-y">
        <div className="landing-container max-w-3xl">
          <p className="section-label text-center">Dúvidas</p>
          <div className="mt-8 space-y-3">
            {copy.faq.map((item) => (
              <details key={item.q} className="panel group p-5 open:border-white/20">
                <summary className="cursor-pointer list-none font-medium marker:content-none group-open:text-blue-glow">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </MoodSection>

      <MoodSection mood="commit" id="inscricao" className="landing-section-y scroll-mt-28">
        <div className="landing-container max-w-4xl">
          <div className="panel-glow overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="border-b border-blue-matte/20 p-8 lg:border-b-0 lg:border-r lg:p-12">
                <Reveal>
                  <p className="section-label">{copy.form.label}</p>
                  <h2 className="mt-4 font-display text-3xl font-bold">{copy.form.title}</h2>
                  <p className="mt-4 text-white/60">{copy.form.subtitle}</p>
                  <ul className="mt-6 space-y-2 text-sm text-white/55">
                    <li className="flex gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-blue-glow" aria-hidden />
                      {copy.event.format}
                    </li>
                    <li className="flex gap-2">
                      <Shield className="h-4 w-4 shrink-0 text-blue-glow" aria-hidden />
                      Sem exibir preços nesta etapa — apenas inscrição na aula.
                    </li>
                  </ul>
                  <p className="mt-6 text-xs leading-relaxed text-white/40">{legal.shortDisclaimer}</p>
                </Reveal>
              </div>
              <form className="space-y-4 p-8 lg:p-12" onSubmit={onSubmit}>
                <input type="hidden" name="intent" value="seed-launch-class" />
                <input className="input" name="name" placeholder="Nome completo" required autoComplete="name" />
                <input className="input" type="email" name="email" placeholder="E-mail" required autoComplete="email" />
                <input
                  className="input"
                  name="phone"
                  placeholder="WhatsApp (com DDD)"
                  required
                  autoComplete="tel"
                />
                <input className="input" name="company" placeholder="Empresa (opcional)" autoComplete="organization" />
                <textarea
                  className="input min-h-24"
                  name="challenge"
                  placeholder={copy.form.fields.challenge}
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
                  {submitting ? "Enviando…" : copy.form.submit}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                {leadStatus ? <p className="text-sm text-blue-glow">{leadStatus}</p> : null}
              </form>
            </div>
          </div>
        </div>
      </MoodSection>

      <MoodSection mood="legal" id="privacidade" className="landing-section-y !py-12">
        <div className="landing-container max-w-3xl">
          <article className="panel scroll-mt-28 p-6 md:p-8">
            <h3 className="font-display text-lg font-semibold">{legal.privacy.title}</h3>
            <p className="mt-2 text-xs text-white/45">{legal.privacy.updated}</p>
            <div className="legal-doc mt-4 space-y-3 text-sm text-white/60">
              {legal.privacy.sections.slice(0, 2).map((block) => (
                <div key={block.heading}>
                  <h4 className="font-medium text-white/85">{block.heading}</h4>
                  <p className="mt-1">{block.body}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </MoodSection>

      <footer className="landing-footer border-t border-white/10 py-10">
        <div className="landing-container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <BrandLogo size="sm" />
            <p className="mt-2 text-xs text-white/45">{copy.footer.institutionalNote}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link to="/" className="text-white/50 hover:text-blue-glow">
              {copy.footer.backHome}
            </Link>
            <a href="#inscricao" className="text-brand-primary hover:underline">
              Inscrição gratuita
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
