"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { CONSENT_EVENT, readConsent, writeConsent, type ConsentChoice } from "@/lib/consent";
import MetaPixel from "./MetaPixel";
import GoogleAnalytics from "./GoogleAnalytics";

/**
 * Charge le pixel Meta et Google Analytics seulement après « Accepter » (Loi 25),
 * et affiche la bannière tant que le visiteur n'a pas choisi.
 */
export default function Analytics() {
  const c = useTranslation().consent;
  // undefined = pas encore lu (rendu serveur) ; null = aucun choix ; sinon le choix.
  const [choice, setChoice] = useState<ConsentChoice | null | undefined>(undefined);

  useEffect(() => {
    const sync = () => setChoice(readConsent());
    const onChange = (e: Event) => setChoice((e as CustomEvent<ConsentChoice>).detail);
    queueMicrotask(sync);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  return (
    <>
      {choice === "granted" && (
        <>
          <MetaPixel />
          <GoogleAnalytics />
        </>
      )}
      {choice === null && (
        <div
          role="region"
          aria-label={c.learnMore}
          className="fixed inset-x-0 bottom-0 z-50 bg-beto-black text-white px-4 py-3 sm:px-5 sm:py-4"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4">
            <p className="text-[11px] leading-snug sm:text-xs sm:leading-relaxed text-white/75 flex-1">
              {c.body}{" "}
              <Link href="/privacy" className="underline hover:text-beto-gold">
                {c.learnMore}
              </Link>
            </p>
            <div className="flex gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => writeConsent("denied")}
                className="flex-1 sm:flex-none text-xs font-medium uppercase tracking-widest px-4 py-2.5 sm:py-3 border border-white/30 hover:border-beto-gold transition-colors"
              >
                {c.decline}
              </button>
              <button
                type="button"
                onClick={() => writeConsent("granted")}
                className="flex-1 sm:flex-none text-xs font-medium uppercase tracking-widest px-4 py-2.5 sm:py-3 bg-beto-gold text-beto-black hover:bg-beto-gold-dark transition-colors"
              >
                {c.accept}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
