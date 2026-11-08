import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Engagement-ring price calculator for Lauren (Rayane, 4 Nov. 2026).
 * Costs live in the private `pricing_config` row "ring_calculator" (never in
 * this public repository):
 *
 *   cost  = stone (carat × $/ct) + metal (grams × ($/g + safety))
 *         + setting labour + options (hidden halo, semi-eternity: stones + setting)
 *         + box + client meeting + engraving
 *   price = cost + target profit (1 000 $), rounded UP to the step
 *   floor = cost + minimum profit (700 $), rounded UP — Lauren may go anywhere
 *           between the two; never below the floor.
 *
 * Only engagement rings: anything else is quoted by Rayane.
 */

export type CalcStone = "lab" | "labColored";
export type CalcMetal = "14k" | "18k" | "platinum";
export type CalcOptions = { hiddenHalo: boolean; semiEternity: boolean };

export type CalculatorConfig = {
  stonePerCarat: Record<CalcStone, number>;
  metalPerGram: Record<CalcMetal, number>;
  metalSafetyPerGram: number;
  ringGrams: Record<CalcMetal, number>;
  labor: { setting: number };
  options: Record<keyof CalcOptions, number>;
  fixed: Record<string, number>;
  profit: { target: number; floor: number };
  roundUpTo: number;
};

export type CalcInput = { stone: CalcStone; carat: number; metal: CalcMetal; options: CalcOptions };

export type CalcResult = {
  price: number;
  floor: number;
  cost: number;
  breakdown: { label: string; amount: number }[];
};

export const CALC_LIMITS = { minCarat: 0.3, maxCarat: 10 };

const num = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0;
const STONES: CalcStone[] = ["lab", "labColored"];
const METALS: CalcMetal[] = ["14k", "18k", "platinum"];

function parse(raw: unknown): CalculatorConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as CalculatorConfig;
  const ok =
    STONES.every((s) => num(c.stonePerCarat?.[s])) &&
    METALS.every((m) => num(c.metalPerGram?.[m]) && num(c.ringGrams?.[m])) &&
    num(c.metalSafetyPerGram) &&
    num(c.labor?.setting) &&
    num(c.options?.hiddenHalo) &&
    num(c.options?.semiEternity) &&
    !!c.fixed && Object.values(c.fixed).every(num) &&
    num(c.profit?.target) && num(c.profit?.floor) && c.profit.floor <= c.profit.target &&
    num(c.roundUpTo) && c.roundUpTo > 0;
  return ok ? c : null;
}

export async function loadCalculatorConfig(): Promise<CalculatorConfig | null> {
  const { data, error } = await getSupabaseAdmin().from("pricing_config").select("config").eq("id", "ring_calculator").maybeSingle();
  if (error) {
    console.error("ring_calculator config read error:", error);
    return null;
  }
  const cfg = parse(data?.config);
  if (!cfg) console.error("ring_calculator config missing or invalid");
  return cfg;
}

const FIXED_LABELS: Record<string, string> = { box: "Box", meeting: "Client meeting", engraving: "Engraving", certificate: "Gemological certificate" };

export function calculate(cfg: CalculatorConfig, input: CalcInput): CalcResult {
  const grams = cfg.ringGrams[input.metal];
  const perGram = cfg.metalPerGram[input.metal] + cfg.metalSafetyPerGram;
  const breakdown: { label: string; amount: number }[] = [
    { label: `Stone ${input.carat} ct × ${cfg.stonePerCarat[input.stone]} $`, amount: input.carat * cfg.stonePerCarat[input.stone] },
    { label: `Metal ${grams} g × ${perGram} $ (casting included)`, amount: grams * perGram },
    { label: "Setting", amount: cfg.labor.setting },
  ];
  if (input.options.hiddenHalo) breakdown.push({ label: "Hidden halo (stones + setting)", amount: cfg.options.hiddenHalo });
  if (input.options.semiEternity) breakdown.push({ label: "Semi-eternity band (stones + setting)", amount: cfg.options.semiEternity });
  for (const [k, v] of Object.entries(cfg.fixed)) breakdown.push({ label: FIXED_LABELS[k] ?? k, amount: v });

  const cost = Math.round(breakdown.reduce((s, b) => s + b.amount, 0) * 100) / 100;
  const up = (n: number) => Math.ceil(n / cfg.roundUpTo) * cfg.roundUpTo;
  return { cost, price: up(cost + cfg.profit.target), floor: up(cost + cfg.profit.floor), breakdown };
}

/** Validates a request body; returns the input or an English error for Lauren. */
export function parseCalcInput(body: Record<string, unknown>): CalcInput | { error: string } {
  const stone = body.stone as CalcStone;
  const metal = body.metal as CalcMetal;
  const carat = Number(body.carat);
  if (!STONES.includes(stone)) return { error: "Choose the stone" };
  if (!METALS.includes(metal)) return { error: "Choose the metal" };
  if (!Number.isFinite(carat) || carat < CALC_LIMITS.minCarat || carat > CALC_LIMITS.maxCarat) {
    return { error: `Carat must be between ${CALC_LIMITS.minCarat} and ${CALC_LIMITS.maxCarat} — otherwise ask Rayane` };
  }
  const o = (body.options ?? {}) as Partial<CalcOptions>;
  return { stone, metal, carat: Math.round(carat * 100) / 100, options: { hiddenHalo: !!o.hiddenHalo, semiEternity: !!o.semiEternity } };
}
