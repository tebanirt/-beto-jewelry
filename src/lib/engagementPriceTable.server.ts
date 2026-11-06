import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  ENGAGEMENT_CARATS,
  RING_STYLES,
  METAL_GRADES,
  type EngagementPriceTable,
  type MetalGrade,
  type PricedStone,
  type RingStyle,
} from "@/lib/engagementPricing";

/**
 * Computes public engagement-ring prices from Rayane's internal costs.
 *
 * The costs and profit targets are confidential: they live in the private
 * Supabase table `pricing_config` (row id "engagement", service role only,
 * RLS on) and must never be hard-coded here. This repository is public, and
 * only the computed prices may leave the server.
 *
 * Price = stone + casting + center setting + small stones (setting + stones)
 *         + fixed costs (box, engraving, meeting) + profit target,
 *         rounded UP to the configured step so the target is always met.
 *
 * PRICING_CONFIG_JSON (same shape) overrides Supabase, for local testing.
 */

type Tier = [maxCarat: number, profit: number];

type PricingConfig = {
  centerSetting: number;
  smallStoneSetting: number;
  casting: Partial<Record<MetalGrade, number>>;
  perCarat: Record<PricedStone, number>;
  fixed: Record<string, number>;
  styles: Record<RingStyle, { smallStones: number; smallStonesMaterial: number }>;
  profit: Record<PricedStone, Tier[]>;
  roundUpTo: number;
};

const isAmount = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;
const STONES: PricedStone[] = ["lab", "labColored"];
// 14K and 18K are required; a metal without a casting cost (e.g. platinum
// before it was added) simply has no price shown.
const REQUIRED_GRADES: MetalGrade[] = ["14k", "18k"];

function parseConfig(raw: unknown): PricingConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  const casting = c.casting as Record<string, unknown> | undefined;
  const perCarat = c.perCarat as Record<string, unknown> | undefined;
  const fixed = c.fixed as Record<string, unknown> | undefined;
  const styles = c.styles as Record<string, { smallStones?: unknown; smallStonesMaterial?: unknown }> | undefined;
  const profit = c.profit as Record<string, unknown> | undefined;

  const ok =
    isAmount(c.centerSetting) &&
    isAmount(c.smallStoneSetting) &&
    isAmount(c.roundUpTo) &&
    c.roundUpTo > 0 &&
    !!casting && REQUIRED_GRADES.every((k) => isAmount(casting[k])) &&
    !!perCarat && STONES.every((s) => isAmount(perCarat[s])) &&
    !!fixed && Object.values(fixed).every(isAmount) &&
    !!styles && RING_STYLES.every((s) => isAmount(styles[s]?.smallStones) && isAmount(styles[s]?.smallStonesMaterial)) &&
    !!profit &&
    STONES.every(
      (s) =>
        Array.isArray(profit[s]) &&
        (profit[s] as unknown[]).length > 0 &&
        (profit[s] as unknown[]).every((t) => Array.isArray(t) && t.length === 2 && isAmount(t[0]) && isAmount(t[1]))
    );
  if (!ok) return null;
  const cfg = c as unknown as PricingConfig;
  return {
    ...cfg,
    profit: {
      lab: [...cfg.profit.lab].sort((a, b) => a[0] - b[0]),
      labColored: [...cfg.profit.labColored].sort((a, b) => a[0] - b[0]),
    },
  };
}

async function loadConfig(): Promise<PricingConfig | null> {
  if (process.env.PRICING_CONFIG_JSON) {
    try {
      return parseConfig(JSON.parse(process.env.PRICING_CONFIG_JSON));
    } catch {
      console.error("PRICING_CONFIG_JSON is not valid JSON");
      return null;
    }
  }
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("pricing_config")
      .select("config")
      .eq("id", "engagement")
      .maybeSingle();
    if (error) {
      console.error("pricing_config read error:", error);
      return null;
    }
    const config = parseConfig(data?.config);
    if (!config) console.error("pricing_config row missing or invalid: prices hidden");
    return config;
  } catch (err) {
    // Supabase not configured (e.g. local build): the form falls back to "price within 24 h".
    console.error("pricing_config unavailable:", err);
    return null;
  }
}

function profitFor(tiers: Tier[], carat: number) {
  return (tiers.find(([max]) => carat <= max) ?? tiers[tiers.length - 1])[1];
}

export async function getEngagementPriceTable(): Promise<EngagementPriceTable | null> {
  const cfg = await loadConfig();
  if (!cfg) return null;
  const fixed = Object.values(cfg.fixed).reduce((sum, v) => sum + v, 0);
  const table: EngagementPriceTable = {};
  for (const stone of STONES) {
    const byCarat: Record<string, Record<RingStyle, Partial<Record<MetalGrade, number>>>> = {};
    for (const carat of ENGAGEMENT_CARATS) {
      const byStyle = {} as Record<RingStyle, Partial<Record<MetalGrade, number>>>;
      for (const style of RING_STYLES) {
        const s = cfg.styles[style];
        const byKarat: Partial<Record<MetalGrade, number>> = {};
        for (const karat of METAL_GRADES) {
          const casting = cfg.casting[karat];
          if (!isAmount(casting)) continue;
          const total =
            cfg.perCarat[stone] * carat +
            casting +
            cfg.centerSetting +
            s.smallStones * cfg.smallStoneSetting +
            s.smallStonesMaterial +
            fixed +
            profitFor(cfg.profit[stone], carat);
          byKarat[karat] = Math.ceil(total / cfg.roundUpTo) * cfg.roundUpTo;
        }
        byStyle[style] = byKarat;
      }
      byCarat[String(carat)] = byStyle;
    }
    table[stone] = byCarat;
  }
  return table;
}
