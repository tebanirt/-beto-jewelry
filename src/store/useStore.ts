"use client";
import { create } from "zustand";

interface BetoStore {
  language: "en" | "fr";
  setLanguage: (lang: "en" | "fr") => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useStore = create<BetoStore>((set) => ({
  // Plus utilisée pour l'affichage : la langue vient de l'adresse (hooks/useLang).
  language: "fr",
  setLanguage: (language) => set({ language }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
}));
