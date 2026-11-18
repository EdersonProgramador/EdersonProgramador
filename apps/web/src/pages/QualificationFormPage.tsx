import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import {
  BR_UF_OPTIONS,
  LEGAL_NOTICES,
  QUALIFICATION_FORM_COPY,
  QUALIFICATION_STEP_ORDER,
  type QualificationAnswerKey
} from "@ederson-agencia/shared";
import { BrandLogo } from "../components/brand/BrandLogo";
import { ApiError, apiPost } from "../api";
import "../styles/qualification-form.css";

const copy = QUALIFICATION_FORM_COPY;
const legal = LEGAL_NOTICES;

type Answers = Partial<Record<QualificationAnswerKey, string>>;
type Phase = "welcome" | "quiz" | "success";

function labelForAnswer(key: QualificationAnswerKey, value: string) {
  const q = copy.questions[key];
  if (key === "state") {
    return BR_UF_OPTIONS.find((uf) => uf.value === value)?.label ?? value;
  }
  if ("options" in q) {
    return q.options.find((opt) => opt.value === value)?.label ?? value;
  }
  return value;
}

function buildLeadMessage(answers: Answers) {
  const lines = [
    "[Quiz de diagnóstico — /formulario]",
    "",
    "— Demográficos —",
    `Sexo: ${labelForAnswer("sex", answers.sex ?? "")}`,
    `Idade: ${labelForAnswer("age", answers.age ?? "")}`,
    `Estado: ${labelForAnswer("state", answers.state ?? "")}`,
    "",
    "— Tempo / consciência —",
    `Há quanto tempo me conhece: ${labelForAnswer("knowHowLong", answers.knowHowLong ?? "")}`,
    `Sabe criar e lançar produto digital do zero: ${labelForAnswer("productAwareness", answers.productAwareness ?? "")}`,
    "",
    "— Específicos —",
    `Perfil: ${labelForAnswer("profile", answers.profile ?? "")}`,
    `Experiência em marketing: ${labelForAnswer("marketingExperience", answers.marketingExperience ?? "")}`,
    "",
    "— Objetivos —",
    answers.goals?.trim() ?? "",
    "",
    "— Obstáculos —",
    answers.obstacles?.trim() ?? "",
    "",
    `LGPD: consentimento em ${new Date().toISOString()}`
  ];
  return lines.join("\n");
}

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isStepValid(key: QualificationAnswerKey, answers: Answers) {
  const q = copy.questions[key];
  const raw = (answers[key] ?? "").trim();
  if (!raw) return false;
  if (q.type === "email") return isEmailValid(raw);
  if (q.type === "tel") return raw.replace(/\D/g, "").length >= 8;
  if (q.type === "textarea" || q.type === "text") {
    const min = "minLength" in q && typeof q.minLength === "number" ? q.minLength : 2;
    return raw.length >= min;
  }
  return true;
}

