import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // "1" seulement quand les deux clés Stripe sont dans l'environnement du
    // build (Vercel) : le bouton « Payer le dépôt » n'apparaît jamais sans
    // elles. Seul ce drapeau va dans le navigateur, jamais les clés.
    STRIPE_DEPOSIT_READY: process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET ? "1" : "",
  },
};

export default nextConfig;
