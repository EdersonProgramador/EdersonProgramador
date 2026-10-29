import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Lock, Shield } from "lucide-react";
import {
  ACADEMY_CART,
  ACADEMY_SALES,
  ACADEMY_STORE_PATHS,
  ACADEMY_STORE_BASE
} from "@ederson-agencia/shared";
import { ApiError, apiPost, type LoginResponse } from "../api";
import { normalizeAuthFields, warmAcademyStoreTestAccount } from "../lib/academy-store-auth";
import { AcademyCheckoutSocial } from "../components/academy/AcademyCheckoutSocial";
import { AcademyStoreShell } from "../components/academy/AcademyStoreShell";
import { CourseCover } from "../components/courses/CourseCover";
import { useAcademySession, useAuthStore } from "../stores/authStore";
import {
  cartTotalCents,
  useAcademyCartStore
} from "../stores/academyCartStore";
import "../styles/academy-sales.css";
import "../styles/course-study.css";

const salesCopy = ACADEMY_SALES;

type Step = "account" | "payment";

export function AcademyStoreCheckoutPage() {
  const items = useAcademyCartStore((s) => s.items);
  const couponCode = useAcademyCartStore((s) => s.couponCode);
  const clearCart = useAcademyCartStore((s) => s.clear);
  const academySession = useAcademySession();
  const setSession = useAuthStore((s) => s.setSession);

  const [step, setStep] = useState<Step>(academySession ? "payment" : "account");
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (step === "account") void warmAcademyStoreTestAccount();
  }, [step]);

  if (items.length === 0 && !success) {
    return <Navigate to={ACADEMY_STORE_PATHS.cart} replace />;
  }

  const total = cartTotalCents(items, couponCode);
  const format = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  async function onLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    const fd = new FormData(event.currentTarget);
    try {
      const { email, password } = normalizeAuthFields(fd.get("email"), fd.get("password"));
      await warmAcademyStoreTestAccount();
      const data = await apiPost<LoginResponse>("/auth/login", {
        email,
        password,
        context: "academy"
      });
      setSession("academy", data);
      setStep("payment");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Não foi possível entrar.";
      setAuthError(
        err instanceof ApiError && err.status === 401
          ? `${msg} Se comprou antes sem definir senha, use a aba Cadastrar com o mesmo e-mail para criar a senha.`
          : msg
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function onRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    const fd = new FormData(event.currentTarget);
    try {
      if (fd.get("acceptTerms") !== "on") {
        setAuthError("Aceite os termos para continuar.");
        setAuthLoading(false);
        return;
      }
      const data = await apiPost<LoginResponse>("/public/academy/signup", {
        name: String(fd.get("name") ?? "").trim(),
        email: String(fd.get("email") ?? "").trim(),
        password: String(fd.get("password") ?? ""),
        acceptTerms: true as const
      });
      setSession("academy", {
        ...data,
        homePath: ACADEMY_STORE_PATHS.checkout
      });
      setStep("payment");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Não foi possível cadastrar.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function onPurchase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const fd = new FormData(event.currentTarget);
    const name = String(fd.get("name") ?? academySession?.user.name ?? "");
    const email = String(fd.get("email") ?? academySession?.user.email ?? "");
    const phone = String(fd.get("phone") || "") || undefined;
    const paymentMethod = fd.get("paymentMethod");

    try {
      for (const course of items) {
        await apiPost("/public/academy/purchase", {
          courseSlug: course.slug,
          name,
          email,
          phone,
          paymentMethod,
          acceptTerms: true
        });
      }
      clearCart();
      setSuccess(salesCopy.checkout.successBody);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível concluir a compra.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AcademyStoreShell>
      <main className="academy-checkout mx-auto max-w-6xl px-4 py-10">
        <nav className="mb-8 flex flex-wrap gap-2 text-xs text-white/45" aria-label="Etapas">
          <Link to={ACADEMY_STORE_PATHS.cart} className="hover:text-white">
            {ACADEMY_CART.stepCart}
          </Link>
          <span>/</span>
          <span className={step === "account" ? "text-white" : ""}>{ACADEMY_CART.stepAccount}</span>
          <span>/</span>
          <span className={step === "payment" ? "text-white" : ""}>{ACADEMY_CART.stepPayment}</span>
        </nav>

        <h1 className="text-2xl font-bold">{ACADEMY_CART.checkoutTitle}</h1>
        <p className="mt-2 text-sm text-white/55">
          <Lock className="mr-1 inline h-3.5 w-3.5" aria-hidden />
          {salesCopy.checkout.secureNote}
        </p>

        {success ? (
          <div className="panel mt-8 max-w-lg border-green-500/30 bg-green-500/10 p-6">
            <p className="font-semibold text-green-100">{salesCopy.checkout.successTitle}</p>
            <p className="mt-2 text-sm text-green-100/90">{success}</p>
            <Link to={ACADEMY_STORE_BASE} className="btn-primary mt-6 inline-flex">
              {salesCopy.checkout.backToStore}
            </Link>
          </div>
        ) : (
          <div className="academy-checkout-layout mt-10">
            <aside className="academy-checkout-layout__summary panel order-2 h-fit border-white/10 bg-white/[0.03] p-5 sm:p-6 lg:order-none lg:sticky lg:top-24">
              <h2 className="text-sm font-medium uppercase tracking-wide text-white/50">{salesCopy.checkout.summaryTitle}</h2>
              <ul className="mt-4 space-y-4">
                {items.map((course) => (
                  <li key={course.slug} className="academy-checkout-line">
                    <CourseCover
                      title={course.title}
                      coverUrl={course.coverUrl}
                      className="academy-checkout-line__cover academy-udemy-card__cover rounded-md"
                    />
                    <div className="academy-checkout-line__body min-w-0">
                      <p className="font-semibold leading-snug">{course.title}</p>
                      <p className="mt-2 text-sm font-bold">{format(course.priceCents)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-white/10 pt-4 text-xl font-bold">{format(total)}</p>
              <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-white/50">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden />
                {salesCopy.guarantee.subtitle}
              </p>
            </aside>

            <div className="academy-checkout-layout__main panel order-1 min-w-0 border-white/10 bg-white/[0.03] p-5 sm:p-8 lg:order-none">
              {step === "account" ? (
                <>
                  <h2 className="text-lg font-semibold">{ACADEMY_CART.accountTitle}</h2>
                  <p className="mt-1 text-sm text-white/60">{ACADEMY_CART.accountSubtitle}</p>

                  <div className="academy-checkout-auth mt-6 space-y-6">
                    <AcademyCheckoutSocial onUnavailable={setAuthError} />
                    <p className="text-center text-xs text-white/40">ou continue com e-mail</p>
                  </div>

                  <div className="mt-2 flex rounded-lg border border-white/10 p-1">
                    <button
                      type="button"
                      className={`flex-1 rounded-md py-2 text-sm ${authTab === "login" ? "bg-white/10" : ""}`}
                      onClick={() => setAuthTab("login")}
                    >
                      {ACADEMY_CART.loginTab}
                    </button>
                    <button
                      type="button"
                      className={`flex-1 rounded-md py-2 text-sm ${authTab === "register" ? "bg-white/10" : ""}`}
                      onClick={() => setAuthTab("register")}
                    >
                      {ACADEMY_CART.registerTab}
                    </button>
                  </div>

                  {authTab === "login" ? (
                    <form className="mt-5 space-y-3" onSubmit={(e) => void onLogin(e)}>
                      <input className="input w-full" type="email" name="email" placeholder="E-mail" required disabled={authLoading} />
                      <input className="input w-full" type="password" name="password" placeholder="Senha" required minLength={6} disabled={authLoading} />
                      {authError ? <p className="text-sm text-red-300">{authError}</p> : null}
                      <button type="submit" className="btn-primary academy-sales__cta-primary w-full min-h-12" disabled={authLoading}>
                        {ACADEMY_CART.loginTab}
                      </button>
                    </form>
                  ) : (
                    <form className="mt-5 space-y-3" onSubmit={(e) => void onRegister(e)}>
                      <input className="input w-full" name="name" placeholder="Nome completo" required disabled={authLoading} />
                      <input className="input w-full" type="email" name="email" placeholder="E-mail" required disabled={authLoading} />
                      <input className="input w-full" type="password" name="password" placeholder="Senha (mín. 6)" required minLength={6} disabled={authLoading} />
                      <label className="flex items-start gap-2 text-xs text-white/65">
                        <input type="checkbox" name="acceptTerms" required disabled={authLoading} className="mt-0.5" />
                        {salesCopy.checkout.terms}
                      </label>
                      {authError ? <p className="text-sm text-red-300">{authError}</p> : null}
                      <button type="submit" className="btn-primary academy-sales__cta-primary w-full min-h-12" disabled={authLoading}>
                        {ACADEMY_CART.registerTab}
                      </button>
                    </form>
                  )}

                  <button type="button" className="mt-6 w-full text-center text-sm text-brand-primary hover:underline" onClick={() => setStep("payment")}>
                    {ACADEMY_CART.continueGuest}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold">{ACADEMY_CART.paymentTitle}</h2>
                    {!academySession ? (
                      <button type="button" className="text-sm text-brand-primary hover:underline" onClick={() => setStep("account")}>
                        ← {ACADEMY_CART.stepAccount}
                      </button>
                    ) : null}
                  </div>

                  <form className="mt-6 space-y-4" onSubmit={(e) => void onPurchase(e)}>
                    <input
                      className="input w-full"
                      name="name"
                      placeholder={salesCopy.checkout.name}
                      required
                      defaultValue={academySession?.user.name}
                      disabled={submitting}
                    />
                    <input
                      className="input w-full"
                      type="email"
                      name="email"
                      placeholder={salesCopy.checkout.email}
                      required
                      defaultValue={academySession?.user.email}
                      disabled={submitting || !!academySession}
                    />
                    <input className="input w-full" name="phone" placeholder={salesCopy.checkout.phone} disabled={submitting} />
                    <fieldset className="space-y-2" disabled={submitting}>
                      <legend className="text-sm text-white/70">{salesCopy.checkout.payment}</legend>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input type="radio" name="paymentMethod" value="PIX" defaultChecked required />
                        {salesCopy.checkout.pix}
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input type="radio" name="paymentMethod" value="CARD" required />
                        {salesCopy.checkout.card}
                      </label>
                    </fieldset>
                    <label className="flex items-start gap-2 text-xs text-white/65">
                      <input type="checkbox" name="acceptTerms" className="mt-0.5" required disabled={submitting} />
                      {salesCopy.checkout.terms}
                    </label>
                    {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
                    <button type="submit" className="btn-primary academy-sales__cta-primary w-full min-h-12 text-base font-semibold" disabled={submitting}>
                      {submitting ? salesCopy.checkout.submitting : salesCopy.checkout.submit}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </AcademyStoreShell>
  );
}
