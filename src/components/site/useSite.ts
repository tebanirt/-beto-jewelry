"use client";

import { useCallback } from "react";
import { useStore, detectLanguage } from "@/store/useStore";
import { SITE } from "@/lib/site-content";

const LANG_KEY = "beto-lang";

/** Langue choisie par le visiteur (mémorisée sur cet appareil), sinon celle du navigateur. */
export function initialLanguage(): "fr" | "en" {
  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === "fr" || saved === "en") return saved;
  } catch {
    // stockage bloqué (navigation privée) : on garde la langue du navigateur
  }
  return detectLanguage();
}

export function useSite() {
  const language = useStore((s) => s.language);
  const setLanguageInStore = useStore((s) => s.setLanguage);
  const setLanguage = useCallback(
    (lang: "fr" | "en") => {
      setLanguageInStore(lang);
      try {
        window.localStorage.setItem(LANG_KEY, lang);
      } catch {
        // sans stockage, le choix vaut pour la visite en cours
      }
    },
    [setLanguageInStore]
  );
  return { c: SITE[language], language, setLanguage };
}
