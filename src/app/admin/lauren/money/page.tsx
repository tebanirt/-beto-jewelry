import Link from "next/link";
import { PAYMENT_METHODS, balanceDue, money } from "@/lib/workspace";
import { paymentsForMonth, shiftMonth, validMonth } from "@/lib/paymentsReport";
import { loadWorkspace } from "../data";

export const metadata = { title: "Money — Beto Jewelry" };

export default async function MoneyPage({ searchParams }: PageProps<"/admin/lauren/money">) {
  const month = validMonth((await searchParams).m);
  const [{ rows, error }, { clients, orders, error: wsError }] = await Promise.all([paymentsForMonth(month), loadWorkspace()]);
  const label = new Date(`${month}-15T12:00:00`).toLocaleDateString("en-CA", { month: "long", year: "numeric" });

  const total = rows.reduce((s, p) => s + Number(p.amount), 0);
  const byMethod = PAYMENT_METHODS.map((m) => ({
    ...m,
    sum: rows.filter((p) => p.method === m.value).reduce((s, p) => s + Number(p.amount), 0),
  })).filter((m) => m.sum > 0);
  const deposits = rows.filter((p) => p.kind === "deposit").reduce((s, p) => s + Number(p.amount), 0);

  const names = new Map(clients.map((c) => [c.id, c.full_name]));
  const owed = orders
    .map((o) => ({ o, b: balanceDue(o) }))
    .filter(({ o, b }) => b !== null && b > 0 && o.status !== "quote")
    .sort((a, b) => (b.b ?? 0) - (a.b ?? 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-beto-black">Money</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/admin/lauren/money?m=${shiftMonth(month, -1)}`} aria-label="Previous month" className="px-2">
            ←
          </Link>
          <span className="capitalize">{label}</span>
          <Link href={`/admin/lauren/money?m=${shiftMonth(month, 1)}`} aria-label="Next month" className="px-2">
            →
          </Link>
        </div>
      </div>
      {(error || wsError) && <p role="alert" className="text-sm text-red-700">Could not load everything: {error ?? wsError}</p>}

      <div className="grid grid-cols-2 gap-2">
        <Box label="Received this month" value={money(total)} strong />
        <Box label="Of which deposits" value={money(deposits)} />
        {byMethod.map((m) => (
          <Box key={m.value} label={m.label} value={money(m.sum)} />
        ))}
      </div>

      <section>
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-label text-beto-gold">Payments</h2>
          <a href={`/api/admin/workspace/payments/export?m=${month}`} className="text-xs underline text-beto-gray-light">
            Download for the accountant (CSV)
          </a>
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-beto-gray-light bg-beto-white border border-beto-gray-subtle p-4">No payment recorded this month.</p>
        ) : (
          <ul className="bg-beto-white border border-beto-gray-subtle divide-y divide-beto-gray-subtle text-sm">
            {rows.map((p) => (
              <li key={p.id} className="px-4 py-3 flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate">
                    {p.order?.client ? (
                      <Link className="hover:text-beto-gold" href={`/admin/lauren/clients/${p.order.client.id}`}>
                        {p.order.client.full_name || "Client"}
                      </Link>
                    ) : (
                      "Client"
                    )}
                  </span>
                  <span className="block text-xs text-beto-gray-light">
                    {p.received_at} · <span className="capitalize">{p.kind}</span> · {PAYMENT_METHODS.find((m) => m.value === p.method)?.label}
                    {p.recorded_by ? ` · by ${p.recorded_by}` : ""}
                  </span>
                </span>
                <span className="font-medium whitespace-nowrap">{money(Number(p.amount))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-label text-beto-gold mb-2">Still owed (all months)</h2>
        {owed.length === 0 ? (
          <p className="text-sm text-beto-gray-light">Nothing owed.</p>
        ) : (
          <ul className="bg-beto-white border border-beto-gray-subtle divide-y divide-beto-gray-subtle text-sm">
            {owed.map(({ o, b }) => (
              <li key={o.id} className="px-4 py-3 flex justify-between gap-3">
                <Link className="hover:text-beto-gold truncate" href={`/admin/lauren/clients/${o.client_id}`}>
                  {names.get(o.client_id) || "Client"} <span className="text-xs text-beto-gray-light">· {o.description}</span>
                </Link>
                <span className="font-medium whitespace-nowrap">{money(b)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-beto-gray-light">
        Every payment is recorded here, cash included, so the accountant sees the full picture. GST/QST will be added once the tax numbers arrive.
      </p>
    </div>
  );
}

function Box({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`border p-3 ${strong ? "border-beto-gold bg-beto-gold/10" : "border-beto-gray-subtle bg-beto-white"}`}>
      <p className="text-lg font-medium text-beto-black">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-beto-gray-light">{label}</p>
    </div>
  );
}
