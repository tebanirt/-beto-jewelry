import Link from "next/link";
import { getSupabaseAdmin, type Client } from "@/lib/supabase";
import { StatusSelect, LogoutButton, STATUS_OPTIONS } from "./ClientRowControls";
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

export default async function AdminClientsPage() {
  const clients = await getClients();
  const notConfigured = !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
  const now = new Date();
  const dueCount = clients.filter((c) => {
    const s = followupState(c, now).kind;
    return s === "due" || s === "update_status";
  }).length;
  const pipeline = STATUS_OPTIONS.map((opt) => ({
    ...opt,
    count: clients.filter((c) => c.status === opt.value).length,
  })).filter((s) => s.count > 0);

  return (
    <section className="min-h-screen bg-beto-offwhite px-5 py-10" style={{ paddingTop: "calc(var(--nav-height, 0px) + 2.5rem)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-label text-beto-gold mb-1">Beto Jewelry</p>
            <h1 className="text-2xl font-medium text-beto-black">Clients ({clients.length})</h1>
          </div>
          <LogoutButton />
        </div>

        {clients.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`text-xs px-3 py-1.5 border ${dueCount > 0 ? "border-beto-gold text-beto-black bg-beto-gold/10" : "border-beto-gray-subtle text-beto-gray-light"}`}>
              À traiter aujourd&apos;hui : {dueCount}
            </span>
            {pipeline.map((s) => (
              <span key={s.value} className="text-xs px-3 py-1.5 border border-beto-gray-subtle text-beto-gray">
                {s.label} : {s.count}
              </span>
            ))}
          </div>
        )}

        {notConfigured && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-6">
            Supabase n&apos;est pas encore configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants dans les variables d&apos;environnement).
          </p>
        )}

        {!notConfigured && clients.length === 0 && (
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
