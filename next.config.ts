import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // "1" seulement quand les deux clés Stripe sont dans l'environnement du
    // build (Vercel) : le bouton « Payer le dépôt » n'apparaît jamais sans
    // elles. Seul ce drapeau va dans le navigateur, jamais les clés.
    STRIPE_DEPOSIT_READY: process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET ? "1" : "",
  },
  // Français à la racine, anglais sous /en (décision de Rayane, 23 nov. 2026).
  async redirects() {
    return [
      // L'ancienne page anglaise « Montréal » : sa version anglaise est maintenant /en/montreal,
      // et sa version française est /bagues-de-fiancailles-sur-mesure-montreal.
      { source: "/montreal", destination: "/en/montreal", permanent: true },
      { source: "/en/bagues-de-fiancailles-sur-mesure-montreal", destination: "/en/montreal", permanent: true },
      // Pas de préfixe /fr : le français est à la racine.
      { source: "/fr", destination: "/", permanent: true },
      { source: "/fr/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
