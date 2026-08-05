"use client";
import { useStore } from "@/store/useStore";
import { t } from "@/lib/translations";

export function useTranslation() {
  const language = useStore((s) => s.language);
  return t[language];
}
