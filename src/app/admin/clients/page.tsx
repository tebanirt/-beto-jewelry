import Link from "next/link";
import { getSupabaseAdmin, type Client } from "@/lib/supabase";
import { StatusSelect } from "./ClientRowControls";
import { STATUS_OPTIONS } from "@/lib/clientStatus";
import FollowupBadge from "./FollowupBadge";
import { followupState } from "@/lib/followups";
import AdminShell, { Card, Stat } from "../AdminShell";
import { argent } from "@/lib/finances";
import { getAdminSession } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clients — CRM" };

type Argent = { prix: number; paye: number; reste: number; profit: number | null; commandes: number };

async function getData(seulementSociete: boolean): Promise<{ clients: Client[]; argentParClient: Map<string, Argent>; canalParClient: Map<string, string>; error: string | null }> {
  try {
    const supabase = getSupabaseAdmin();
    const ventes = supabase.from("v_ventes").select("client_id, canal, prix, paye, reste, profit, cout, echange");
    const [c, v] = await Promise.all([
      supabase.from("clients").select("*").order("updated_at", { ascending: false }),
      // Les montants des ventes d'avant la société : Rayane seulement.
      seulementSociete ? ventes.eq("entite", "societe") : ventes,
    ]);
    if (c.error) throw c.error;
    const argentParClient = new Map<string, Argent>();
    const canalParClient = new Map<string, string>();
    for (const r of v.data ?? []) {
      const id = String(r.client_id);
      canalParClient.set(id, String(r.canal));
      if (r.echange) continue;
      const a = argentParClient.get(id) ?? { prix: 0, paye: 0, reste: 0, profit: null, commandes: 0 };
      a.prix += Number(r.prix ?? 0);
      a.paye += Number(r.paye ?? 0);
      a.reste += Math.max(0, Number(r.reste ?? 0));
      if (r.profit !== null && r.cout !== null) a.profit = (a.profit ?? 0) + Number(r.profit);
      a.commandes += 1;
      argentParClient.set(id, a);
    }
    return { clients: (c.data ?? []) as Client[], argentParClient, canalParClient, error: v.error?.message ?? null };
  } catch (err) {
    return { clients: [], argentParClient: new Map(), canalParClient: new Map(), error: err instanceof Error ? err.message : "Supabase indisponible" };
  }
}

const enDouble = (c: Client) => (c.notes ?? "").toLowerCase().includes("fiche à supprimer");

const TONS: Partial<Record<Client["status"], string>> = {
  nouveau: "bg-beto-gray-subtle/70",
  consultation_reservee: "bg-sky-200",
  consultation_faite: "bg-sky-400",
  depot_recu: "bg-beto-gold-light",
  design: "bg-beto-gold",
  production: "bg-beto-gold-dark",
  livre: "bg-emerald-600",
  perdu: "bg-red-300",
};

