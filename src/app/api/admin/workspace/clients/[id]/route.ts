import { NextResponse } from "next/server";
import { getAdminSession, logActivity } from "@/lib/adminSession";
import { getSupabaseAdmin, type ClientStatus } from "@/lib/supabase";
import { appendNote } from "@/lib/workspace";

type Action =
  | { action: "followed_up"; note?: string }
  | { action: "seriousness"; value: "serious" | "browsing" }
  | { action: "lost"; note?: string }
  | { action: "reopen" }
  | { action: "note"; note: string }
  | { action: "pause"; value: boolean }
  | { action: "details"; name?: string; phone?: string; email?: string; messengerUrl?: string };

/** One-tap updates from Lauren's screens. Every change is written to activity_log. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/workspace/clients/[id]">) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await ctx.params;
  const body = (await request.json()) as Action;

  const supabase = getSupabaseAdmin();
  const { data: client, error: readError } = await supabase
    .from("clients")
    .select("id, notes, followup_count, status")
    .eq("id", id)
    .maybeSingle<{ id: string; notes: string | null; followup_count: number; status: ClientStatus }>();
  if (readError) {
    console.error("workspace client read error:", readError);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const now = new Date();
  const update: Record<string, string | number | boolean | null> = { updated_at: now.toISOString() };
  let detail: string | undefined;

  switch (body.action) {
    case "followed_up":
      update.last_contact_at = now.toISOString();
      update.followup_count = (client.followup_count ?? 0) + 1;
      update.notes = appendNote(client.notes, session.name, body.note?.trim() ? `Followed up: ${body.note}` : "Followed up", now);
      break;
    case "seriousness":
      if (body.value !== "serious" && body.value !== "browsing") return bad("Invalid value");
      update.seriousness = body.value;
      detail = body.value;
      break;
    case "lost":
      update.status = "perdu";
      update.followup_count = 0;
      update.notes = appendNote(client.notes, session.name, body.note?.trim() ? `Lost: ${body.note}` : "Marked lost", now);
      break;
    case "reopen":
      if (client.status !== "perdu") return bad("Client is not lost");
      update.status = "nouveau";
      update.followup_count = 0;
      update.last_contact_at = now.toISOString();
      update.notes = appendNote(client.notes, session.name, "Reopened", now);
      break;
    case "note":
      if (!body.note?.trim()) return bad("Empty note");
      update.notes = appendNote(client.notes, session.name, body.note, now);
      break;
    case "pause":
      update.followups_paused = Boolean(body.value);
      break;
    case "details": {
      if (body.name !== undefined) {
        if (!body.name.trim()) return bad("Name is required");
        update.full_name = body.name.trim();
      }
      if (body.phone !== undefined) update.phone = body.phone.trim() || null;
      if (body.email !== undefined) update.email = body.email.trim().toLowerCase() || null;
      if (body.messengerUrl !== undefined) update.messenger_url = body.messengerUrl.trim() || null;
      break;
    }
    default:
      return bad("Unknown action");
  }

  const { error } = await supabase.from("clients").update(update).eq("id", id);
  if (error) {
    console.error("workspace client update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  await logActivity(session, `client_${body.action}`, { type: "client", id }, detail);
  return NextResponse.json({ success: true });
}

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
