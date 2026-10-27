import { NextResponse } from "next/server";
import { getSupabaseAdmin, type ClientStatus } from "@/lib/supabase";

const STATUSES: ClientStatus[] = [
  "nouveau",
  "consultation_reservee",
  "consultation_faite",
  "depot_recu",
  "design",
  "production",
  "livre",
  "perdu",
];

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/clients/[id]">) {
  const { id } = await ctx.params;
  const body = (await request.json()) as {
    status?: string;
    notes?: string;
    consultationAt?: string | null;
    followupsPaused?: boolean;
    logFollowup?: boolean;
  };

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const update: Record<string, string | number | boolean | null> = { updated_at: now };

  if (typeof body.status === "string") {
    if (!STATUSES.includes(body.status as ClientStatus)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }
    update.status = body.status;
    // Nouvelle étape = nouveau rythme de relance.
    update.followup_count = 0;
  }
  if (typeof body.notes === "string") update.notes = body.notes;
  if (body.consultationAt === null) update.consultation_at = null;
  if (typeof body.consultationAt === "string") {
    const d = new Date(body.consultationAt);
    if (Number.isNaN(d.getTime())) return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    update.consultation_at = d.toISOString();
  }
  if (typeof body.followupsPaused === "boolean") update.followups_paused = body.followupsPaused;

  if (body.logFollowup) {
    // Relance faite à la main (SMS, Instagram, appel) : compte comme une relance.
    const { data, error } = await supabase.from("clients").select("followup_count").eq("id", id).single();
    if (error) {
      console.error("Admin client read error:", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
    update.followup_count = (data?.followup_count ?? 0) + 1;
    update.last_contact_at = now;
  }

  const { error } = await supabase.from("clients").update(update).eq("id", id);

  if (error) {
    console.error("Admin client update error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
