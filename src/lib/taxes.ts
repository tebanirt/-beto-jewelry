/**
 * TPS et TVQ du Québec, perçues sur chaque paiement (dépôt, 50 % à
 * l'approbation, solde) depuis le 6 nov. 2026. Tous les prix de Beto sont
 * annoncés avant taxes : les taxes s'ajoutent au paiement (option A choisie
 * par Rayane : dépôt de 250 $ + TPS + TVQ = 287,44 $).
 */
export const TPS_RATE = 0.05;
export const TVQ_RATE = 0.09975;

/** Libellés des lignes de taxes sur les paiements Stripe (le webhook les reconnaît par leur début). */
export const TPS_LABEL = "TPS (5 %)";
export const TVQ_LABEL = "TVQ (9,975 %)";

export type TaxedAmount = { base: number; tps: number; tvq: number; total: number };

/**
 * Taxes calculées sur un montant avant taxes, chacune arrondie au cent.
 * Calcul en cents entiers (5 % = 5 000/100 000, 9,975 % = 9 975/100 000),
 * pour qu'un demi-cent comme 24,9375 $ ne s'arrondisse jamais du mauvais côté
 * à cause de la virgule flottante.
 */
export function addTaxes(base: number): TaxedAmount {
  const b = Math.round(base * 100);
  const tps = Math.round((b * 5000) / 100000);
  const tvq = Math.round((b * 9975) / 100000);
  return { base: b / 100, tps: tps / 100, tvq: tvq / 100, total: (b + tps + tvq) / 100 };
}

/** Montant en cents pour Stripe. */
export const toCents = (n: number) => Math.round(n * 100);