export function QualificationFormPage() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const stepKey = QUALIFICATION_STEP_ORDER[stepIndex];
  const question = copy.questions[stepKey];
  const total = QUALIFICATION_STEP_ORDER.length;
  const progress = phase === "success" ? 100 : phase === "welcome" ? 0 : Math.round(((stepIndex + 1) / total) * 100);
  const sectionLabel = copy.sections[question.section];
  const isLast = stepIndex === total - 1;

  useEffect(() => {
    const prevLang = document.documentElement.lang;
    document.title = copy.meta.title;
    document.documentElement.lang = "pt-BR";
    document.body.classList.add("landing-active");
    return () => {
      document.documentElement.lang = prevLang || "pt-BR";
      document.body.classList.remove("landing-active");
    };
  }, []);

  const canContinue = useMemo(() => {
    if (!isStepValid(stepKey, answers)) return false;
    if (isLast && !consent) return false;
    return true;
  }, [answers, consent, isLast, stepKey]);

  function goToStep(next: number) {
    setError(null);
    setStepIndex(next);
    setAnimKey((k) => k + 1);
  }

  function setAnswer(key: QualificationAnswerKey, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function onSelectChoice(value: string) {
    setAnswer(stepKey, value);
    if (isLast) return;
    window.setTimeout(() => goToStep(stepIndex + 1), 220);
  }

  function onBack() {
    if (phase === "quiz" && stepIndex === 0) {
      setPhase("welcome");
      setError(null);
      return;
    }
    if (stepIndex > 0) goToStep(stepIndex - 1);
  }

  async function onSubmit() {
    if (!canContinue) {
      setError(isLast && !consent ? legal.formConsentLabel : copy.openRequiredHint);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: answers.name?.trim() ?? "",
        email: answers.email?.trim() ?? "",
        phone: answers.phone?.trim() ?? "",
        message: buildLeadMessage(answers)
      };
      // Preferência: source dedicada. Fallback: APIs ainda sem o enum (ex.: Render).
      try {
        await apiPost<{ message: string }>("/public/leads", {
          ...payload,
          source: "qualification_quiz"
        });
      } catch (err) {
        const enumRejected =
          err instanceof ApiError &&
          /qualification_quiz|Invalid enum value/i.test(err.message);
        if (!enumRejected) throw err;
        await apiPost<{ message: string }>("/public/leads", {
          ...payload,
          source: "landing"
        });
      }
      setPhase("success");
      setAnimKey((k) => k + 1);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Não foi possível enviar. Tente novamente.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function onNext() {
    if (!isStepValid(stepKey, answers)) {
      setError(
        question.type === "choice" || question.type === "select"
          ? copy.requiredHint
          : stepKey === "name" || stepKey === "email" || stepKey === "phone"
            ? copy.contactRequiredHint
            : copy.openRequiredHint
      );
      return;
    }
    if (isLast) {
      void onSubmit();
      return;
    }
    goToStep(stepIndex + 1);
  }

  return (
    <div className="qf-shell" lang="pt-BR">
      <div className="qf-frame">
        <header className="qf-top">
          <Link to="/" aria-label={`${copy.brand} — início`}>
            <BrandLogo size="sm" interactive={false} />
          </Link>
          {phase === "quiz" ? (
            <div className="qf-progress" aria-label={copy.progressLabel}>
              <div className="qf-progress__meta">
                <span>{sectionLabel}</span>
                <span>
                  {stepIndex + 1}/{total}
                </span>
              </div>
              <div className="qf-progress__track">
                <div className="qf-progress__fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400/80">{copy.kicker}</p>
          )}
        </header>

        <main className="qf-stage">
          {phase === "welcome" ? (
            <section className="qf-card qf-enter" key={`welcome-${animKey}`}>
              <p className="qf-kicker">{copy.kicker}</p>
              <h1 className="qf-title">{copy.welcomeTitle}</h1>
              <p className="qf-body">{copy.welcomeBody}</p>
              <div className="qf-actions">
                <span />
                <button
                  type="button"
                  className="qf-btn qf-btn--primary"
                  onClick={() => {
                    setPhase("quiz");
                    setAnimKey((k) => k + 1);
                  }}
                >
                  {copy.welcomeCta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </section>
          ) : null}

          {phase === "quiz" ? (
            <section className="qf-card qf-enter" key={`${stepKey}-${animKey}`}>
              <p className="qf-kicker">{sectionLabel}</p>
              <h1 className="qf-title">{question.label}</h1>
              {"hint" in question && question.hint ? <p className="qf-hint">{question.hint}</p> : null}

              {question.type === "choice" ? (
                <div className="qf-options" role="radiogroup" aria-label={question.label}>
                  {question.options.map((opt) => {
                    const selected = answers[stepKey] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`qf-option${selected ? " is-selected" : ""}`}
                        onClick={() => onSelectChoice(opt.value)}
                      >
                        <span className="qf-option__bullet" aria-hidden>
                          <span className="qf-option__bullet-dot" />
                        </span>
                        <span className="qf-option__label">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {question.type === "select" ? (
                <div className="qf-field">
                  <select
                    className="qf-select"
                    value={answers.state ?? ""}
                    aria-label={question.label}
                    onChange={(e) => setAnswer("state", e.target.value)}
                  >
                    <option value="">{question.placeholder}</option>
                    {BR_UF_OPTIONS.map((uf) => (
                      <option key={uf.value} value={uf.value}>
                        {uf.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {question.type === "text" || question.type === "email" || question.type === "tel" ? (
                <div className="qf-field">
                  <input
                    className="qf-input"
                    type={question.type}
                    name={stepKey}
                    value={answers[stepKey] ?? ""}
                    placeholder={question.placeholder}
                    autoComplete={"autoComplete" in question ? question.autoComplete : undefined}
                    lang="pt-BR"
                    spellCheck={question.type === "text"}
                    autoCorrect={question.type === "text" ? "on" : "off"}
                    autoCapitalize={question.type === "text" ? "sentences" : "off"}
                    autoFocus
                    onChange={(e) => setAnswer(stepKey, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onNext();
                      }
                    }}
                  />
                </div>
              ) : null}

              {question.type === "textarea" ? (
                <div className="qf-field">
                  <textarea
                    className="qf-textarea"
                    name={stepKey}
                    value={answers[stepKey] ?? ""}
                    placeholder={question.placeholder}
                    lang="pt-BR"
                    spellCheck
                    autoCorrect="on"
                    autoCapitalize="sentences"
                    autoFocus
                    onChange={(e) => setAnswer(stepKey, e.target.value)}
                  />
                </div>
              ) : null}

              {isLast ? (
                <label className="qf-consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      setError(null);
                    }}
                  />
                  <span>{legal.formConsentLabel}</span>
                </label>
              ) : null}

              {error ? <p className="qf-error">{error}</p> : null}

              <div className="qf-actions">
                <button type="button" className="qf-btn qf-btn--ghost" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  {copy.back}
                </button>
                {question.type === "choice" && !isLast ? (
                  <button
                    type="button"
                    className="qf-btn qf-btn--primary"
                    disabled={!answers[stepKey]}
                    onClick={onNext}
                  >
                    {copy.next}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="qf-btn qf-btn--primary"
                    disabled={submitting || (isLast ? !canContinue : !isStepValid(stepKey, answers))}
                    onClick={onNext}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : isLast ? (
                      copy.submit
                    ) : (
                      <>
                        {copy.next}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </>
                    )}
                  </button>
                )}
              </div>
            </section>
          ) : null}

          {phase === "success" ? (
            <section className="qf-card qf-enter" key={`success-${animKey}`}>
              <div className="qf-success-icon" aria-hidden>
                <Check className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <h1 className="qf-title">{copy.successTitle}</h1>
              <p className="qf-body">{copy.successBody}</p>
              <div className="qf-actions">
                <Link to="/" className="qf-btn qf-btn--primary qf-btn--block">
                  {copy.successCta}
                </Link>
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
