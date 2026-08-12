"use client";
import { create } from "zustand";

export function detectLanguage(): "en" | "fr" {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || "en";
  return lang.toLowerCase().startsWith("fr") ? "fr" : "en";
}

interface BetoStore {
  language: "en" | "fr";
  setLanguage: (lang: "en" | "fr") => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useStore = create<BetoStore>((set) => ({
  // Always "en" on creation so server and first client render match exactly.
  // The real (browser-language-detected) value is applied client-side after
  // mount — see Navigation's detect effect — to avoid a hydration mismatch.
  language: "en",
  setLanguage: (language) => set({ language }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
}));
