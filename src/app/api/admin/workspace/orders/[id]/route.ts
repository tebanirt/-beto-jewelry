import { NextResponse } from "next/server";
import { getAdminSession, logActivity } from "@/lib/adminSession";
import { getSupabaseAdmin } from "@/lib/supabase";
import { parseOrderFields } from "@/lib/orderFields";
import { syncClientFromOrders } from "@/lib/workspaceSync";

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/workspace/orders/[id]">) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await ctx.params;

  const parsed = parseOrderFields((await request.json()) as Record<string, unknown>);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .update({ ...parsed.fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("client_id")
    .maybeSingle();
  if (error) {
    console.error("order update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const warning = await syncClientFromOrders(data.client_id);
  await logActivity(session, "order_updated", { type: "order", id }, Object.keys(parsed.fields).join(", "));
  return NextResponse.json({ success: true, warning });
}
