"use client";
import { create } from "zustand";

function detectLanguage(): "en" | "fr" {
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
  language: detectLanguage(),
  setLanguage: (language) => set({ language }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
}));
