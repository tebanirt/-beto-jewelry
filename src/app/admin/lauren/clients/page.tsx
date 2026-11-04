import Link from "next/link";
import { getAdminSession } from "@/lib/adminSession";
import { balanceDue, money } from "@/lib/workspace";
import { loadWorkspace } from "../data";
import { QuickAdd } from "../ui";

export const metadata = { title: "Clients — Beto Jewelry" };

const STATUS_EN: Record<string, string> = {
  nouveau: "New",
  consultation_reservee: "Meeting booked",
  consultation_faite: "Met, not bought",
  depot_recu: "Deposit in",
  design: "3D design",
  production: "Production",
  livre: "Delivered",
  perdu: "Lost",
};

export default async function ClientsPage({ searchParams }: PageProps<"/admin/lauren/clients">) {
  const session = await getAdminSession();
  const { q, who } = await searchParams;
  const query = (typeof q === "string" ? q : "").trim().toLowerCase();
  const scope = who === "all" || session?.role === "owner" ? "all" : who === "lost" ? "lost" : "mine";
  const { clients, orders, error } = await loadWorkspace();

  const list = clients
    .filter((c) => (scope === "lost" ? c.status === "perdu" : c.status !== "perdu" || query))
    .filter((c) => scope !== "mine" || c.owner === "lauren" || query)
    .filter((c) => {
      if (!query) return true;
      return [c.full_name, c.phone, c.email, c.notes].some((v) => v?.toLowerCase().includes(query));
    });

  const owedByClient = new Map<string, number>();
  for (const o of orders) {
    const b = balanceDue(o);
    if (b && b > 0 && o.status !== "quote") owedByClient.set(o.client_id, (owedByClient.get(o.client_id) ?? 0) + b);
  }

  const tab = (value: string, label: string) => (
    <Link
      href={value === "mine" ? "/admin/lauren/clients" : `/admin/lauren/clients?who=${value}`}
      className={`text-xs px-3 py-1.5 border ${scope === value ? "bg-beto-black text-white border-beto-black" : "border-beto-gray-subtle text-beto-gray"}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-medium text-beto-black">Clients</h1>
      {error && <p role="alert" className="text-sm text-red-700">Could not load everything: {error}</p>}

      <form className="flex gap-2" action="/admin/lauren/clients">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search name, phone, email, notes…"
          className="w-full px-3 py-3 border border-beto-gray-subtle bg-beto-white text-base sm:text-sm focus:outline-none focus:border-beto-gold"
        />
        {scope !== "mine" && <input type="hidden" name="who" value={scope} />}
        <button className="px-4 bg-beto-black text-white text-xs uppercase tracking-widest">Search</button>
      </form>

      {session?.role !== "owner" && (
        <div className="flex gap-2">
          {tab("mine", "My clients")}
          {tab("all", "Everyone")}
          {tab("lost", "Lost")}
        </div>
      )}

      <QuickAdd compact />

      {list.length === 0 ? (
        <p className="text-sm text-beto-gray-light">No clients here yet.</p>
      ) : (
        <ul className="bg-beto-white border border-beto-gray-subtle divide-y divide-beto-gray-subtle">
          {list.map((c) => {
            const owed = owedByClient.get(c.id);
            return (
              <li key={c.id}>
                <Link href={`/admin/lauren/clients/${c.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-beto-offwhite">
                  <span className="min-w-0">
                    <span className="block font-medium text-beto-black truncate">
                      {c.full_name || "No name"}
                      {c.seriousness === "serious" && <span className="ml-2 text-xs text-beto-gold-dark">★</span>}
                    </span>
                    <span className="block text-xs text-beto-gray-light truncate">
                      {STATUS_EN[c.status] ?? c.status} · {c.owner === "lauren" ? "Lauren" : "Rayane"}
                      {c.phone ? ` · ${c.phone}` : ""}
                    </span>
                  </span>
                  {owed ? <span className="text-xs text-beto-black whitespace-nowrap">owes {money(owed)}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
