"use client";
import { useLang } from "@/hooks/useLang";
import { t } from "@/lib/translations";

export function useTranslation() {
  return t[useLang()];
}
