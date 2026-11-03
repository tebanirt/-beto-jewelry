/**
 * Starting prices shown in the "Commencer mon design" form, for ENGAGEMENT
 * RINGS ONLY (Rayane, 3 nov. 2026: "les seuls prix qu'on va pouvoir donner,
 * c'est sur bague de fiançailles").
 *
 * Never invent a number here. Every amount must come from Rayane. Until
 * PRICING_CONFIRMED_BY_RAYANE is true and a carat has a price, the form shows
 * "votre prix en moins d'une heure" instead of a number. Leaving a value
 * out is always safe.
 *
 * Amounts are CAD, "à partir de" (starting price) for that stone and gold.
 */

export const ENGAGEMENT_CARATS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6] as const;
export type EngagementCarat = (typeof ENGAGEMENT_CARATS)[number];

export type PricedStone = "natural" | "lab" | "labColored";
export type GoldKarat = "14k" | "18k";

type PriceRow = Partial<Record<GoldKarat, number>>;

export const PRICING_CONFIRMED_BY_RAYANE = false;

export const FROM_PRICES: Record<PricedStone, Partial<Record<EngagementCarat, PriceRow>>> = {
  lab: {},
  labColored: {},
  natural: {},
};

export type FromPrice = { karat: GoldKarat; price: number };

/**
 * Returns the starting price(s) to show, or null when nothing confirmed exists
 * for this combination. When the visitor doesn't know the gold karat yet, both
 * 14K and 18K are returned so they can compare.
 */
export function getFromPrices(
  stone: PricedStone | null,
  carat: EngagementCarat | null,
  karat: GoldKarat | "unsure" | ""
): FromPrice[] | null {
  if (!PRICING_CONFIRMED_BY_RAYANE || !stone || carat === null || !karat) return null;
  const row = FROM_PRICES[stone][carat];
  if (!row) return null;
  const karats: GoldKarat[] = karat === "unsure" ? ["14k", "18k"] : [karat];
  const prices = karats.flatMap((k) => {
    const price = row[k];
    return typeof price === "number" && price > 0 ? [{ karat: k, price }] : [];
  });
  return prices.length > 0 ? prices : null;
}
