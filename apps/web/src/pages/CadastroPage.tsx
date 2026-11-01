import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Check, Eye, EyeOff, Lock, Mail, Phone, User, Users } from "lucide-react";
import { CADASTRO_COPY, CADASTRO_PATH, LEGAL_NOTICES, MARKETING_COPY } from "@ederson-agencia/shared";
import { CadastroMediaSlot } from "../components/cadastro/CadastroMediaSlot";
import { BrandLogo } from "../components/brand/BrandLogo";
import { streamEmbedUrl } from "../components/portal/funnel-ui";
import { apiGet, apiPost, type LoginResponse } from "../api";
import { useAuthStore } from "../stores/authStore";
import "../styles/cadastro-page.css";

const copy = CADASTRO_COPY;
const legal = LEGAL_NOTICES;

type PublicFunnelLive = {
  live: {
    title: string;
    subtitle: string | null;
    scheduledAt: string | null;
    streamUrl: string | null;
    replayUrl: string | null;
  } | null;
};

function Marquee() {
  const items = [...copy.marquee, ...copy.marquee, ...copy.marquee];
  return (
    <div className="cadastro-marquee" aria-hidden>
      <div className="cadastro-marquee__track">
        {items.map((label, i) => (
          <span key={`${label}-${i}`}>
            {label} <span className="opacity-60">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function InfoBar({ dates }: { dates: string }) {
  return (
    <div className="cadastro-info-bar" role="group" aria-label="Data e formato da aula">
      <div className="cadastro-info-bar__cell">{dates}</div>
      <div className="cadastro-info-bar__cell">{copy.urgency.time}</div>
      <div className="cadastro-info-bar__cell cadastro-info-bar__cell--free">{copy.urgency.free}</div>
      <div className="cadastro-info-bar__cell cadastro-info-bar__cell--live">{copy.urgency.liveTag}</div>
    </div>
  );
}

function LimitedBanner() {
  return (
    <p className="cadastro-limited rounded-lg border px-4 py-3 text-center text-sm font-medium">
      <Users className="mr-1.5 inline h-4 w-4 -translate-y-px" aria-hidden />
      {copy.urgency.limited}
    </p>
  );
}

function CadastroField({
  id,
  label,
  icon: Icon,
  children
}: {
  id: string;
  label: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="cadastro-form__field">
      <label className="cadastro-form__label" htmlFor={id}>
        {label}
      </label>
      <div className="cadastro-form__control">
        <Icon className="cadastro-form__icon" aria-hidden />
        {children}
      </div>
    </div>
  );
}

function SignupForm({
  formId,
  consent,
  setConsent,
  submitting,
  status,
  onSubmit
}: {
  formId: string;
  consent: boolean;
  setConsent: (v: boolean) => void;
  submitting: boolean;
  status: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const statusIsError =
    status !== null &&
    !status.includes("Redirecionando") &&
    !status.toLowerCase().includes("sucesso");

  const passwordsMismatch =
    passwordConfirm.length > 0 && password.length > 0 && password !== passwordConfirm;

  return (
    <form
      id={formId}
      className="cadastro-form mx-auto max-w-md space-y-4 p-5 sm:p-6"
      onSubmit={onSubmit}
      noValidate
    >
      <header className="cadastro-form__intro text-center">
        <h2 className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">{copy.form.title}</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-white/50 sm:text-sm">{copy.form.subtitle}</p>
      </header>

      <div className="space-y-3">
        <CadastroField id={`${formId}-name`} label="Nome completo" icon={User}>
          <input
            id={`${formId}-name`}
            className="cadastro-form__input"
            name="name"
            placeholder={copy.form.fields.name}
            required
            autoComplete="name"
            disabled={submitting}
          />
        </CadastroField>

        <CadastroField id={`${formId}-email`} label="E-mail" icon={Mail}>
          <input
            id={`${formId}-email`}
            className="cadastro-form__input"
            type="email"
            name="email"
            placeholder={copy.form.fields.email}
            required
            autoComplete="email"
            inputMode="email"
            disabled={submitting}
          />
        </CadastroField>

        <CadastroField id={`${formId}-phone`} label="WhatsApp" icon={Phone}>
          <input
            id={`${formId}-phone`}
            className="cadastro-form__input"
            type="tel"
            name="phone"
            placeholder={copy.form.fields.phone}
            required
            autoComplete="tel"
            inputMode="tel"
            disabled={submitting}
          />
        </CadastroField>
      </div>

      <fieldset className="cadastro-form__password">
        <legend className="cadastro-form__password-legend">{copy.form.passwordLegend}</legend>
        <div className="space-y-3">
          <CadastroField id={`${formId}-password`} label="Senha" icon={Lock}>
            <input
              id={`${formId}-password`}
              className="cadastro-form__input"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={copy.form.fields.password}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              aria-describedby={passwordsMismatch ? `${formId}-pwd-hint` : undefined}
            />
          </CadastroField>
          <CadastroField id={`${formId}-passwordConfirm`} label="Confirmar senha" icon={Lock}>
            <input
              id={`${formId}-passwordConfirm`}
              className="cadastro-form__input"
              type={showPassword ? "text" : "password"}
              name="passwordConfirm"
              placeholder={copy.form.fields.passwordConfirm}
              required
              minLength={6}
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              disabled={submitting}
              aria-invalid={passwordsMismatch}
              aria-describedby={passwordsMismatch ? `${formId}-pwd-hint` : undefined}
            />
          </CadastroField>
          <button
            type="button"
            className="cadastro-form__toggle-pwd"
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            {showPassword ? "Ocultar senhas" : "Mostrar senhas"}
          </button>
          {passwordsMismatch ? (
            <p id={`${formId}-pwd-hint`} className="cadastro-form__hint cadastro-form__hint--error" role="status">
              As senhas precisam ser iguais.
            </p>
          ) : passwordConfirm.length >= 6 && password === passwordConfirm ? (
            <p className="cadastro-form__hint cadastro-form__hint--ok" role="status">
              Senhas conferem.
            </p>
          ) : null}
        </div>
      </fieldset>

      <CadastroField id={`${formId}-company`} label="Empresa (opcional)" icon={Building2}>
        <input
          id={`${formId}-company`}
          className="cadastro-form__input"
          name="company"
          placeholder={copy.form.fields.company}
          autoComplete="organization"
          disabled={submitting}
        />
      </CadastroField>

      <div className="cadastro-form__field">
        <label className="cadastro-form__label" htmlFor={`${formId}-challenge`}>
          Seu desafio (opcional)
        </label>
        <textarea
          id={`${formId}-challenge`}
          className="cadastro-form__input cadastro-form__input--area"
          name="challenge"
          placeholder={copy.form.fields.challenge}
          rows={3}
          disabled={submitting}
        />
      </div>

      <label className="cadastro-form__consent">
        <input
          type="checkbox"
          className="cadastro-form__checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          disabled={submitting}
        />
        <span>
          {legal.formConsentLabel}{" "}
          <a href="#privacidade" className="text-sky-400 underline-offset-2 hover:underline">
            Privacidade
          </a>
        </span>
      </label>

      <button
        type="submit"
        className="cadastro-form__submit"
        disabled={submitting || passwordsMismatch}
      >
        {submitting ? "Enviando…" : copy.form.submit}
      </button>

      {status ? (
        <p
          className={`cadastro-form__status ${statusIsError ? "cadastro-form__status--error" : "cadastro-form__status--ok"}`}
          role="alert"
          aria-live="polite"
        >
          {status}
        </p>
      ) : null}

      <p className="cadastro-form__login-hint">
        Já tem conta?{" "}
        <Link to="/login" className="text-sky-400 underline-offset-2 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

export function CadastroPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [publishedLive, setPublishedLive] = useState<PublicFunnelLive["live"]>(null);

  useEffect(() => {
    document.title = copy.meta.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", copy.meta.description);
    document.body.classList.add("landing-active");
    return () => document.body.classList.remove("landing-active");
  }, []);

  useEffect(() => {
    void apiGet<PublicFunnelLive>("/public/agency-funnel")
      .then((res) => setPublishedLive(res.live))
      .catch(() => setPublishedLive(null));
  }, []);

  const videoEmbed = useMemo(() => {
    const url = publishedLive?.replayUrl || publishedLive?.streamUrl || "";
    return url ? streamEmbedUrl(url) : null;
  }, [publishedLive?.replayUrl, publishedLive?.streamUrl]);

  const dateLine = useMemo(() => {
    if (!publishedLive?.scheduledAt) return copy.urgency.dates;
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        timeZone: "America/Sao_Paulo"
      })
        .format(new Date(publishedLive.scheduledAt))
        .toUpperCase();
    } catch {
      return copy.urgency.dates;
    }
  }, [publishedLive?.scheduledAt]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setLeadStatus("Marque o consentimento LGPD para continuar.");
      return;
    }
    setSubmitting(true);
    setLeadStatus(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const passwordConfirm = String(form.get("passwordConfirm") ?? "");
    if (password.length < 6) {
      setLeadStatus("A senha deve ter pelo menos 6 caracteres.");
      setSubmitting(false);
      return;
    }
    if (password !== passwordConfirm) {
      setLeadStatus("As senhas não coincidem.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await apiPost<LoginResponse & { message: string }>("/public/cadastro/signup", {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        company: form.get("company"),
        password,
        challenge: String(form.get("challenge") ?? "").trim() || undefined,
        acceptTerms: true as const
      });
      setSession("agency", res);
      event.currentTarget.reset();
      setConsent(false);
      navigate(res.homePath ?? "/agencia/cliente", { replace: true });
    } catch (error) {
      setLeadStatus(error instanceof Error ? error.message : "Não foi possível cadastrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="cadastro-page min-h-screen">
      <Marquee />

      <header className="border-b border-white/10 px-4 py-6 text-center">
        <Link to={CADASTRO_PATH} className="mb-6 inline-flex justify-center" aria-label={MARKETING_COPY.brand}>
          <BrandLogo size="sm" />
        </Link>
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-sky-400/90">{copy.workshop.badge}</p>
        <h1 className="cadastro-workshop-title mt-3">
          <span className="cadastro-workshop-title__line1 block">{copy.workshop.titleLine1}</span>
          <span className="cadastro-workshop-title__line2 block">{copy.workshop.titleLine2}</span>
        </h1>
        <div className="cadastro-header-block mx-auto mt-4 max-w-3xl">
          <InfoBar dates={dateLine} />
        </div>
        <div className="cadastro-descriptive-headline mx-auto mt-5 max-w-2xl">
          <p className="cadastro-descriptive-headline__lead">{copy.descriptiveHeadline}</p>
          <p className="cadastro-descriptive-headline__support">{copy.descriptiveHeadlineSupport}</p>
        </div>
      </header>

      <main className="landing-container space-y-10 py-8 sm:py-10">
        <section className="cadastro-vsl-block space-y-4" aria-label="Vídeo de apresentação">
          <div className="cadastro-vsl">
            {videoEmbed ? (
              <iframe
                title={publishedLive?.title ?? copy.video.fallbackTitle}
                src={`${videoEmbed}?rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <CadastroMediaSlot slot={{ ...copy.images.vslPoster, variant: "video" }} />
            )}
          </div>
          <div className="cadastro-vsl-headline mx-auto max-w-2xl text-center">
            <p className="cadastro-vsl-headline__hint">{copy.video.unmuteHint}</p>
            <p className="cadastro-vsl-headline__lead">{copy.video.explanatoryHeadline}</p>
            <p className="cadastro-vsl-headline__support">{copy.video.explanatorySupport}</p>
          </div>
        </section>

        <section id="cadastro" className="scroll-mt-8 space-y-4">
          <SignupForm
            formId="cadastro-form"
            consent={consent}
            setConsent={setConsent}
            submitting={submitting}
            status={leadStatus}
            onSubmit={onSubmit}
          />
          <LimitedBanner />
        </section>

        <section className="space-y-4 text-center">
          <InfoBar dates={dateLine} />
          <p className="text-lg font-semibold leading-snug text-white/90">{copy.hero.lead}</p>
          <p className="text-base leading-relaxed text-white/65">{copy.hero.hook}</p>
          <p className="text-base leading-relaxed text-white/55">{copy.hero.body}</p>
          <ul className="mx-auto max-w-xl space-y-2 text-left text-sm text-white/75">
            {copy.hero.bullets.map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-6">
          <InfoBar dates={dateLine} />
          <div className="grid gap-4 md:grid-cols-2">
            {copy.hosts.map((host, index) => {
              const hostImage =
                index === 0 ? copy.images.hostPrimary : copy.images.hostSecondary;
              return (
                <article key={host.name} className="cadastro-host cadastro-host--with-media">
                  <CadastroMediaSlot slot={{ ...hostImage, variant: "portrait" }} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400/90">{host.tag}</p>
                    <h2 className="mt-2 font-display text-xl font-bold text-white">{host.name}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{host.bio}</p>
                    <p className="cadastro-host__stat mt-4">{host.stat.value}</p>
                    <p className="text-xs uppercase tracking-wide text-white/45">{host.stat.label}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {copy.stats.map((stat) => (
            <div key={stat.label} className="cadastro-stat">
              <p className="font-display text-3xl font-bold text-sky-400">{stat.value}</p>
              <p className="mt-1 text-sm font-semibold text-white/85">{stat.label}</p>
              <p className="text-xs text-white/45">{stat.detail}</p>
            </div>
          ))}
        </section>

        <section className="space-y-6 text-center">
          <p className="text-base leading-relaxed text-white/60">{copy.closing}</p>
          <a href="#cadastro" className="cadastro-form__submit inline-flex max-w-md justify-center">
            {copy.form.submitSticky}
          </a>
        </section>

        <section id="privacidade" className="cadastro-footer-legal scroll-mt-8 space-y-3">
          <CadastroMediaSlot slot={{ ...copy.images.footerLockup, variant: "footer" }} />
          <BrandLogo size="sm" />
          <p>{copy.footer.copyright}</p>
          <p>{copy.footer.site}</p>
          <div className="flex flex-wrap justify-center gap-3 text-sky-400/90">
            <a href="#privacidade" className="hover:underline">
              {legal.privacy.title}
            </a>
            <Link to="/" className="hover:underline">
              {copy.footer.backHome}
            </Link>
          </div>
          <hr className="border-white/10" />
          <p className="font-medium text-white/55">{copy.footer.disclaimer}</p>
          <p className="text-[11px] italic text-white/35">{copy.footer.metaDisclaimer}</p>
          <div className="legal-doc cadastro-legal-doc mt-4 space-y-3">
            {legal.privacy.sections.slice(0, 2).map((block) => (
              <div key={block.heading}>
                <h4 className="cadastro-legal-doc__heading">{block.heading}</h4>
                <p className="cadastro-legal-doc__body">{block.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <a href="#cadastro" className="cadastro-sticky-cta fixed bottom-4 left-4 right-4 z-40 flex min-h-12 items-center justify-center shadow-lg">
        {copy.form.submitSticky}
      </a>
    </div>
  );
}
