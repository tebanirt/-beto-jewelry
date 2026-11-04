import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin, type Client } from "@/lib/supabase";
import { ORDER_STATUSES, PAYMENT_METHODS, balanceDue, firstName, money, paidTotal, type Order } from "@/lib/workspace";
import { ClientDetailsForm, ClientToggles, EditOrderButton, MessagePicker, NewOrderButton, NoteForm, OrderStatusButtons, PaymentForm } from "../../ui";

export const metadata = { title: "Client — Beto Jewelry" };

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Toronto" }) : "—";

export default async function ClientCard({ params }: PageProps<"/admin/lauren/clients/[id]">) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const [{ data: client, error: clientError }, { data: ordersData, error: ordersError }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).maybeSingle<Client>(),
    supabase.from("orders").select("*, payments(*)").eq("client_id", id).order("created_at", { ascending: false }),
  ]);
  if (clientError || ordersError) {
    return <p role="alert" className="text-sm text-red-700">Could not load this client: {(clientError ?? ordersError)?.message}</p>;
  }
  if (!client) notFound();
  const orders = (ordersData ?? []) as Order[];
  const name = firstName(client);
  const notes = client.notes?.trim().split("\n").filter(Boolean).reverse() ?? [];

  return (
    <div className="space-y-6">
      <Link href="/admin/lauren/clients" className="text-xs text-beto-gray-light hover:text-beto-gold">
        ← Clients
      </Link>

      <div className="bg-beto-white border border-beto-gray-subtle p-5">
        <h1 className="text-xl font-medium text-beto-black">
          {client.full_name || "No name"}
          {client.seriousness === "serious" && <span className="ml-2 text-sm text-beto-gold-dark">★ serious</span>}
        </h1>
        <p className="text-xs text-beto-gray-light mt-1">
          {client.source || "—"} · followed by {client.owner === "lauren" ? "Lauren" : "Rayane"} · added {fmtDate(client.created_at)} · last contact{" "}
          {fmtDate(client.last_contact_at)}
        </p>
        <div className="text-sm mt-3 space-y-1">
          {client.phone && (
            <p>
              <a className="underline" href={`tel:${client.phone}`}>
                {client.phone}
              </a>
            </p>
          )}
          {client.email && <p className="text-beto-gray">{client.email}</p>}
          {client.messenger_url && (
            <p>
              <a className="underline" href={client.messenger_url} target="_blank" rel="noreferrer">
                Open Messenger chat
              </a>
            </p>
          )}
        </div>
        <div className="mt-3">
          <ClientDetailsForm
            clientId={client.id}
            initial={{ name: client.full_name ?? "", phone: client.phone ?? "", email: client.email ?? "", messengerUrl: client.messenger_url ?? "" }}
          />
        </div>
        <div className="mt-4">
          <ClientToggles clientId={client.id} serious={client.seriousness === "serious"} paused={client.followups_paused} lost={client.status === "perdu"} />
        </div>
        <MessagePicker name={name} messengerUrl={client.messenger_url} initial={client.seriousness === "serious" ? "serious" : "checkin"} />
      </div>

      <section aria-labelledby="orders-h" className="space-y-3">
        <h2 id="orders-h" className="text-label text-beto-gold">Orders</h2>
        {orders.map((o) => {
          const balance = balanceDue(o);
          const paid = paidTotal(o);
          const margin = o.total_price !== null && o.production_cost !== null ? Number(o.total_price) - Number(o.production_cost) : null;
          const depositPaid = (o.payments ?? []).some((p) => p.kind === "deposit");
          return (
            <article key={o.id} className="bg-beto-white border border-beto-gray-subtle p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-beto-black">{o.description || "Order"}</h3>
                  <p className="text-xs text-beto-gray-light">
                    {[o.stone, o.carat ? `${o.carat} ct` : null, o.metal, o.ring_size ? `size ${o.ring_size}` : null].filter(Boolean).join(" · ") || "Details to add"}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 border border-beto-gold text-beto-black whitespace-nowrap">
                  {ORDER_STATUSES.find((s) => s.value === o.status)?.label}
                </span>
              </div>

              <dl className="grid grid-cols-3 gap-2 mt-4 text-center">
                <Money label="Total" value={money(o.total_price)} />
                <Money label="Paid" value={money(paid)} />
                <Money label="Balance" value={balance === null ? "—" : money(balance)} strong={!!balance && balance > 0} />
              </dl>
              <p className="text-xs text-beto-gray-light mt-2">
                {o.quote_number ? `Quote ${o.quote_number} · ` : ""}
                {o.promised_date ? `Promised ${fmtDate(o.promised_date)} · ` : ""}
                {margin !== null ? `Margin ${money(margin)} (internal)` : "Cost to make not entered yet"}
              </p>

              {(o.payments ?? []).length > 0 && (
                <ul className="mt-3 text-sm divide-y divide-beto-gray-subtle border-t border-beto-gray-subtle">
                  {(o.payments ?? [])
                    .slice()
                    .sort((a, b) => a.received_at.localeCompare(b.received_at))
                    .map((p) => (
                      <li key={p.id} className="py-2 flex justify-between gap-2">
                        <span>
                          {fmtDate(p.received_at)} · <span className="capitalize">{p.kind}</span> ·{" "}
                          {PAYMENT_METHODS.find((m) => m.value === p.method)?.label}
                          {p.note ? <span className="text-beto-gray-light"> — {p.note}</span> : null}
                        </span>
                        <span className="font-medium">{money(Number(p.amount))}</span>
                      </li>
                    ))}
                </ul>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <OrderStatusButtons order={o} />
                <PaymentForm
                  orderId={o.id}
                  suggested={
                    depositPaid
                      ? { kind: "balance", amount: balance && balance > 0 ? balance : null }
                      : { kind: "deposit", amount: o.deposit_amount }
                  }
                />
                <EditOrderButton clientId={client.id} order={o} />
              </div>
              <MessagePicker
                name={name}
                messengerUrl={client.messenger_url}
                initial={o.status === "ready" ? "ready" : "update"}
                orderStatus={o.status}
                balance={balance && balance > 0 ? money(balance) : undefined}
              />
            </article>
          );
        })}
        <NewOrderButton clientId={client.id} />
      </section>

      <section aria-labelledby="notes-h" className="space-y-3">
        <h2 id="notes-h" className="text-label text-beto-gold">Notes</h2>
        <NoteForm clientId={client.id} />
        {notes.length > 0 ? (
          <ul className="bg-beto-white border border-beto-gray-subtle divide-y divide-beto-gray-subtle text-sm">
            {notes.map((n, i) => (
              <li key={i} className="px-4 py-2 text-beto-gray whitespace-pre-line">
                {n}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-beto-gray-light">No notes yet.</p>
        )}
      </section>
    </div>
  );
}

function Money({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`border p-2 ${strong ? "border-beto-gold bg-beto-gold/10" : "border-beto-gray-subtle"}`}>
      <dt className="text-[11px] uppercase tracking-wide text-beto-gray-light">{label}</dt>
      <dd className="text-sm font-medium text-beto-black">{value}</dd>
    </div>
  );
}
