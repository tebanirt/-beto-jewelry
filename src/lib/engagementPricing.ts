/**
 * Engagement-ring price lookup, safe for the browser.
 *
 * The browser only ever receives FINAL public prices (CAD, before tax). They
 * are computed on the server from Rayane's internal costs and profit targets,
 * which live in a private Supabase table and are never sent to the client nor
 * stored in this (public) repository. See engagementPriceTable.server.ts.
 *
 * Prices are shown for engagement rings only (Rayane, 3 nov. 2026).
 */

export const ENGAGEMENT_CARATS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6] as const;
export type EngagementCarat = (typeof ENGAGEMENT_CARATS)[number];

export const RING_STYLES = ["solitaire", "haloHalf", "haloThreeQuarter"] as const;
export type RingStyle = (typeof RING_STYLES)[number];

export type PricedStone = "lab" | "labColored";
export type GoldKarat = "14k" | "18k";

/** stone → carat (as a string key) → style → karat → final price. */
export type EngagementPriceTable = Partial<
  Record<PricedStone, Record<string, Record<RingStyle, Record<GoldKarat, number>>>>
>;

export type Quote = {
  prices: { karat: GoldKarat; price: number }[];
  /** True when no style was chosen: the solitaire price is shown as a starting price. */
  startingFrom: boolean;
};

export function lookupQuote(
  table: EngagementPriceTable | null,
  stone: PricedStone | null,
  carat: EngagementCarat | null,
  style: RingStyle | "unsure" | null,
  karat: GoldKarat | "unsure" | null
): Quote | null {
  if (!table || !stone || carat === null || !style || !karat) return null;
  const startingFrom = style === "unsure";
  const row = table[stone]?.[String(carat)]?.[startingFrom ? "solitaire" : style];
  if (!row) return null;
  const karats: GoldKarat[] = karat === "unsure" ? ["14k", "18k"] : [karat];
  const prices = karats.flatMap((k) => {
    const price = row[k];
    return typeof price === "number" && price > 0 ? [{ karat: k, price }] : [];
  });
  return prices.length > 0 ? { prices, startingFrom } : null;
}
