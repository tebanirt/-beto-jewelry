import { getSupabaseAdmin, type ClientStatus } from "@/lib/supabase";
import type { OrderStatus } from "@/lib/workspace";

const PIPELINE: ClientStatus[] = [
  "nouveau",
  "consultation_reservee",
  "consultation_faite",
  "depot_recu",
  "design",
  "production",
  "livre",
];

const FROM_ORDER: Partial<Record<OrderStatus, ClientStatus>> = {
  design: "design",
  production: "production",
  ready: "production",
  delivered: "livre",
};

/**
 * Keeps the client row (used by Rayane's /admin/clients, the follow-up agents
 * and the morning round table) in step with orders and payments:
 *  - sale_price / production_cost = totals of the client's non-cancelled orders;
 *  - status only ever moves forward (a deposit → depot_recu, an order in
 *    production → production…), never backwards and never out of "perdu".
 * Returns an error message, or null when everything was saved.
 */
export async function syncClientFromOrders(clientId: string, opts: { depositReceived?: boolean } = {}): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const [{ data: client, error: clientError }, { data: orders, error: ordersError }] = await Promise.all([
    supabase.from("clients").select("status").eq("id", clientId).maybeSingle<{ status: ClientStatus }>(),
    supabase.from("orders").select("status, total_price, production_cost").eq("client_id", clientId),
  ]);
  if (clientError || ordersError || !client) {
    console.error("syncClientFromOrders read error:", clientError ?? ordersError ?? "client missing");
    return "Could not read the client";
  }

  const active = (orders ?? []).filter((o) => o.status !== "cancelled");
  const sum = (key: "total_price" | "production_cost") => {
    const values = active.map((o) => o[key]).filter((v): v is number => v !== null);
    return values.length ? values.reduce((a, b) => a + Number(b), 0) : null;
  };

  let target: ClientStatus | null = opts.depositReceived ? "depot_recu" : null;
  for (const o of active) {
    const s = FROM_ORDER[o.status as OrderStatus];
    if (s && (!target || PIPELINE.indexOf(s) > PIPELINE.indexOf(target))) target = s;
  }

  const update: Record<string, string | number | null> = {
    sale_price: sum("total_price"),
    production_cost: sum("production_cost"),
    updated_at: new Date().toISOString(),
  };
  if (target && client.status !== "perdu" && PIPELINE.indexOf(target) > PIPELINE.indexOf(client.status)) {
    update.status = target;
    update.followup_count = 0;
  }

  const { error } = await supabase.from("clients").update(update).eq("id", clientId);
  if (error) {
    console.error("syncClientFromOrders update error:", error);
    return "Saved, but the client card could not be updated";
  }
  return null;
}
