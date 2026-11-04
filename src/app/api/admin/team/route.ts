import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/adminAuth";
import { getAdminSession, logActivity } from "@/lib/adminSession";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Owner only: create or update a staff login (Lauren). The password is typed
 * by Rayane on /admin/team and stored as a scrypt hash — it never appears in
 * a chat, a log or the repository.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (session?.role !== "owner") return NextResponse.json({ error: "Réservé à Rayane" }, { status: 403 });

  const body = (await request.json()) as { email?: string; name?: string; password?: string; active?: boolean };
  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Courriel invalide" }, { status: 400 });
  }
  if (body.password !== undefined && body.password !== "" && body.password.length < 10) {
    return NextResponse.json({ error: "Mot de passe : 10 caractères minimum" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: existing, error: readError } = await supabase
    .from("staff_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (readError) {
    console.error("staff_users read error:", readError);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  const update: Record<string, string | boolean> = { updated_at: new Date().toISOString() };
  if (name) update.display_name = name;
  if (typeof body.active === "boolean") update.active = body.active;
  if (body.password) update.password_hash = hashPassword(body.password);

  if (existing) {
    const { error } = await supabase.from("staff_users").update(update).eq("id", existing.id);
    if (error) {
      console.error("staff_users update error:", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
  } else {
    if (!name || !body.password) {
      return NextResponse.json({ error: "Nom et mot de passe requis pour un nouvel accès" }, { status: 400 });
    }
    const { error } = await supabase
      .from("staff_users")
      .insert({ email, display_name: name, role: "assistant", password_hash: update.password_hash, active: true });
    if (error) {
      console.error("staff_users insert error:", error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
  }

  await logActivity(session, existing ? "staff_updated" : "staff_created", { type: "staff", id: email });
  return NextResponse.json({ success: true });
}
