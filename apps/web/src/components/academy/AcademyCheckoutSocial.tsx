import { ACADEMY_CART } from "@ederson-agencia/shared";

const providers = [
  { id: "google", label: "Google" },
  { id: "facebook", label: "Facebook" },
  { id: "github", label: "GitHub" },
  { id: "apple", label: "Apple" }
] as const;

export function AcademyCheckoutSocial({ onUnavailable }: { onUnavailable: (msg: string) => void }) {
  return (
    <div className="academy-checkout-social grid grid-cols-1 gap-2 sm:grid-cols-2">
      {providers.map((p) => (
        <button
          key={p.id}
          type="button"
          className="btn-secondary min-h-10 w-full text-sm"
          onClick={() => onUnavailable(ACADEMY_CART.socialSoon)}
        >
          Continuar com {p.label}
        </button>
      ))}
    </div>
  );
}
