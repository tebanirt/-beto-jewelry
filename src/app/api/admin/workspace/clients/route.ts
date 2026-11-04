import { NextResponse } from "next/server";
import { getAdminSession, logActivity } from "@/lib/adminSession";
import { getSupabaseAdmin, type Client } from "@/lib/supabase";
import { MARKETPLACE_SOURCE, appendNote } from "@/lib/workspace";

/**
 * Quick-add a Marketplace lead (Lauren, from her phone). Before creating, it
 * looks for the same person by Messenger link, phone, email, then exact name,
 * so the CRM never gets the same client twice.
 */
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    email?: string;
    messengerUrl?: string;
    interest?: string;
    serious?: boolean;
    force?: boolean;
  };
  const name = body.name?.trim();
  const phone = body.phone?.trim() || null;
  const email = body.email?.trim().toLowerCase() || null;
  const messengerUrl = body.messengerUrl?.trim() || null;
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  if (!body.force) {
    const checks: [string, string | null][] = [
      ["messenger_url", messengerUrl],
      ["phone", phone],
      ["email", email],
    ];
    for (const [column, value] of checks) {
      if (!value) continue;
      const { data, error } = await supabase.from("clients").select("id, full_name").eq(column, value).limit(1).maybeSingle();
      if (error) {
        console.error("quick-add duplicate check error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
      }
      if (data) return NextResponse.json({ duplicate: data }, { status: 409 });
    }
    const { data, error } = await supabase.from("clients").select("id, full_name").ilike("full_name", name).limit(1).maybeSingle();
    if (error) {
      console.error("quick-add name check error:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    if (data) return NextResponse.json({ duplicate: data }, { status: 409 });
  }

  const now = new Date();
  const { data: created, error } = await supabase
    .from("clients")
    .insert({
      full_name: name,
      phone,
      email,
      messenger_url: messengerUrl,
      source: MARKETPLACE_SOURCE,
      owner: "lauren",
      seriousness: body.serious ? "serious" : "browsing",
      status: "nouveau",
      // Added after a conversation: that conversation is the first contact.
      last_contact_at: now.toISOString(),
      notes: body.interest?.trim() ? appendNote(null, session.name, body.interest, now) : null,
    })
    .select("*")
    .single<Client>();
  if (error) {
    console.error("quick-add insert error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  await logActivity(session, "client_added", { type: "client", id: created.id }, name);
  return NextResponse.json({ client: created });
}
