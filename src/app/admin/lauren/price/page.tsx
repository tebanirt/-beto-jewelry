import { getSupabaseAdmin } from "@/lib/supabase";
import PriceTool, { type RecentQuote } from "./PriceTool";

export const metadata = { title: "Price — Beto Jewelry" };

export default async function PricePage() {
  const supabase = getSupabaseAdmin();
  const [clients, quotes] = await Promise.all([
    supabase.from("clients").select("id, full_name").neq("status", "perdu").order("updated_at", { ascending: false }).limit(200),
    supabase
      .from("quotes")
      .select("id, created_at, carat, metal, stone, options, offered_price, floor_price, outcome, client:clients(full_name)")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);
  const error = clients.error?.message ?? quotes.error?.message ?? null;

  return (
    <div>
      <h1 className="text-2xl font-medium text-beto-black mb-1">Price</h1>
      <p className="text-sm text-beto-gray-light mb-6">
        Engagement rings in lab-grown diamond (E colour, VVS2, IGI certificate). Calculated from Rayane&apos;s real costs, before tax.
      </p>
      {error && <p role="alert" className="text-sm text-red-700 mb-4">Could not load everything: {error}</p>}
      <PriceTool
        clients={(clients.data ?? []).map((c) => ({ id: c.id as string, name: (c.full_name as string | null) || "No name" }))}
        recent={(quotes.data ?? []) as unknown as RecentQuote[]}
      />
    </div>
  );
}
