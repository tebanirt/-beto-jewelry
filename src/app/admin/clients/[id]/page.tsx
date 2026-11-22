import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin, type Client, type Submission } from "@/lib/supabase";
import { StatusSelect, FollowupControls, PaymentLinkControls, MarginControls } from "../ClientRowControls";
import { DEPOSIT_AMOUNT_CAD } from "@/lib/stripe";
import FollowupBadge from "../FollowupBadge";
import { followupState } from "@/lib/followups";
import NotesEditor from "./NotesEditor";
import AdminShell, { Card, SectionTitle } from "../../AdminShell";
import { OBJECTIF_PAR_PIECE, argent, pourcent } from "@/lib/finances";
import type { Order, Payment } from "@/lib/workspace";

export const dynamic = "force-dynamic";

const ETAPES: Record<string, string> = {
  quote: "Soumission envoyée",
  design: "Design 3D",
  production: "En production",
  ready: "Prête à remettre",
  delivered: "Remise",
  cancelled: "Annulée",
};
const TYPES_PAIEMENT: Record<string, string> = { deposit: "Dépôt", balance: "Solde", other: "Autre" };
const MODES: Record<string, string> = { interac: "Interac", cash: "Comptant", card: "Carte", stripe: "Lien Stripe", other: "Mode à confirmer" };

async function getClientWithSubmissions(id: string) {
  const supabase = getSupabaseAdmin();
  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client) return null;
  const [{ data: submissions }, { data: orders, error: ordersError }] = await Promise.all([
    supabase.from("submissions").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("orders").select("*, payments(*)").eq("client_id", id).order("created_at", { ascending: false }),
  ]);
  return {
    client: client as Client,
    submissions: (submissions ?? []) as Submission[],
    orders: (orders ?? []) as Order[],
    ordersError: ordersError?.message ?? null,
  };
}

const dateCourte = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric", timeZone: iso.length === 10 ? "UTC" : "America/Toronto" });

function Ligne({ label, children, fort = false }: { label: string; children: React.ReactNode; fort?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="text-beto-gray-light">{label}</dt>
      <dd className={`tabular-nums text-right ${fort ? "font-medium text-beto-black" : "text-beto-gray"}`}>{children}</dd>
    </div>
  );
}

