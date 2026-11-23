"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "@/hooks/useLang";
import { localizePath, stripLocale } from "@/lib/locale";
import { SITE } from "@/lib/site-content";

const LANG_KEY = "beto-lang";

export function useSite() {
  const language = useLang();
  const pathname = usePathname();
  const router = useRouter();
  // Changer de langue, c'est aller à l'adresse de la même page dans l'autre langue.
  const setLanguage = useCallback(
    (lang: "fr" | "en") => {
      try {
        window.localStorage.setItem(LANG_KEY, lang);
      } catch {
        // sans stockage, le choix vaut pour la visite en cours
      }
      if (lang === language) return;
      const search = typeof window !== "undefined" ? window.location.search + window.location.hash : "";
      router.push(localizePath(stripLocale(pathname || "/"), lang) + search);
    },
    [language, pathname, router]
  );
  return { c: SITE[language], language, setLanguage };
}
