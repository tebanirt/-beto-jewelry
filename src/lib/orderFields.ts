import { ORDER_STATUSES, type OrderStatus } from "@/lib/workspace";

type Fields = Record<string, string | number | null>;

const TEXT = [
  ["description", "description"],
  ["stone", "stone"],
  ["metal", "metal"],
  ["ringSize", "ring_size"],
  ["quoteNumber", "quote_number"],
  ["notes", "notes"],
] as const;
const AMOUNTS = [
  ["totalPrice", "total_price"],
  ["depositAmount", "deposit_amount"],
  ["productionCost", "production_cost"],
] as const;

/** Validates order fields sent by the workspace forms. Only keys present in the body are returned. */
export function parseOrderFields(body: Record<string, unknown>): { fields: Fields } | { error: string } {
  const fields: Fields = {};
  for (const [key, column] of TEXT) {
    const v = body[key];
    if (v === undefined) continue;
    if (v !== null && typeof v !== "string") return { error: `Invalid ${key}` };
    fields[column] = v?.trim() || null;
  }
  for (const [key, column] of AMOUNTS) {
    const v = body[key];
    if (v === undefined) continue;
    if (v === null || v === "") {
      fields[column] = null;
      continue;
    }
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > 1_000_000) return { error: `Invalid amount (${key})` };
    fields[column] = Math.round(n * 100) / 100;
  }
  if (body.carat !== undefined) {
    if (body.carat === null || body.carat === "") fields.carat = null;
    else {
      const n = Number(body.carat);
      if (!Number.isFinite(n) || n <= 0 || n > 50) return { error: "Invalid carat" };
      fields.carat = n;
    }
  }
  if (body.status !== undefined) {
    if (!ORDER_STATUSES.some((s) => s.value === body.status)) return { error: "Invalid status" };
    fields.status = body.status as OrderStatus;
  }
  if (body.promisedDate !== undefined) {
    if (body.promisedDate === null || body.promisedDate === "") fields.promised_date = null;
    else if (typeof body.promisedDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.promisedDate)) {
      return { error: "Invalid date" };
    } else fields.promised_date = body.promisedDate;
  }
  return { fields };
}
