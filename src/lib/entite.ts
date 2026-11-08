import type { AdminSession } from "@/lib/adminAuth";

/**
 * Chaque commande appartient à un seul côté (`orders.entite`, migration
 * « ventes_avant_societe_verrouillees ») :
 * - `personnel` : vendue avant le début de la comptabilité de la société
 *   (6 nov. 2026). Visible par Rayane seulement, hors du rapport de la société.
 * - `societe` : toutes les autres ventes, comptant compris. C'est le rapport
 *   du comptable de la société.
 * Le côté est fixé dans la base : une nouvelle commande est toujours
 * `societe` et aucune commande ne change de côté.
 */
export type Entite = "societe" | "personnel";
export type VueVentes = "tout" | Entite;

export const VUES: { value: VueVentes; label: string }[] = [
  { value: "tout", label: "Tout" },
  { value: "societe", label: "Société" },
  { value: "personnel", label: "Avant la société" },
];

/**
 * Ce que la session a le droit de voir, décidé côté serveur. Seul Rayane
 * (owner) choisit ; toute autre session voit seulement la société, quoi que
 * dise l'adresse.
 */
export function vueAutorisee(session: AdminSession | null, demandee: unknown, parDefaut: VueVentes = "tout"): VueVentes {
  if (session?.role !== "owner") return "societe";
  return demandee === "tout" || demandee === "societe" || demandee === "personnel" ? demandee : parDefaut;
}

/** Une ligne sans côté connu compte comme société : rien ne sort du rapport par accident. */
export const entiteDe = (e: unknown): Entite => (e === "personnel" ? "personnel" : "societe");

export const dansLaVue = (vue: VueVentes, e: unknown) => vue === "tout" || entiteDe(e) === vue;

/** Montant reçu sans TPS ni TVQ, à vérifier dans les ventes de la société. */
export const taxesManquantes = (p: { amount: unknown; tps?: unknown; tvq?: unknown }) =>
  Number(p.amount) > 0 && Number(p.tps ?? 0) + Number(p.tvq ?? 0) === 0;
