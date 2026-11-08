import { getSupabaseAdmin } from "@/lib/supabase";
import type { Payment } from "@/lib/workspace";
import { dansLaVue, type VueVentes } from "@/lib/entite";

export type PaymentRow = Payment & {
  order: { description: string | null; entite: string | null; client: { id: string; full_name: string | null } | null } | null;
};

/** "2026-11" for the current month in Montreal time. */
export function currentMonth() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" }).slice(0, 7);
}

export function validMonth(m: unknown) {
  return typeof m === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(m) ? m : currentMonth();
}

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Every payment received in a month (cash included), with its client and order.
 * `vue` keeps one side only (see `@/lib/entite`); always pick it with
 * `vueAutorisee()`, so only Rayane can get anything but the company's sales.
 */
export async function paymentsForMonth(month: string, vue: VueVentes): Promise<{ rows: PaymentRow[]; error: string | null }> {
  const start = `${month}-01`;
  const end = `${shiftMonth(month, 1)}-01`;
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("payments")
      .select("*, order:orders(description, entite, client:clients(id, full_name))")
      .gte("received_at", start)
      .lt("received_at", end)
      .order("received_at");
    const rows = ((data ?? []) as PaymentRow[]).filter((p) => dansLaVue(vue, p.order?.entite));
    return { rows, error: error?.message ?? null };
  } catch (err) {
    return { rows: [], error: err instanceof Error ? err.message : "Database unavailable" };
  }
}
