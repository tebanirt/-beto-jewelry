import Stripe from "stripe";

/** Dépôt de design (en dollars CAD), entièrement crédité sur la pièce finale. */
export const DEPOSIT_AMOUNT_CAD = 250;

export type PaymentKind = "depot" | "solde";

/**
 * Server-only Stripe client. Use a restricted key (rk_) stored as a
 * sensitive environment variable — never import this from client components.
 */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}
