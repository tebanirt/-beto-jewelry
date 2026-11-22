"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LINKS } from "@/lib/site-content";
import { useSite } from "@/components/site/useSite";

/**
 * Barre « Réserver » en bas de l'écran (approuvée par Rayane le 22 nov. 2026).
 * - Jusqu'au 11 décembre inclus (heure de Montréal) : le message de Noël, sur
 *   tous les écrans, avec la date limite approuvée (brief §6).
 * - Ensuite : seulement sur mobile, un bouton « Réserver » toujours à portée.
 * Elle apparaît après un peu de défilement (pas sur la vidéo d'accueil), se
 * ferme pour la visite, et reste absente des pages où l'on réserve ou remplit
 * déjà le formulaire.
 */
const HOLIDAY_END = Date.parse("2026-12-12T05:00:00Z"); // 12 déc., 0 h, heure de Montréal
const DISMISS_KEY = "beto-bar-closed";
const HIDDEN_ON = ["/design-your-jewelry", "/merci-consultation", "/nouveau-client", "/admin"];

const TEXT = {
  fr: {
    holiday: "Pour Noël, commandez avant le 11 décembre",
    holidayShort: "Noël : commandez avant le 11 déc.",
    cta: "Réserver ma consultation",
    ctaShort: "Réserver",
    always: "Consultation gratuite, à Montréal ou en vidéo",
    close: "Fermer",
  },
  en: {
    holiday: "For Christmas, order by December 11",
    holidayShort: "Christmas: order by Dec. 11",
    cta: "Book my consultation",
    ctaShort: "Book",
    always: "Free consultation, in Montreal or by video",
    close: "Close",
  },
};

function wasClosed() {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false; // stockage bloqué : la barre reste fermable pour la page en cours
  }
}

export default function StickyBookBar() {
  const pathname = usePathname();
  const { language } = useSite();
  const t = TEXT[language];
  const [scrolled, setScrolled] = useState(false);
  const [closed, setClosed] = useState(false);
  const [holiday, setHoliday] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 480);
      setHoliday(Date.now() < HOLIDAY_END);
      setClosed((was) => was || wasClosed());
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hiddenHere = HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (hiddenHere || closed) return null;

  const close = () => {
    setClosed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // sans stockage, la barre revient à la prochaine page
    }
  };

  return (
    <div
      role="region"
      aria-label={holiday ? t.holiday : t.always}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-beto-offwhite/10 bg-beto-ink/95 text-beto-offwhite backdrop-blur-md transition-[transform,opacity] duration-300 motion-reduce:transition-none ${
        holiday ? "" : "min-[1081px]:hidden"
      } ${scrolled ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-hidden={!scrolled}
    >
      <div className="bj-gutter mx-auto flex items-center justify-between gap-3 py-2.5" style={{ maxWidth: 1360 }}>
        <p className="min-w-0 text-[13px] leading-snug tracking-[.02em] sm:text-sm">
          {holiday ? (
            <>
              <span className="sm:hidden">{t.holidayShort}</span>
              <span className="hidden sm:inline">{t.holiday}</span>
            </>
          ) : (
            t.always
          )}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <Link href={LINKS.book} tabIndex={scrolled ? undefined : -1} className="bj-btn bj-btn-sm bj-btn-gold whitespace-nowrap">
            <span className="sm:hidden">{t.ctaShort}</span>
            <span className="hidden sm:inline">{t.cta}</span>
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label={t.close}
            tabIndex={scrolled ? undefined : -1}
            className="inline-flex h-11 w-11 items-center justify-center text-beto-stone hover:text-beto-offwhite"
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 3l12 12M15 3L3 15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
