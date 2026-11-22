import Stripe from "stripe";

export { DEPOSIT_AMOUNT_CAD } from "./deposit";

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
