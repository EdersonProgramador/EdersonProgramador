export const ACADEMY_CART = {
  addToCart: "Quero este curso",
  inCart: "No carrinho",
  goToCart: "Ir para o carrinho",
  cartTitle: "Carrinho",
  cartEmpty: "Seu carrinho está vazio.",
  continueShopping: "Continuar comprando",
  remove: "Remover",
  subtotal: "Subtotal",
  coupon: "Cupom",
  couponPlaceholder: "Digite o cupom",
  applyCoupon: "Aplicar",
  couponApplied: "Cupom aplicado",
  couponInvalid: "Cupom inválido",
  total: "Total",
  proceed: "Finalizar matrícula agora",
  checkoutTitle: "Finalizar compra",
  stepCart: "Carrinho",
  stepAccount: "Conta",
  stepPayment: "Pagamento",
  accountTitle: "Entrar ou criar conta",
  accountSubtitle: "Use seu e-mail para continuar a compra.",
  loginTab: "Entrar",
  registerTab: "Cadastrar",
  continueGuest: "Continuar sem login (preencher na etapa de pagamento)",
  socialSoon: "Login social em breve. Use e-mail por enquanto.",
  paymentTitle: "Pagamento e matrícula",
  success: "Compra concluída! Verifique seu e-mail para acessar a Academia."
} as const;

export const ACADEMY_STORE_PATHS = {
  cart: "/cursos/carrinho",
  checkout: "/cursos/finalizar"
} as const;

/** Cupons demo — validação só no front até integrar gateway. */
export const ACADEMY_DEMO_COUPONS: Record<string, { label: string; percentOff: number }> = {
  ACADEMIA10: { label: "10% off", percentOff: 10 }
};
