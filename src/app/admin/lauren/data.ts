import { getSupabaseAdmin, type Client } from "@/lib/supabase";
import type { Order } from "@/lib/workspace";

/** Clients and their orders (with payments). Errors are returned, never swallowed. */
export async function loadWorkspace(): Promise<{ clients: Client[]; orders: Order[]; error: string | null }> {
  try {
    const supabase = getSupabaseAdmin();
    const [clients, orders] = await Promise.all([
      supabase.from("clients").select("*").order("updated_at", { ascending: false }),
      supabase.from("orders").select("*, payments(*)").order("created_at", { ascending: false }),
    ]);
    const error = clients.error?.message ?? orders.error?.message ?? null;
    return { clients: (clients.data ?? []) as Client[], orders: (orders.data ?? []) as Order[], error };
  } catch (err) {
    return { clients: [], orders: [], error: err instanceof Error ? err.message : "Database unavailable" };
  }
}
