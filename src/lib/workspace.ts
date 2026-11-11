import type { Client } from "@/lib/supabase";

/**
 * Lauren's workspace (/admin/lauren): orders, payments and the rules behind
 * her morning list. Decided with Rayane and Lauren on 4 Nov. 2026
 * (docs/business-ops-brief.md §8quater).
 */

export type OrderStatus = "quote" | "design" | "production" | "ready" | "delivered" | "cancelled";
export type PaymentMethod = "interac" | "cash" | "card" | "stripe" | "other";
export type PaymentKind = "deposit" | "balance" | "other";

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "quote", label: "Quote sent" },
  { value: "design", label: "3D design" },
  { value: "production", label: "In production" },
  { value: "ready", label: "Ready for pickup" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "interac", label: "Interac" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "stripe", label: "Stripe link" },
  { value: "other", label: "Other" },
];

export interface Payment {
  id: string;
  order_id: string;
  /** Before taxes, applied to the order. */
  amount: number;
  /** GST (TPS) and QST (TVQ) collected on top of `amount`. */
  tps?: number;
  tvq?: number;
  stripe_session_id?: string | null;
  method: PaymentMethod;
  kind: PaymentKind;
  received_at: string;
  receipt_number: string | null;
  note: string | null;
  recorded_by: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  client_id: string;
  description: string | null;
  stone: string | null;
  carat: number | null;
  metal: string | null;
  ring_size: string | null;
  total_price: number | null;
  deposit_amount: number | null;
  production_cost: number | null;
  status: OrderStatus;
  promised_date: string | null;
  quote_number: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  payments?: Payment[];
}

/** Marketplace deposit (Rayane, 4 Nov. 2026). Other channels stay at 250 $. */
export const MARKETPLACE_DEPOSIT = 150;
export const MARKETPLACE_SOURCE = "Facebook Marketplace (Lauren)";

const DAY = 24 * 60 * 60 * 1000;
/** Lauren's own rhythm: serious buyers every 3 days, people browsing every week. */
export const FOLLOWUP_DAYS = { serious: 3, browsing: 7 } as const;
/** Production alert: 12 days (gold), 21 days (platinum) — brief §8ter #prod. */
const PRODUCTION_ALERT_DAYS = { gold: 12, platinum: 21 };
/** An order nobody touched for this long gets an "update the client" nudge. */
const ORDER_QUIET_DAYS = 4;

const ACTIVE_CLIENT: Client["status"][] = ["nouveau", "consultation_reservee", "consultation_faite"];

export function paidTotal(order: Order) {
  return (order.payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
}

export function balanceDue(order: Order) {
  if (order.total_price === null || order.status === "cancelled") return null;
  return Math.round((Number(order.total_price) - paidTotal(order)) * 100) / 100;
}

export function daysSince(iso: string | null, now: Date) {
  if (!iso) return null;
  return Math.floor((now.getTime() - new Date(iso).getTime()) / DAY);
}

export type FollowupItem = { client: Client; daysQuiet: number; everyDays: number; overdueBy: number };

/** Clients (before the deposit) whose next follow-up is due today or overdue. */
export function followupsDue(clients: Client[], now: Date): FollowupItem[] {
  return clients
    .filter((c) => ACTIVE_CLIENT.includes(c.status) && !c.followups_paused)
    .map((client) => {
      const everyDays = FOLLOWUP_DAYS[client.seriousness ?? "browsing"];
      const daysQuiet = daysSince(client.last_contact_at ?? client.created_at, now) ?? 0;
      return { client, daysQuiet, everyDays, overdueBy: daysQuiet - everyDays };
    })
    .filter((f) => f.overdueBy >= 0)
    .sort((a, b) => {
      // Serious buyers first, then the longest silence.
      const sa = a.client.seriousness === "serious" ? 0 : 1;
      const sb = b.client.seriousness === "serious" ? 0 : 1;
      return sa - sb || b.overdueBy - a.overdueBy;
    });
}

export type OrderAlert = { order: Order; client: Client | undefined; reason: string; urgent: boolean };

/** Orders where a client is waiting on news, a date is close, or money is owed. */
export function orderAlerts(orders: Order[], clients: Client[], now: Date): OrderAlert[] {
  const byId = new Map(clients.map((c) => [c.id, c]));
  const alerts: OrderAlert[] = [];
  for (const order of orders) {
    const client = byId.get(order.client_id);
    const balance = balanceDue(order);
    if (order.status === "cancelled" || (order.status === "delivered" && !(balance && balance > 0))) continue;

    if (order.status === "ready") {
      alerts.push({
        order,
        client,
        reason: balance && balance > 0 ? `Ready — collect balance ${money(balance)} and book the pickup` : "Ready — book the pickup",
        urgent: true,
      });
      continue;
    }
    if (order.status === "delivered" && balance && balance > 0) {
      alerts.push({ order, client, reason: `Delivered but ${money(balance)} still owed`, urgent: true });
      continue;
    }
    if (order.promised_date) {
      const daysLeft = Math.ceil((new Date(order.promised_date).getTime() - now.getTime()) / DAY);
      if (daysLeft <= 3) {
        alerts.push({
          order,
          client,
          reason: daysLeft < 0 ? `Promised date passed ${-daysLeft} day(s) ago` : `Promised in ${daysLeft} day(s)`,
          urgent: true,
        });
        continue;
      }
    }
    if (order.status === "production") {
      const limit = /plat/i.test(order.metal ?? "") ? PRODUCTION_ALERT_DAYS.platinum : PRODUCTION_ALERT_DAYS.gold;
      const days = daysSince(order.updated_at, now) ?? 0;
      if (days >= limit) {
        alerts.push({ order, client, reason: `In production, no update for ${days} days — check with Rayane`, urgent: true });
        continue;
      }
    }
    if (order.status === "quote" && !order.deposit_amount && paidTotal(order) === 0) {
      const days = daysSince(order.created_at, now) ?? 0;
      if (days >= 2) alerts.push({ order, client, reason: `Quote sent ${days} days ago, no deposit yet`, urgent: false });
      continue;
    }
    const quiet = daysSince(order.updated_at, now) ?? 0;
    if (quiet >= ORDER_QUIET_DAYS) {
      alerts.push({ order, client, reason: `No update for ${quiet} days — send the client a quick update`, urgent: false });
    }
  }
  return alerts.sort((a, b) => Number(b.urgent) - Number(a.urgent));
}

/** "$2,400" in English, "2 400 $" in French; cents only when there are some. */
export function money(n: number | null | undefined, lang: "en" | "fr" = "en") {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat(lang === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function firstName(client: Pick<Client, "full_name"> | undefined) {
  return client?.full_name?.trim().split(/\s+/)[0] || "there";
}

/** "[2026-11-04 Lauren] text" appended under the existing notes. */
export function appendNote(existing: string | null, author: string, text: string, now = new Date()) {
  const date = now.toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
  const line = `[${date} ${author}] ${text.trim()}`;
  return existing?.trim() ? `${existing.trim()}\n${line}` : line;
}
