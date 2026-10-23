import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/clients/[id]">) {
  const { id } = await ctx.params;
  const body = (await request.json()) as { status?: string; notes?: string };

  const update: Record<string, string> = { updated_at: new Date().toISOString() };
  if (typeof body.status === "string") update.status = body.status;
  if (typeof body.notes === "string") update.notes = body.notes;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("clients").update(update).eq("id", id);

  if (error) {
    console.error("Admin client update error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
