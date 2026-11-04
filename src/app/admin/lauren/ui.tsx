"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEMPLATE_IDS, renderTemplate, templateLabel, STATUS_WORDS, type Lang, type TemplateId } from "@/lib/laurenTemplates";
import { ORDER_STATUSES, PAYMENT_METHODS, MARKETPLACE_DEPOSIT, money, type Order, type OrderStatus } from "@/lib/workspace";

export const input =
  "w-full px-3 py-3 border border-beto-gray-subtle bg-beto-white text-base sm:text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold";
export const primaryBtn =
  "px-4 py-3 bg-beto-black text-white text-xs font-medium uppercase tracking-widest hover:bg-beto-gold transition-colors disabled:opacity-50";
export const ghostBtn =
  "px-3 py-2.5 border border-beto-gray-subtle text-xs text-beto-gray hover:border-beto-gold hover:text-beto-black transition-colors disabled:opacity-50";

/** JSON call that always reports failures instead of failing silently. */
export async function api<T = Record<string, unknown>>(
  path: string,
  method: "POST" | "PATCH",
  body: unknown
): Promise<{ ok: boolean; status: number; data: T & { error?: string; warning?: string | null } }> {
  try {
    const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string; warning?: string | null };
    if (res.status === 401) window.location.href = "/admin/login";
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "No connection — nothing was saved." } as T & { error?: string } };
  }
}

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(path: string, method: "POST" | "PATCH", body: unknown) {
    setBusy(true);
    setError(null);
    const res = await api(path, method, body);
    setBusy(false);
    if (!res.ok) setError(res.data.error || "Not saved. Try again.");
    else if (res.data.warning) setError(res.data.warning);
    if (res.ok) router.refresh();
    return res;
  }
  return { busy, error, run };
}

export function ErrorLine({ error }: { error: string | null }) {
  if (!error) return null;
  return <p role="alert" className="text-sm text-red-700 mt-2">{error}</p>;
}

/* ---------- Copy-ready messages ---------- */

export function CopyText({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={ghostBtn}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy this text:", text);
        }
      }}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}

