import { NextResponse } from "next/server";
import { getAdminSession, logActivity } from "@/lib/adminSession";
import { getSupabaseAdmin } from "@/lib/supabase";
import { parseOrderFields } from "@/lib/orderFields";
import { syncClientFromOrders } from "@/lib/workspaceSync";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = (await request.json()) as Record<string, unknown>;
  const clientId = typeof body.clientId === "string" ? body.clientId : "";
  if (!clientId) return NextResponse.json({ error: "Client is required" }, { status: 400 });
  const parsed = parseOrderFields(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .insert({ ...parsed.fields, client_id: clientId, created_by: session.name })
    .select("id")
    .single();
  if (error) {
    console.error("order insert error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const warning = await syncClientFromOrders(clientId);
  await logActivity(session, "order_created", { type: "order", id: data.id }, String(parsed.fields.description ?? ""));
  return NextResponse.json({ id: data.id, warning });
}
