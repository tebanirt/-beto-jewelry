import Link from "next/link";
import { getSupabaseAdmin, type Client } from "@/lib/supabase";
import { StatusSelect, LogoutButton } from "./ClientRowControls";
import { STATUS_OPTIONS } from "@/lib/clientStatus";
import FollowupBadge from "./FollowupBadge";
import { followupState } from "@/lib/followups";

export const dynamic = "force-dynamic";

async function getClients(): Promise<Client[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminClientsPage({ searchParams }: PageProps<"/admin/clients">) {
  const { filtre } = await searchParams;
  const allClients = await getClients();
  const notConfigured = !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
  const now = new Date();
  const isDue = (c: Client) => {
    const s = followupState(c, now).kind;
    return s === "due" || s === "update_status";
  };
  const dueCount = allClients.filter(isDue).length;
  const pipeline = STATUS_OPTIONS.map((opt) => ({
    ...opt,
    count: allClients.filter((c) => c.status === opt.value).length,
  })).filter((s) => s.count > 0);

  // Filtre choisi en touchant une pastille (?filtre=a_traiter ou un statut) ; sans filtre : tout.
  const active = typeof filtre === "string" && (filtre === "a_traiter" || STATUS_OPTIONS.some((o) => o.value === filtre)) ? filtre : null;
  const clients = active === "a_traiter" ? allClients.filter(isDue) : active ? allClients.filter((c) => c.status === active) : allClients;
  const activeLabel = active === "a_traiter" ? "À traiter aujourd'hui" : STATUS_OPTIONS.find((o) => o.value === active)?.label;
  const chip = (selected: boolean, highlight = false) =>
    `text-xs px-3 py-1.5 border ${
      selected
        ? "bg-beto-black text-white border-beto-black"
        : highlight
          ? "border-beto-gold text-beto-black bg-beto-gold/10 hover:border-beto-black"
          : "border-beto-gray-subtle text-beto-gray hover:border-beto-gold hover:text-beto-black"
    }`;

  return (
    <section className="min-h-screen bg-beto-offwhite px-5 py-10" style={{ paddingTop: "2.5rem" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-label text-beto-gold mb-1">Beto Jewelry</p>
            <h1 className="text-2xl font-medium text-beto-black">Clients ({allClients.length})</h1>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/admin/funnel" className="text-beto-gray-light hover:text-beto-black underline">Formulaire : où les clients s&apos;arrêtent</Link>
            <Link href="/admin/lauren" className="text-beto-gray-light hover:text-beto-black underline">Espace Lauren</Link>
            <Link href="/admin/team" className="text-beto-gray-light hover:text-beto-black underline">Équipe</Link>
            <LogoutButton />
          </div>
        </div>

        {allClients.length > 0 && (
          <nav className="flex flex-wrap gap-2 mb-6" aria-label="Filtrer les clients">
            <Link href="/admin/clients" aria-current={!active ? "page" : undefined} className={chip(!active)}>
              Tous : {allClients.length}
            </Link>
            <Link
              href="/admin/clients?filtre=a_traiter"
              aria-current={active === "a_traiter" ? "page" : undefined}
              className={chip(active === "a_traiter", dueCount > 0)}
            >
              À traiter aujourd&apos;hui : {dueCount}
            </Link>
            {pipeline.map((s) => (
              <Link
                key={s.value}
                href={`/admin/clients?filtre=${s.value}`}
                aria-current={active === s.value ? "page" : undefined}
                className={chip(active === s.value)}
              >
                {s.label} : {s.count}
              </Link>
            ))}
          </nav>
        )}

        {active && (
          <p className="text-sm text-beto-gray mb-4">
            {activeLabel} : {clients.length} client{clients.length > 1 ? "s" : ""}.{" "}
            <Link href="/admin/clients" className="underline text-beto-gray-light hover:text-beto-black">Voir tout</Link>
          </p>
        )}

        {active && clients.length === 0 && <p className="text-sm text-beto-gray-light">Aucun client dans cette section.</p>}

        {notConfigured && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-6">
            Supabase n&apos;est pas encore configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants dans les variables d&apos;environnement).
          </p>
        )}

        {!notConfigured && allClients.length === 0 && (
          <p className="text-sm text-beto-gray-light">Aucun client encore enregistré.</p>
        )}

        {clients.length > 0 && (
          <div className="bg-beto-white border border-beto-gray-subtle/40 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-beto-gray-light border-b border-beto-gray-subtle/40">
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Consultation</th>
                  <th className="px-4 py-3">Relance</th>
                  <th className="px-4 py-3">Mis à jour</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-beto-gray-subtle/20 last:border-0">
                    <td className="px-4 py-3 font-medium text-beto-black">
                      {client.full_name || <span className="text-beto-gray-light italic">Sans nom</span>}
                    </td>
                    <td className="px-4 py-3 text-beto-gray-light">
                      <div>{client.email}</div>
                      <div>{client.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-beto-gray-light">{client.source}</td>
                    <td className="px-4 py-3">
                      <StatusSelect clientId={client.id} status={client.status} />
                    </td>
                    <td className="px-4 py-3 text-beto-gray-light whitespace-nowrap">
                      {client.consultation_at
                        ? new Date(client.consultation_at).toLocaleString("fr-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <FollowupBadge state={followupState(client, now)} />
                    </td>
                    <td className="px-4 py-3 text-beto-gray-light whitespace-nowrap">
                      {new Date(client.updated_at).toLocaleDateString("fr-CA")}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/clients/${client.id}`} className="text-beto-gold hover:underline">
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