export function MessagePicker({
  name,
  messengerUrl,
  initial = "checkin",
  orderStatus,
  balance,
}: {
  name: string;
  messengerUrl?: string | null;
  initial?: TemplateId;
  orderStatus?: OrderStatus;
  balance?: number;
}) {
  const [id, setId] = useState<TemplateId>(initial);
  const [lang, setLang] = useState<Lang>("en");
  const status = orderStatus ? STATUS_WORDS[orderStatus]?.[lang] : undefined;
  const [edited, setEdited] = useState<string | null>(null);
  const text = edited ?? renderTemplate(id, lang, { name, status, balance: balance ? money(balance, lang) : undefined });

  return (
    <div className="mt-3 border-t border-beto-gray-subtle pt-3">
      <div className="flex flex-wrap gap-2 mb-2">
        <select
          value={id}
          onChange={(e) => {
            setId(e.target.value as TemplateId);
            setEdited(null);
          }}
          className="text-sm border border-beto-gray-subtle px-2 py-2 bg-beto-white"
          aria-label="Message"
        >
          {TEMPLATE_IDS.map((t) => (
            <option key={t} value={t}>
              {templateLabel(t)}
            </option>
          ))}
        </select>
        <div className="flex border border-beto-gray-subtle" role="group" aria-label="Language">
          {(["en", "fr"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={lang === l}
              onClick={() => {
                setLang(l);
                setEdited(null);
              }}
              className={`px-3 text-xs uppercase ${lang === l ? "bg-beto-black text-white" : "text-beto-gray"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <textarea value={text} onChange={(e) => setEdited(e.target.value)} rows={4} className={input} aria-label="Message text" />
      <div className="flex flex-wrap gap-2 mt-2">
        <CopyText text={text} label="Copy message" />
        {messengerUrl && (
          <a href={messengerUrl} target="_blank" rel="noreferrer" className={ghostBtn}>
            Open Messenger
          </a>
        )}
      </div>
    </div>
  );
}

/* ---------- Follow-up card actions ---------- */

export function FollowupActions({
  clientId,
  name,
  serious,
  messengerUrl,
}: {
  clientId: string;
  name: string;
  serious: boolean;
  messengerUrl: string | null;
}) {
  const { busy, error, run } = useAction();
  const [showMessage, setShowMessage] = useState(false);
  const path = `/api/admin/workspace/clients/${clientId}`;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mt-3">
        <button type="button" disabled={busy} className={primaryBtn} onClick={() => run(path, "PATCH", { action: "followed_up" })}>
          Followed up ✓
        </button>
        <button type="button" disabled={busy} className={ghostBtn} onClick={() => setShowMessage((v) => !v)}>
          {showMessage ? "Hide message" : "Message"}
        </button>
        <button
          type="button"
          disabled={busy}
          className={ghostBtn}
          onClick={() => run(path, "PATCH", { action: "seriousness", value: serious ? "browsing" : "serious" })}
        >
          {serious ? "Just browsing" : "Mark serious"}
        </button>
        <button
          type="button"
          disabled={busy}
          className={ghostBtn}
          onClick={() => {
            const reason = window.prompt("Why lost? (optional — e.g. price, bought elsewhere, no answer)");
            if (reason !== null) run(path, "PATCH", { action: "lost", note: reason });
          }}
        >
          Lost
        </button>
      </div>
      {showMessage && <MessagePicker name={name} messengerUrl={messengerUrl} initial={serious ? "serious" : "checkin"} />}
      <ErrorLine error={error} />
    </div>
  );
}

/* ---------- Quick add ---------- */

export function QuickAdd({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(!compact);
  const [form, setForm] = useState({ name: "", phone: "", email: "", messengerUrl: "", interest: "", serious: false });
  const [duplicate, setDuplicate] = useState<{ id: string; full_name: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(force: boolean) {
    setBusy(true);
    setError(null);
    const res = await api<{ client?: { id: string }; duplicate?: { id: string; full_name: string | null } }>(
      "/api/admin/workspace/clients",
      "POST",
      { ...form, force }
    );
    setBusy(false);
    if (res.status === 409 && res.data.duplicate) {
      setDuplicate(res.data.duplicate);
      return;
    }
    if (!res.ok || !res.data.client) {
      setError(res.data.error || "Not saved. Try again.");
      return;
    }
    setForm({ name: "", phone: "", email: "", messengerUrl: "", interest: "", serious: false });
    setDuplicate(null);
    router.push(`/admin/lauren/clients/${res.data.client.id}`);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" className={`${primaryBtn} w-full`} onClick={() => setOpen(true)}>
        + Add a Marketplace client
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
      className="bg-beto-white border border-beto-gray-subtle p-4 space-y-2"
    >
      <h2 className="text-sm font-medium text-beto-black">New Marketplace client</h2>
      <input className={input} required placeholder="Name *" value={form.name} onChange={set("name")} autoComplete="off" />
      <input className={input} placeholder="Messenger link (paste from the chat)" value={form.messengerUrl} onChange={set("messengerUrl")} inputMode="url" />
      <div className="grid grid-cols-2 gap-2">
        <input className={input} placeholder="Phone" value={form.phone} onChange={set("phone")} inputMode="tel" />
        <input className={input} placeholder="Email" value={form.email} onChange={set("email")} inputMode="email" />
      </div>
      <textarea className={input} rows={2} placeholder="What they want (e.g. 2 ct oval, 14k white, size 6, budget ~2500)" value={form.interest} onChange={set("interest")} />
      <label className="flex items-center gap-2 text-sm text-beto-gray py-1">
        <input type="checkbox" checked={form.serious} onChange={(e) => setForm({ ...form, serious: e.target.checked })} />
        Serious buyer (follow up every 3 days instead of 7)
      </label>
      {duplicate && (
        <div className="text-sm bg-beto-gold/10 border border-beto-gold p-3">
          This looks like{" "}
          <Link className="underline" href={`/admin/lauren/clients/${duplicate.id}`}>
            {duplicate.full_name || "an existing client"}
          </Link>
          , already in the list.
          <button type="button" className="underline ml-2" onClick={() => submit(true)} disabled={busy}>
            It&apos;s someone else — add anyway
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={`${primaryBtn} flex-1`}>
          {busy ? "Saving…" : "Save client"}
        </button>
        {compact && (
          <button type="button" className={ghostBtn} onClick={() => setOpen(false)}>
            Cancel
          </button>
        )}
      </div>
      <ErrorLine error={error} />
    </form>
  );
}

/* ---------- Notes ---------- */

export function NoteForm({ clientId }: { clientId: string }) {
  const { busy, error, run } = useAction();
  const [note, setNote] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await run(`/api/admin/workspace/clients/${clientId}`, "PATCH", { action: "note", note });
        if (res.ok) setNote("");
      }}
      className="flex gap-2"
    >
      <input className={input} placeholder="Add a note (dated automatically)" value={note} onChange={(e) => setNote(e.target.value)} />
      <button type="submit" disabled={busy || !note.trim()} className={primaryBtn}>
        Add
      </button>
      <ErrorLine error={error} />
    </form>
  );
}

export function ClientToggles({ clientId, serious, paused, lost }: { clientId: string; serious: boolean; paused: boolean; lost: boolean }) {
  const { busy, error, run } = useAction();
  const path = `/api/admin/workspace/clients/${clientId}`;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} className={primaryBtn} onClick={() => run(path, "PATCH", { action: "followed_up" })}>
          Followed up ✓
        </button>
        <button type="button" disabled={busy} className={ghostBtn} onClick={() => run(path, "PATCH", { action: "seriousness", value: serious ? "browsing" : "serious" })}>
          {serious ? "Serious ★ (tap: browsing)" : "Browsing (tap: serious)"}
        </button>
        <button type="button" disabled={busy} className={ghostBtn} onClick={() => run(path, "PATCH", { action: "pause", value: !paused })}>
          {paused ? "Follow-ups paused (resume)" : "Pause follow-ups"}
        </button>
        {lost ? (
          <button type="button" disabled={busy} className={ghostBtn} onClick={() => run(path, "PATCH", { action: "reopen" })}>
            Reopen client
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            className={ghostBtn}
            onClick={() => {
              const reason = window.prompt("Why lost? (optional)");
              if (reason !== null) run(path, "PATCH", { action: "lost", note: reason });
            }}
          >
            Lost
          </button>
        )}
      </div>
      <ErrorLine error={error} />
    </div>
  );
}

export function ClientDetailsForm({
  clientId,
  initial,
}: {
  clientId: string;
  initial: { name: string; phone: string; email: string; messengerUrl: string };
}) {
  const { busy, error, run } = useAction();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  if (!open)
    return (
      <button type="button" className="text-xs underline text-beto-gray-light" onClick={() => setOpen(true)}>
        Edit contact details
      </button>
    );
  return (
    <form
      className="space-y-2 mt-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await run(`/api/admin/workspace/clients/${clientId}`, "PATCH", { action: "details", ...form });
        if (res.ok) setOpen(false);
      }}
    >
      <input className={input} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
      <input className={input} value={form.messengerUrl} onChange={(e) => setForm({ ...form, messengerUrl: e.target.value })} placeholder="Messenger link" />
      <div className="grid grid-cols-2 gap-2">
        <input className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
        <input className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className={primaryBtn} disabled={busy}>
          Save
        </button>
        <button type="button" className={ghostBtn} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      <ErrorLine error={error} />
    </form>
  );
}

/* ---------- Orders ---------- */

type OrderDraft = {
  description: string;
  stone: string;
  carat: string;
  metal: string;
  ringSize: string;
  totalPrice: string;
  depositAmount: string;
  productionCost: string;
  promisedDate: string;
  quoteNumber: string;
  status: OrderStatus;
};

const str = (v: number | string | null | undefined) => (v === null || v === undefined ? "" : String(v));

export function OrderForm({ clientId, order, onDone }: { clientId: string; order?: Order; onDone?: () => void }) {
  const { busy, error, run } = useAction();
  const [d, setD] = useState<OrderDraft>({
    description: str(order?.description),
    stone: str(order?.stone) || "Lab diamond",
    carat: str(order?.carat),
    metal: str(order?.metal),
    ringSize: str(order?.ring_size),
    totalPrice: str(order?.total_price),
    depositAmount: str(order?.deposit_amount ?? (order ? null : MARKETPLACE_DEPOSIT)),
    productionCost: str(order?.production_cost),
    promisedDate: str(order?.promised_date),
    quoteNumber: str(order?.quote_number),
    status: order?.status ?? "quote",
  });
  const set = (k: keyof OrderDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setD({ ...d, [k]: e.target.value });

  return (
    <form
      className="space-y-2 bg-beto-white border border-beto-gray-subtle p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const res = order
          ? await run(`/api/admin/workspace/orders/${order.id}`, "PATCH", d)
          : await run("/api/admin/workspace/orders", "POST", { ...d, clientId });
        if (res.ok) onDone?.();
      }}
    >
      <h3 className="text-sm font-medium text-beto-black">{order ? "Edit order" : "New order"}</h3>
      <input className={input} required placeholder="What is it? (e.g. Oval solitaire, hidden halo)" value={d.description} onChange={set("description")} />
      <div className="grid grid-cols-3 gap-2">
        <input className={input} placeholder="Stone" value={d.stone} onChange={set("stone")} />
        <input className={input} placeholder="Carat" inputMode="decimal" value={d.carat} onChange={set("carat")} />
        <input className={input} placeholder="Size" value={d.ringSize} onChange={set("ringSize")} />
      </div>
      <input className={input} placeholder="Metal (e.g. 14k white gold)" value={d.metal} onChange={set("metal")} />
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-beto-gray-light">
          Total price ($)
          <input className={input} inputMode="decimal" value={d.totalPrice} onChange={set("totalPrice")} />
        </label>
        <label className="text-xs text-beto-gray-light">
          Deposit asked ($)
          <input className={input} inputMode="decimal" value={d.depositAmount} onChange={set("depositAmount")} />
        </label>
        <label className="text-xs text-beto-gray-light">
          Cost to make ($, internal)
          <input className={input} inputMode="decimal" value={d.productionCost} onChange={set("productionCost")} />
        </label>
        <label className="text-xs text-beto-gray-light">
          Date promised to client
          <input className={input} type="date" value={d.promisedDate} onChange={set("promisedDate")} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-beto-gray-light">
          Status
          <select className={input} value={d.status} onChange={set("status")}>
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-beto-gray-light">
          Quote no. (from Rayane)
          <input className={input} placeholder="BJ-2026-…" value={d.quoteNumber} onChange={set("quoteNumber")} />
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={`${primaryBtn} flex-1`}>
          {busy ? "Saving…" : order ? "Save changes" : "Create order"}
        </button>
        {onDone && (
          <button type="button" className={ghostBtn} onClick={onDone}>
            Cancel
          </button>
        )}
      </div>
      <ErrorLine error={error} />
    </form>
  );
}

export function OrderStatusButtons({ order }: { order: Order }) {
  const { busy, error, run } = useAction();
  const idx = ORDER_STATUSES.findIndex((s) => s.value === order.status);
  const next = ORDER_STATUSES[idx + 1];
  if (!next || order.status === "delivered" || order.status === "cancelled") return null;
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        className={ghostBtn}
        onClick={() => run(`/api/admin/workspace/orders/${order.id}`, "PATCH", { status: next.value })}
      >
        Move to: {next.label} →
      </button>
      <ErrorLine error={error} />
    </div>
  );
}

export function NewOrderButton({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  if (open) return <OrderForm clientId={clientId} onDone={() => setOpen(false)} />;
  return (
    <button type="button" className={`${primaryBtn} w-full`} onClick={() => setOpen(true)}>
      + New order
    </button>
  );
}

export function EditOrderButton({ clientId, order }: { clientId: string; order: Order }) {
  const [open, setOpen] = useState(false);
  if (open) return <OrderForm clientId={clientId} order={order} onDone={() => setOpen(false)} />;
  return (
    <button type="button" className="text-xs underline text-beto-gray-light" onClick={() => setOpen(true)}>
      Edit order
    </button>
  );
}

/* ---------- Payments ---------- */

export function PaymentForm({ orderId, suggested }: { orderId: string; suggested: { kind: "deposit" | "balance"; amount: number | null } }) {
  const { busy, error, run } = useAction();
  const [open, setOpen] = useState(false);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
  const [p, setP] = useState({ amount: str(suggested.amount), method: "", kind: suggested.kind as string, receivedAt: today, note: "" });

  if (!open)
    return (
      <button type="button" className={ghostBtn} onClick={() => setOpen(true)}>
        + Record a payment
      </button>
    );

  return (
    <form
      className="space-y-2 bg-beto-offwhite border border-beto-gray-subtle p-3 mt-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await run("/api/admin/workspace/payments", "POST", { ...p, orderId });
        if (res.ok) setOpen(false);
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-beto-gray-light">
          Amount ($)
          <input className={input} required inputMode="decimal" value={p.amount} onChange={(e) => setP({ ...p, amount: e.target.value })} />
        </label>
        <label className="text-xs text-beto-gray-light">
          Date received
          <input className={input} type="date" value={p.receivedAt} onChange={(e) => setP({ ...p, receivedAt: e.target.value })} />
        </label>
      </div>
      <fieldset>
        <legend className="text-xs text-beto-gray-light mb-1">Paid by *</legend>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-pressed={p.method === m.value}
              onClick={() => setP({ ...p, method: m.value })}
              className={`${ghostBtn} ${p.method === m.value ? "!bg-beto-black !text-white" : ""}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="flex gap-2">
        {(["deposit", "balance", "other"] as const).map((k) => (
          <label key={k} className="flex items-center gap-1 text-sm text-beto-gray capitalize">
            <input type="radio" name={`kind-${orderId}`} checked={p.kind === k} onChange={() => setP({ ...p, kind: k })} /> {k}
          </label>
        ))}
      </div>
      <input className={input} placeholder="Note (optional — e.g. cash at pickup)" value={p.note} onChange={(e) => setP({ ...p, note: e.target.value })} />
      <div className="flex gap-2">
        <button type="submit" disabled={busy || !p.method} className={`${primaryBtn} flex-1`}>
          {busy ? "Saving…" : "Save payment"}
        </button>
        <button type="button" className={ghostBtn} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      <p className="text-xs text-beto-gray-light">Every payment goes on the books, cash too. Receipts are made by Rayane.</p>
      <ErrorLine error={error} />
    </form>
  );
}
