"use client";

import Script from "next/script";

// Identifiant public (visible dans le code de n'importe quel site), comme l'ID du pixel Meta.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-VG3PL11RYQ";

/**
 * Google Analytics 4, chargé seulement après le consentement (voir Analytics.tsx).
 * La mesure améliorée de GA4 suit elle-même les changements de page du routeur Next.
 */
export default function GoogleAnalytics() {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
