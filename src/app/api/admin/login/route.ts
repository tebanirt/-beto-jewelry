import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, checkPassword, createSessionToken, type AdminSession } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const { password, email } = (await request.json()) as { password?: string; email?: string };

  if (!process.env.ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD is not configured");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!password) return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });

  let session: AdminSession | null = null;
  const login = email?.trim().toLowerCase();

  if (!login) {
    // Rayane : mot de passe unique de l'admin (comportement d'origine).
    if (password === process.env.ADMIN_PASSWORD) session = { role: "owner", userId: "owner", name: "Rayane" };
  } else {
    const { data, error } = await getSupabaseAdmin()
      .from("staff_users")
      .select("id, display_name, role, password_hash, active")
      .eq("email", login)
      .maybeSingle();
    if (error) {
      console.error("staff_users read error:", error);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
    if (data?.active && checkPassword(password, data.password_hash)) {
      session = { role: data.role, userId: data.id, name: data.display_name };
    }
  }

  if (!session) return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });

  const response = NextResponse.json({ success: true, role: session.role });
  response.cookies.set(ADMIN_SESSION_COOKIE, createSessionToken(session), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
