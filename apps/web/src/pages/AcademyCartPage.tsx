import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import {
  ACADEMY_CART,
  ACADEMY_DEMO_COUPONS,
  ACADEMY_STORE_BASE,
  ACADEMY_STORE_PATHS
} from "@ederson-agencia/shared";
import { AcademyStoreShell } from "../components/academy/AcademyStoreShell";
import { CourseCover } from "../components/courses/CourseCover";
import {
  cartDiscountCents,
  cartSubtotalCents,
  cartTotalCents,
  useAcademyCartStore
} from "../stores/academyCartStore";
import "../styles/academy-sales.css";
import "../styles/course-study.css";

export function AcademyCartPage() {
  const items = useAcademyCartStore((s) => s.items);
  const couponCode = useAcademyCartStore((s) => s.couponCode);
  const removeItem = useAcademyCartStore((s) => s.removeItem);
  const setCoupon = useAcademyCartStore((s) => s.setCoupon);

  const subtotal = cartSubtotalCents(items);
  const discount = cartDiscountCents(subtotal, couponCode);
  const total = cartTotalCents(items, couponCode);

  function format(cents: number) {
    return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function applyCoupon(raw: string) {
    const code = raw.trim().toUpperCase();
    if (!code) {
      setCoupon(null);
      return;
    }
    if (ACADEMY_DEMO_COUPONS[code]) setCoupon(code);
    else setCoupon(null);
  }

  if (items.length === 0) {
    return (
      <AcademyStoreShell>
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">{ACADEMY_CART.cartTitle}</h1>
          <p className="mt-4 text-white/60">{ACADEMY_CART.cartEmpty}</p>
          <Link to={ACADEMY_STORE_BASE} className="btn-primary mt-8 inline-flex min-h-11 items-center px-6">
            {ACADEMY_CART.continueShopping}
          </Link>
        </main>
      </AcademyStoreShell>
    );
  }

  return (
    <AcademyStoreShell>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold sm:text-3xl">{ACADEMY_CART.cartTitle}</h1>
        <p className="mt-1 text-sm text-white/55">{items.length} curso(s) no carrinho</p>

        <div className="academy-cart-layout mt-8">
          <div className="academy-cart-layout__items min-w-0">
            <ul className="space-y-4">
              {items.map((course) => (
                <li key={course.slug} className="academy-cart-row panel border-white/10 bg-white/[0.03] p-4 sm:p-5">
                  <CourseCover
                    title={course.title}
                    coverUrl={course.coverUrl}
                    className="academy-cart-row__cover academy-udemy-card__cover rounded-md"
                  />
                  <div className="academy-cart-row__body min-w-0">
                    <h2 className="text-base font-semibold leading-snug sm:text-lg">{course.title}</h2>
                    {course.summary ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/55">{course.summary}</p>
                    ) : null}
                    <p className="mt-3 text-base font-bold lg:hidden">{format(course.priceCents)}</p>
                  </div>
                  <div className="academy-cart-row__aside">
                    <p className="hidden text-right text-base font-bold lg:block">{format(course.priceCents)}</p>
                    <button
                      type="button"
                      className="academy-cart-row__remove rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-red-300"
                      aria-label={ACADEMY_CART.remove}
                      onClick={() => removeItem(course.slug)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="academy-cart-layout__summary panel h-fit border-white/10 bg-white/[0.03] p-5 sm:p-6 lg:sticky lg:top-24">
            <p className="text-sm text-white/60">{ACADEMY_CART.subtotal}</p>
            <p className="text-xl font-bold">{format(subtotal)}</p>

            <form
              className="mt-5 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                applyCoupon(String(fd.get("coupon") ?? ""));
              }}
            >
              <label className="text-xs text-white/55">{ACADEMY_CART.coupon}</label>
              <div className="flex gap-2">
                <input className="input min-h-10 flex-1 text-sm" name="coupon" placeholder={ACADEMY_CART.couponPlaceholder} defaultValue={couponCode ?? ""} />
                <button type="submit" className="btn-secondary shrink-0 px-3 text-sm">
                  {ACADEMY_CART.applyCoupon}
                </button>
              </div>
              {couponCode && discount > 0 ? (
                <p className="text-xs text-green-300">
                  {ACADEMY_CART.couponApplied}: {ACADEMY_DEMO_COUPONS[couponCode]?.label}
                </p>
              ) : null}
            </form>

            {discount > 0 ? (
              <p className="mt-4 text-sm text-white/55">
                Desconto −{format(discount)}
              </p>
            ) : null}
            <p className="mt-4 text-sm font-medium text-white/70">{ACADEMY_CART.total}</p>
            <p className="text-2xl font-bold">{format(total)}</p>

            <Link to={ACADEMY_STORE_PATHS.checkout} className="btn-primary academy-sales__cta-primary mt-6 flex min-h-12 w-full items-center justify-center text-base font-semibold">
              {ACADEMY_CART.proceed}
            </Link>
            <Link to={ACADEMY_STORE_BASE} className="mt-3 block text-center text-sm text-brand-primary hover:underline">
              {ACADEMY_CART.continueShopping}
            </Link>
          </aside>
        </div>
      </main>
    </AcademyStoreShell>
  );
}