export default async function AdminClientsPage({ searchParams }: PageProps<"/admin/clients">) {
  const { filtre, q } = await searchParams;
  const session = await getAdminSession();
  const { clients: tous, argentParClient, canalParClient, error } = await getData(session?.role !== "owner");
  const notConfigured = !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
  const now = new Date();
  const allClients = tous.filter((c) => !enDouble(c));
  const doublons = tous.length - allClients.length;

  const isDue = (c: Client) => {
    const s = followupState(c, now).kind;
    return s === "due" || s === "update_status";
  };
  const dueCount = allClients.filter(isDue).length;
  const pipeline = STATUS_OPTIONS.map((opt) => ({ ...opt, count: allClients.filter((c) => c.status === opt.value).length }));
  const aVenir = allClients.filter((c) => c.consultation_at && new Date(c.consultation_at) > now).length;
  const enCours = allClients.filter((c) => c.status === "design" || c.status === "production").length;
  const aEncaisser = [...argentParClient.values()].reduce((s, a) => s + a.reste, 0);

  // Filtre (pastille) puis recherche par nom, courriel ou téléphone.
  const active =
    typeof filtre === "string" && (filtre === "a_traiter" || filtre === "doublons" || STATUS_OPTIONS.some((o) => o.value === filtre)) ? filtre : null;
  const recherche = typeof q === "string" ? q.trim().toLowerCase() : "";
  let clients =
    active === "doublons"
      ? tous.filter(enDouble)
      : active === "a_traiter"
        ? allClients.filter(isDue)
        : active
          ? allClients.filter((c) => c.status === active)
          : allClients;
  if (recherche) {
    clients = clients.filter((c) => [c.full_name, c.email, c.phone, c.notes].some((f) => (f ?? "").toLowerCase().includes(recherche)));
  }
  const activeLabel =
    active === "a_traiter" ? "À traiter aujourd'hui" : active === "doublons" ? "Fiches en double à supprimer" : STATUS_OPTIONS.find((o) => o.value === active)?.label;
  const lien = (f: string | null) => {
    const p = new URLSearchParams();
    if (f) p.set("filtre", f);
    if (recherche) p.set("q", recherche);
    const s = p.toString();
    return s ? `/admin/clients?${s}` : "/admin/clients";
  };
  const chip = (selected: boolean, highlight = false) =>
    `inline-flex items-center gap-2 text-xs px-3 py-1.5 border transition-colors ${
      selected
        ? "bg-beto-black text-white border-beto-black"
        : highlight
          ? "border-beto-gold text-beto-black bg-beto-gold/10 hover:border-beto-black"
          : "border-beto-gray-subtle bg-beto-white text-beto-gray hover:border-beto-gold hover:text-beto-black"
    }`;

  return (
    <AdminShell
      active="clients"
      eyebrow="Tous les clients"
      title="Clients"
      subtitle={`${allClients.length} clients dans le CRM${doublons > 0 ? ` (sans ${doublons} fiche${doublons > 1 ? "s" : ""} en double à supprimer)` : ""}.`}
      actions={
        <form method="get" action="/admin/clients" className="flex items-center gap-2" role="search">
          {active && <input type="hidden" name="filtre" value={active} />}
          <label htmlFor="recherche-client" className="sr-only">
            Chercher un client
          </label>
          <input
            id="recherche-client"
            name="q"
            defaultValue={recherche}
            placeholder="Chercher un nom, un courriel…"
            className="w-60 max-w-full px-3 py-2 text-sm bg-beto-white border border-beto-gray-subtle focus:outline-none focus:border-beto-gold"
          />
          <button type="submit" className="px-3 py-2 text-xs uppercase tracking-widest bg-beto-black text-white hover:bg-beto-gold-dark transition-colors">
            Chercher
          </button>
        </form>
      }
    >
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <Stat label="À traiter aujourd'hui" value={dueCount} tone={dueCount > 0 ? "gold" : "default"} hint="Relances dues et statuts à mettre à jour" />
        <Stat label="Consultations à venir" value={aVenir} hint="Rendez-vous réservés" />
        <Stat label="Pièces en cours" value={enCours} hint="Design ou production" />
        <Stat label="À encaisser" value={argent(aEncaisser)} hint={<Link href="/admin/finances" className="underline hover:text-beto-black">Voir les finances</Link>} />
      </div>

      {allClients.length > 0 && (
        <nav className="flex flex-wrap gap-2 mb-6" aria-label="Filtrer les clients">
          <Link href={lien(null)} aria-current={!active ? "page" : undefined} className={chip(!active)}>
            Tous <span className="tabular-nums opacity-70">{allClients.length}</span>
          </Link>
          <Link href={lien("a_traiter")} aria-current={active === "a_traiter" ? "page" : undefined} className={chip(active === "a_traiter", dueCount > 0)}>
            À traiter aujourd&apos;hui <span className="tabular-nums opacity-70">{dueCount}</span>
          </Link>
          {pipeline
            .filter((s) => s.count > 0)
            .map((s) => (
              <Link key={s.value} href={lien(s.value)} aria-current={active === s.value ? "page" : undefined} className={chip(active === s.value)}>
                <i className={`w-2 h-2 rounded-full ${TONS[s.value] ?? "bg-beto-gray-subtle"}`} aria-hidden />
                {s.label} <span className="tabular-nums opacity-70">{s.count}</span>
              </Link>
            ))}
          {doublons > 0 && (
            <Link href={lien("doublons")} aria-current={active === "doublons" ? "page" : undefined} className={chip(active === "doublons")}>
              En double, à supprimer <span className="tabular-nums opacity-70">{doublons}</span>
            </Link>
          )}
        </nav>
      )}

      {(active || recherche) && (
        <p className="text-sm text-beto-gray mb-4">
          {activeLabel ?? "Recherche"}
          {recherche && <> « {recherche} »</>} : {clients.length} client{clients.length > 1 ? "s" : ""}.{" "}
          <Link href="/admin/clients" className="underline text-beto-gray-light hover:text-beto-black">
            Tout voir
          </Link>
        </p>
      )}

      {notConfigured && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-6">
          Supabase n&apos;est pas encore configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants dans les variables d&apos;environnement).
        </p>
      )}
      {error && !notConfigured && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-6">
          Une partie des données n&apos;a pas pu être lue : {error}
        </p>
      )}
      {!notConfigured && allClients.length === 0 && <p className="text-sm text-beto-gray-light">Aucun client encore enregistré.</p>}
      {(active || recherche) && clients.length === 0 && <p className="text-sm text-beto-gray-light">Aucun client ne correspond.</p>}

      {clients.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-beto-gray-light border-b border-beto-gray-subtle">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Vente</th>
                <th className="px-4 py-3 font-medium">Consultation</th>
                <th className="px-4 py-3 font-medium">Relance</th>
                <th className="px-4 py-3 font-medium">Mis à jour</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const a = argentParClient.get(client.id);
                return (
                  <tr key={client.id} className="border-b border-beto-gray-subtle/60 last:border-0 align-top hover:bg-beto-offwhite/60 transition-colors">
                    <td className="px-4 py-3 min-w-56">
                      <Link href={`/admin/clients/${client.id}`} className="font-medium text-beto-black hover:text-beto-gold-dark">
                        {client.full_name || <span className="text-beto-gray-light italic">Sans nom</span>}
                      </Link>
                      {(client.email || client.phone) && (
                        <div className="text-xs text-beto-gray-light mt-0.5 break-all">{[client.email, client.phone].filter(Boolean).join(" · ")}</div>
                      )}
                      <div className="text-[11px] text-beto-gray-light mt-0.5">
                        {canalParClient.get(client.id) ?? client.source ?? "Provenance inconnue"}
                        {client.owner === "lauren" && <span className="ml-1.5 text-beto-gold-dark">· Lauren</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect clientId={client.id} status={client.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                      {a && a.prix > 0 ? (
                        <>
                          <div className="text-beto-black">{argent(a.prix)}</div>
                          <div className="text-xs text-beto-gray-light">{a.reste > 0 ? `reste ${argent(a.reste)}` : "payé"}</div>
                        </>
                      ) : (
                        <span className="text-beto-gray-light">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-beto-gray whitespace-nowrap">
                      {client.consultation_at
                        ? new Date(client.consultation_at).toLocaleString("fr-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" })
                        : <span className="text-beto-gray-light">—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <FollowupBadge state={followupState(client, now)} />
                    </td>
                    <td className="px-4 py-3 text-beto-gray-light whitespace-nowrap">
                      {new Date(client.updated_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short", timeZone: "America/Toronto" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </AdminShell>
  );
}
