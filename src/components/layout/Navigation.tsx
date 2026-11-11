"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";
import { LINKS, PHONE_DISPLAY } from "@/lib/site-content";
import { initialLanguage, useSite } from "@/components/site/useSite";
import { RevealObserver } from "@/components/site/ui";

/**
 * En-tête du site (planches du canevas « Site 50 000 $ »).
 * Fixe en haut de l'écran (les pages laissent var(--nav-height) au-dessus de
 * leur contenu). Sur l'accueil, il est posé sur la vidéo, en clair, puis
 * devient ivoire au défilement. Sous 1080 px, le menu passe dans un panneau
 * plein écran.
 */
export default function Navigation() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { c, language, setLanguage } = useSite();
  const setStoreLanguage = useStore((s) => s.setLanguage);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Langue : appliquée après l'hydratation (le rendu serveur est en anglais).
  useEffect(() => {
    setStoreLanguage(initialLanguage());
  }, [setStoreLanguage]);

  useEffect(() => {
    document.documentElement.lang = language === "fr" ? "fr-CA" : "en-CA";
  }, [language]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Le panneau se ferme à chaque changement de page.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    const burger = burgerRef.current;
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      burger?.focus();
    };
  }, [open]);

  const overHero = isHome && !scrolled;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <RevealObserver />
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,height] duration-300 ${
          overHero ? "border-b border-transparent bg-transparent" : "border-b border-beto-gray-subtle bg-beto-offwhite/95 backdrop-blur-md"
        }`}
      >
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-beto-offwhite focus:px-4 focus:py-3 focus:text-sm focus:text-beto-black"
        >
          {c.common.skip}
        </a>
        <div
          className="bj-gutter mx-auto flex items-center justify-between gap-6 transition-[height] duration-300"
          style={{ maxWidth: 1360, height: scrolled ? "var(--bj-header)" : "var(--bj-header-top)" }}
        >
          <Link href={LINKS.home} aria-label={c.common.home} className="flex min-h-11 flex-col items-center justify-center gap-2 no-underline">
            <Image
              src="/brand/logo-mark.png"
              alt=""
              width={1096}
              height={616}
              priority
              className="transition-[filter] duration-300"
              style={{ height: 32, width: "auto", filter: overHero ? "brightness(0) invert(1)" : "none" }}
            />
            <span
              className="hidden whitespace-nowrap text-[11px] uppercase sm:block"
              style={{ letterSpacing: ".28em", color: overHero ? "#ABA59B" : "#5C574F" }}
            >
              {c.common.city}
            </span>
          </Link>

          <nav aria-label={c.common.mainNav} className="hidden items-center gap-9 min-[1081px]:flex">
            {c.nav.map((l) => {
              const on = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={on ? "page" : undefined}
                  className={`whitespace-nowrap border-b py-1.5 text-sm tracking-[.04em] transition-colors ${
                    overHero
                      ? "border-transparent text-beto-offwhite/90 hover:text-beto-gold"
                      : on
                        ? "border-beto-black text-beto-black"
                        : "border-transparent text-beto-black hover:text-beto-gold-dark"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 sm:gap-5">
            <LangToggle language={language} setLanguage={setLanguage} light={overHero} label={c.common.languageLabel} />
            <Link
              href={LINKS.form}
              className={`bj-btn bj-btn-sm bj-btn-keep bj-nav-cta ${overHero ? "bj-btn-line-light" : "bj-btn-line"}`}
            >
              {c.common.navPrice}
            </Link>
            <button
              ref={burgerRef}
              type="button"
              aria-label={c.common.openMenu}
              aria-expanded={open}
              aria-controls="bj-menu"
              onClick={() => setOpen(true)}
              className={`inline-flex h-11 w-11 items-center justify-center border min-[1081px]:hidden ${
                overHero ? "border-beto-offwhite/40 text-beto-offwhite" : "border-beto-black text-beto-black"
              }`}
            >
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M2 6h16M2 14h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          id="bj-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={c.common.menu}
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-beto-ink text-beto-offwhite min-[1081px]:hidden"
        >
          <div className="bj-gutter flex items-center justify-between" style={{ height: "var(--bj-header-top)" }}>
            <Link href={LINKS.home} aria-label={c.common.home} onClick={() => setOpen(false)} className="flex min-h-11 flex-col items-center justify-center gap-2">
              <Image src="/brand/logo-mark.png" alt="" width={1096} height={616} style={{ height: 32, width: "auto", filter: "brightness(0) invert(1)" }} />
            </Link>
            <button
              type="button"
              aria-label={c.common.closeMenu}
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center border border-beto-offwhite/40 text-beto-offwhite"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M3 3l12 12M15 3L3 15" />
              </svg>
            </button>
          </div>
          <nav aria-label={c.common.mainNav} className="bj-gutter flex flex-1 flex-col pt-6 pb-10">
            <ul className="flex flex-col">
              {c.nav.map((l) => (
                <li key={l.href} className="border-b border-beto-offwhite/10">
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`bj-serif block py-4 transition-colors hover:text-beto-gold ${isActive(l.href) ? "text-beto-gold" : "text-beto-offwhite"}`}
                    style={{ fontSize: "clamp(30px, 8vw, 40px)", lineHeight: 1.15 }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3">
              <Link href={LINKS.form} onClick={() => setOpen(false)} className="bj-btn bj-btn-gold">
                {c.common.seePrice}
              </Link>
              <Link href={LINKS.book} onClick={() => setOpen(false)} className="bj-btn bj-btn-line-light">
                {c.common.bookConsultation}
              </Link>
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-10 text-sm text-beto-stone">
              <LangToggle language={language} setLanguage={setLanguage} light label={c.common.languageLabel} />
              <a href={LINKS.phoneTel} className="inline-flex min-h-11 items-center text-beto-offwhite">
                {PHONE_DISPLAY}
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

function LangToggle({
  language,
  setLanguage,
  light,
  label,
}: {
  language: "fr" | "en";
  setLanguage: (l: "fr" | "en") => void;
  light: boolean;
  label: string;
}) {
  const on = light ? "text-beto-offwhite" : "text-beto-black";
  const off = light ? "text-beto-stone hover:text-beto-offwhite" : "text-beto-gray hover:text-beto-black";
  return (
    <div role="group" aria-label={label} className="flex items-center gap-1 text-[13px] tracking-[.12em]">
      <button
        type="button"
        aria-pressed={language === "fr"}
        lang="fr"
        onClick={() => setLanguage("fr")}
        className={`inline-flex min-h-11 min-w-8 items-center justify-center ${language === "fr" ? on : off}`}
      >
        FR
      </button>
      <span aria-hidden="true" className={light ? "text-[#8F897F]" : "text-beto-gray-light"}>
        /
      </span>
      <button
        type="button"
        aria-pressed={language === "en"}
        lang="en"
        onClick={() => setLanguage("en")}
        className={`inline-flex min-h-11 min-w-8 items-center justify-center ${language === "en" ? on : off}`}
      >
        EN
      </button>
    </div>
  );
}
