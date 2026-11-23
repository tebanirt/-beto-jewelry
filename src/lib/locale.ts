/**
 * Langue du site, déduite de l'adresse (décision de Rayane, 23 nov. 2026) :
 * le français est à la racine (betojewelry.com/…), l'anglais sous /en/….
 * Google lit ainsi chaque page dans sa langue, et le français reste la version par défaut (Loi 96).
 */
export type Lang = "fr" | "en";

export const EN_PREFIX = "/en";

const FR_MONTREAL = "/bagues-de-fiancailles-sur-mesure-montreal";
const EN_MONTREAL = "/montreal";

/** Chemins qui ne sont jamais traduits (outils internes, API, fichiers). */
const NEVER_LOCALIZED = /^\/(admin|api|_next|nouveau-client)(\/|$)/;

export function langFromPath(pathname: string | null | undefined): Lang {
  if (!pathname) return "fr";
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? "en" : "fr";
}

/** « /en/process » → « /process » ; « /en » → « / ». */
export function stripLocale(pathname: string): string {
  if (pathname === EN_PREFIX) return "/";
  if (pathname.startsWith(`${EN_PREFIX}/`)) return pathname.slice(EN_PREFIX.length);
  return pathname;
}

function isLocalizable(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (NEVER_LOCALIZED.test(path)) return false;
  const lastSegment = path.split(/[?#]/)[0].split("/").pop() ?? "";
  // Un fichier (image, pdf, vidéo) n'a pas de version anglaise.
  return !/\.[a-z0-9]{2,5}$/i.test(lastSegment);
}

/**
 * Adresse d'une page dans une langue donnée, à partir de son adresse française.
 * localizePath("/process", "en") → « /en/process » ; localizePath("/", "en") → « /en ».
 */
export function localizePath(path: string, lang: Lang): string {
  if (!isLocalizable(path)) return path;
  const base = stripLocale(path);
  // La page Montréal a une adresse française à elle : /bagues-de-fiancailles-sur-mesure-montreal ↔ /en/montreal.
  if (base === FR_MONTREAL && lang === "en") return `${EN_PREFIX}${EN_MONTREAL}`;
  if (base === EN_MONTREAL) return lang === "fr" ? FR_MONTREAL : `${EN_PREFIX}${EN_MONTREAL}`;
  if (lang === "fr") return base;
  if (base === "/") return EN_PREFIX;
  if (base.startsWith("/?") || base.startsWith("/#")) return `${EN_PREFIX}${base.slice(1)}`;
  return `${EN_PREFIX}${base}`;
}
