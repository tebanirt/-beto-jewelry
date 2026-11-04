import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, readSessionToken, type AdminSession } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Current admin session from the cookie (the proxy already blocks anonymous
 * visitors). A staff login switched off on /admin/team stops working at once,
 * not 7 days later when its cookie expires.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const session = readSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session || session.role === "owner") return session;
  const { data, error } = await getSupabaseAdmin().from("staff_users").select("active").eq("id", session.userId).maybeSingle();
  if (error) {
    console.error("staff_users session check error:", error);
    return null;
  }
  return data?.active ? session : null;
}
/** Journal « qui a fait quoi ». A failed write is logged, never silent, but never blocks the action. */
export async function logActivity(
  session: AdminSession | null,
  action: string,
  target?: { type: string; id: string },
  detail?: string
) {
  const { error } = await getSupabaseAdmin()
    .from("activity_log")
    .insert({ actor: session?.name || "inconnu", action, target_type: target?.type, target_id: target?.id, detail });
  if (error) console.error("activity_log insert error:", error);
}