function Commande({ order }: { order: Order }) {
  const payments = [...((order.payments ?? []) as Payment[])].sort((a, b) => a.received_at.localeCompare(b.received_at));
  const paye = payments.reduce((s, p) => s + Number(p.amount), 0);
  const prix = order.total_price === null ? null : Number(order.total_price);
  const cout = order.production_cost === null ? null : Number(order.production_cost);
  const profit = prix !== null && cout !== null ? prix - cout : null;
  const marge = profit !== null && prix ? (profit / prix) * 100 : null;
  const reste = prix !== null ? prix - paye : null;
  const echange = prix === 0;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-medium text-beto-black">{order.description || "Commande"}</p>
          <p className="text-xs text-beto-gray-light mt-0.5">
            {[order.stone, order.metal, order.ring_size ? `grandeur ${order.ring_size}` : null].filter(Boolean).join(" · ") || "Détails à compléter"}
            {order.quote_number && <> · {order.quote_number}</>}
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 border border-beto-gold/60 text-beto-gold-dark whitespace-nowrap">{ETAPES[order.status] ?? order.status}</span>
      </div>

      <dl className="text-sm border-t border-beto-gray-subtle pt-2">
        <Ligne label="Prix">{prix === null ? <span className="text-amber-700">à entrer</span> : echange ? "Offerte (échange marketing)" : argent(prix)}</Ligne>
        <Ligne label="Coût de production">{cout === null ? <span className="text-amber-700">à entrer</span> : argent(cout)}</Ligne>
        <Ligne label="Profit" fort>
          <span className={profit === null ? "" : profit < 0 ? "text-red-700" : profit >= OBJECTIF_PAR_PIECE ? "text-emerald-700" : ""}>
            {argent(profit)}
            {marge !== null && !echange && <span className="text-beto-gray-light font-normal"> · {pourcent(marge)}</span>}
          </span>
        </Ligne>
        <Ligne label="Payé">{argent(paye)}</Ligne>
        {!echange && <Ligne label="Reste à payer" fort>{reste === null ? "—" : reste > 0 ? argent(reste) : "Payé en entier"}</Ligne>}
        {order.promised_date && <Ligne label="Promise pour le">{dateCourte(order.promised_date)}</Ligne>}
      </dl>

      {payments.length > 0 && (
        <div className="mt-3 border-t border-beto-gray-subtle pt-3">
          <p className="text-label text-beto-gray-light mb-2">Paiements</p>
          <ul className="grid gap-1.5 text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between gap-3">
                <span className="text-beto-gray">
                  {dateCourte(p.received_at)} · {TYPES_PAIEMENT[p.kind] ?? p.kind}
                  <span className="text-beto-gray-light"> · {MODES[p.method] ?? p.method}</span>
                </span>
                <span className="tabular-nums text-beto-black">{argent(Number(p.amount))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {order.notes && (
        <details className="mt-3 border-t border-beto-gray-subtle pt-3">
          <summary className="text-xs text-beto-gray-light cursor-pointer hover:text-beto-black">Notes de la commande</summary>
          <p className="text-xs text-beto-gray whitespace-pre-line mt-2 leading-relaxed">{order.notes}</p>
        </details>
      )}
    </Card>
  );
}

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getClientWithSubmissions(id);
  if (!result) notFound();
  const { client, submissions, orders, ordersError } = result;

  const vraies = orders.filter((o) => o.status !== "quote" && o.status !== "cancelled");
  const totalVentes = vraies.reduce((s, o) => s + Number(o.total_price ?? 0), 0);
  const totalPaye = vraies.reduce((s, o) => s + (o.payments ?? []).reduce((t, p) => t + Number(p.amount), 0), 0);
  const avecCout = vraies.filter((o) => o.total_price !== null && o.production_cost !== null);
  const totalProfit = avecCout.length ? avecCout.reduce((s, o) => s + Number(o.total_price) - Number(o.production_cost), 0) : null;
  // Commande la plus récente pas encore livrée : sert à proposer les montants des liens de paiement.
  const enCours = orders.find((o) => o.status !== "cancelled" && o.status !== "delivered") ?? null;

  return (
    <AdminShell
      active="clients"
      eyebrow={<Link href="/admin/clients" className="hover:text-beto-black">← Clients</Link>}
      title={client.full_name || "Sans nom"}
      subtitle={
        <>
          {[client.email, client.phone].filter(Boolean).join(" · ") || "Aucun courriel ni téléphone"}
          <br />
          <span className="text-beto-gray-light">
            Provenance : {client.source || "—"}
            {client.attribution && <> · Pub : {client.attribution}</>} · Dans le CRM depuis le {dateCourte(client.created_at)}
            {client.last_contact_at && <> · Dernier message de ta part : {dateCourte(client.last_contact_at)}</>}
          </span>
        </>
      }
      actions={<StatusSelect clientId={client.id} status={client.status} />}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="min-w-0 grid gap-8 content-start">
          <Card className="p-6">
            {followupState(client).kind !== "none" && (
              <div className="mb-4">
                <FollowupBadge state={followupState(client)} />
              </div>
            )}
            <NotesEditor clientId={client.id} initialNotes={client.notes || ""} />
            <FollowupControls
              clientId={client.id}
              consultationAt={client.consultation_at}
              followupsPaused={client.followups_paused}
              followupCount={client.followup_count}
            />
            {orders.length === 0 && <MarginControls clientId={client.id} salePrice={client.sale_price} productionCost={client.production_cost} />}
            <PaymentLinkControls
              clientId={client.id}
              depositAmount={DEPOSIT_AMOUNT_CAD}
              orderTotal={enCours?.total_price === null || enCours?.total_price === undefined ? null : Number(enCours.total_price)}
              orderPaid={(enCours?.payments ?? []).reduce((t, p) => t + Number(p.amount), 0)}
            />
          </Card>

          <section>
            <SectionTitle>Historique des formulaires ({submissions.length})</SectionTitle>
            <div className="flex flex-col gap-3">
              {submissions.length === 0 && <p className="text-sm text-beto-gray-light">Aucune soumission enregistrée.</p>}
              {submissions.map((s) => (
                <Card key={s.id} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-label text-beto-gold">{s.form_type}</span>
                    <span className="text-xs text-beto-gray-light">{new Date(s.created_at).toLocaleString("fr-CA")}</span>
                  </div>
                  <dl className="grid grid-cols-1 gap-1.5 text-sm">
                    {Object.entries(s.fields)
                      .filter(([key]) => key !== "email")
                      .map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <dt className="text-beto-gray-light min-w-32 flex-shrink-0">{key}</dt>
                          <dd className="text-beto-black break-words min-w-0">{String(value)}</dd>
                        </div>
                      ))}
                  </dl>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <aside className="min-w-0 grid gap-4 content-start">
          <SectionTitle>Commandes et paiements</SectionTitle>
          {ordersError && <p className="text-sm text-red-700">Commandes illisibles : {ordersError}</p>}
          {orders.length === 0 ? (
            <Card className="p-5 text-sm text-beto-gray-light">Aucune commande pour ce client.</Card>
          ) : (
            <>
              {vraies.length > 1 && (
                <Card className="p-5">
                  <dl className="text-sm">
                    <Ligne label="Total des ventes" fort>{argent(totalVentes)}</Ligne>
                    <Ligne label="Payé">{argent(totalPaye)}</Ligne>
                    <Ligne label="Profit connu" fort>{argent(totalProfit)}</Ligne>
                  </dl>
                </Card>
              )}
              {orders.map((o) => (
                <Commande key={o.id} order={o} />
              ))}
            </>
          )}
          <p className="text-xs text-beto-gray-light">Montants avant taxes. Données internes : jamais visibles du client.</p>
        </aside>
      </div>
    </AdminShell>
  );
}
