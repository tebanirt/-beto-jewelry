import { NextResponse } from "next/server";
import { getAdminSession, logActivity } from "@/lib/adminSession";
import { getSupabaseAdmin } from "@/lib/supabase";
import { PAYMENT_METHODS, type PaymentKind } from "@/lib/workspace";
import { syncClientFromOrders } from "@/lib/workspaceSync";

const KINDS: PaymentKind[] = ["deposit", "balance", "other"];

/**
 * Records money received — cash included. Every payment is on the books
 * (brief §8quater: no revenue kept out of the accounting). Recording a payment
 * never sends a receipt: receipts stay with Rayane (brief §5).
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = (await request.json()) as {
    orderId?: string;
    amount?: number | string;
    method?: string;
    kind?: string;
    receivedAt?: string;
    note?: string;
  };
  const amount = Math.round(Number(body.amount) * 100) / 100;
  if (!body.orderId) return NextResponse.json({ error: "Order is required" }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (!PAYMENT_METHODS.some((m) => m.value === body.method)) return NextResponse.json({ error: "Choose how it was paid" }, { status: 400 });
  if (!KINDS.includes(body.kind as PaymentKind)) return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
  const receivedAt = body.receivedAt && /^\d{4}-\d{2}-\d{2}$/.test(body.receivedAt)
    ? body.receivedAt
    : new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });

  const supabase = getSupabaseAdmin();
  const { data: order, error: orderError } = await supabase.from("orders").select("client_id").eq("id", body.orderId).maybeSingle();
  if (orderError) {
    console.error("payment order read error:", orderError);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("payments")
    .insert({
      order_id: body.orderId,
      amount,
      method: body.method,
      kind: body.kind,
      received_at: receivedAt,
      note: body.note?.trim() || null,
      recorded_by: session.name,
    })
    .select("id")
    .single();
  if (error) {
    console.error("payment insert error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  const warning = await syncClientFromOrders(order.client_id, { depositReceived: body.kind === "deposit" });
  await logActivity(session, "payment_recorded", { type: "payment", id: data.id }, `${amount} ${body.method} ${body.kind}`);
  return NextResponse.json({ id: data.id, warning });
}
