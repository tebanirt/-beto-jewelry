import Link from "next/link";
import { getAdminSession } from "@/lib/adminSession";
import { balanceDue, followupsDue, orderAlerts, money, firstName } from "@/lib/workspace";
import { loadWorkspace } from "./data";
import { FollowupActions, MessagePicker, QuickAdd } from "./ui";

export const metadata = { title: "Today — Beto Jewelry" };

export default async function TodayPage({ searchParams }: PageProps<"/admin/lauren">) {
  const session = await getAdminSession();
  const { view } = await searchParams;
  const showAll = view === "all";
  const { clients, orders, error } = await loadWorkspace();
  const now = new Date();

  // Lauren's own clients by default; Rayane's clients have their own email agent.
  const mine = session?.role === "owner" || showAll ? clients : clients.filter((c) => c.owner === "lauren");
  const followups = followupsDue(mine, now);
  const alerts = orderAlerts(orders, clients, now);
  const owed = orders.reduce((sum, o) => {
    const b = balanceDue(o);
    return b && b > 0 && o.status !== "quote" ? sum + b : sum;
  }, 0);
  const today = now.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Toronto" });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium text-beto-black">Today</h1>
        <p className="text-sm text-beto-gray-light">{today}</p>
        {error && <p role="alert" className="text-sm text-red-700 mt-2">Could not load everything: {error}</p>}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Follow-ups" value={String(followups.length)} highlight={followups.length > 0} />
        <Stat label="Orders to update" value={String(alerts.length)} highlight={alerts.some((a) => a.urgent)} />
        <Stat label="Still owed" value={money(owed)} />
      </div>

      <QuickAdd compact />

      <section aria-labelledby="fu">
        <div className="flex items-baseline justify-between mb-3">
          <h2 id="fu" className="text-label text-beto-gold">Follow up today</h2>
          {session?.role !== "owner" && (
            <Link href={showAll ? "/admin/lauren" : "/admin/lauren?view=all"} className="text-xs underline text-beto-gray-light">
              {showAll ? "Only my clients" : "Include Rayane's clients"}
            </Link>
          )}
        </div>
        {followups.length === 0 ? (
          <p className="text-sm text-beto-gray-light bg-beto-white border border-beto-gray-subtle p-4">
            Nobody to follow up today. Nice work.
          </p>
        ) : (
          <ul className="space-y-3">
            {followups.map(({ client, daysQuiet, everyDays }) => (
              <li key={client.id} className="bg-beto-white border border-beto-gray-subtle p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/admin/lauren/clients/${client.id}`} className="font-medium text-beto-black hover:text-beto-gold">
                      {client.full_name || "No name"}
                    </Link>
                    {client.seriousness === "serious" && <span className="ml-2 text-xs text-beto-gold-dark">★ serious</span>}
                    <p className="text-xs text-beto-gray-light mt-0.5">
                      Last contact {daysQuiet} day{daysQuiet === 1 ? "" : "s"} ago · every {everyDays} days · {client.source || "—"}
                    </p>
                  </div>
                </div>
                {lastNote(client.notes) && <p className="text-sm text-beto-gray mt-2 line-clamp-2">{lastNote(client.notes)}</p>}
                <FollowupActions
                  clientId={client.id}
                  name={firstName(client)}
                  serious={client.seriousness === "serious"}
                  messengerUrl={client.messenger_url}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="orders">
        <h2 id="orders" className="text-label text-beto-gold mb-3">Orders that need you</h2>
        {alerts.length === 0 ? (
          <p className="text-sm text-beto-gray-light bg-beto-white border border-beto-gray-subtle p-4">All orders are up to date.</p>
        ) : (
          <ul className="space-y-3">
            {alerts.map(({ order, client, reason, urgent }) => {
              const balance = balanceDue(order);
              return (
                <li key={order.id} className={`bg-beto-white border p-4 ${urgent ? "border-beto-gold" : "border-beto-gray-subtle"}`}>
                  <Link href={`/admin/lauren/clients/${order.client_id}`} className="font-medium text-beto-black hover:text-beto-gold">
                    {client?.full_name || "Client"}
                  </Link>
                  <p className="text-xs text-beto-gray-light">{order.description || "Order"}</p>
                  <p className={`text-sm mt-1 ${urgent ? "text-beto-black" : "text-beto-gray"}`}>{reason}</p>
                  <MessagePicker
                    name={firstName(client)}
                    messengerUrl={client?.messenger_url}
                    initial={order.status === "ready" ? "ready" : balance && balance > 0 && order.status === "delivered" ? "balance" : "update"}
                    orderStatus={order.status}
                    balance={balance && balance > 0 ? balance : undefined}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-xs text-beto-gray-light">
        Need a price? Use the <Link className="underline" href="/admin/lauren/price">Price</Link> tab. Anything outside the grid: ask Rayane.
      </p>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`border p-3 ${highlight ? "border-beto-gold bg-beto-gold/10" : "border-beto-gray-subtle bg-beto-white"}`}>
      <p className="text-lg font-medium text-beto-black">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-beto-gray-light">{label}</p>
    </div>
  );
}

function lastNote(notes: string | null) {
  const lines = notes?.trim().split("\n").filter(Boolean);
  return lines?.length ? lines[lines.length - 1] : null;
}
