"use client";

import { usePathname } from "next/navigation";
import { langFromPath, type Lang } from "@/lib/locale";

/**
 * Langue de la page affichée, lue dans l'adresse : elle est donc la même au rendu
 * serveur (ce que Google lit) et dans le navigateur.
 */
export function useLang(): Lang {
  return langFromPath(usePathname());
}
