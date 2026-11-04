import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminSession";
import { getSupabaseAdmin } from "@/lib/supabase";
import TeamForm from "./TeamForm";

export const dynamic = "force-dynamic";

type StaffRow = { email: string; display_name: string; role: string; active: boolean; updated_at: string };

export default async function TeamPage() {
  const session = await getAdminSession();
  if (session?.role !== "owner") redirect("/admin/lauren");

  const { data, error } = await getSupabaseAdmin()
    .from("staff_users")
    .select("email, display_name, role, active, updated_at")
    .order("created_at");
  const staff = (data ?? []) as StaffRow[];

  return (
    <section className="min-h-screen bg-beto-offwhite px-5 py-10" style={{ paddingTop: "calc(var(--nav-height, 0px) + 2.5rem)" }}>
      <div className="max-w-xl mx-auto">
        <Link href="/admin/clients" className="text-xs text-beto-gray-light hover:text-beto-gold">← Clients</Link>
        <p className="text-label text-beto-gold mt-6 mb-1">Beto Jewelry</p>
        <h1 className="text-2xl font-medium text-beto-black mb-2">Équipe</h1>
        <p className="text-sm text-beto-gray-light mb-8">
          Donne à Lauren son propre accès. Tu choisis son mot de passe ici : il est chiffré (scrypt) et n&apos;apparaît nulle part ailleurs.
          Elle se connecte sur /admin/login avec son courriel.
        </p>

        {error && <p className="text-sm text-red-700 mb-4">Lecture de l&apos;équipe impossible : {error.message}</p>}

        {staff.length > 0 && (
          <ul className="bg-beto-white border border-beto-gray-subtle/40 mb-8 divide-y divide-beto-gray-subtle/30">
            {staff.map((s) => (
              <li key={s.email} className="px-4 py-3 text-sm flex justify-between gap-4">
                <span>
                  <span className="font-medium text-beto-black">{s.display_name}</span>{" "}
                  <span className="text-beto-gray-light">{s.email}</span>
                </span>
                <span className={s.active ? "text-beto-gold-dark" : "text-red-700"}>{s.active ? "Actif" : "Désactivé"}</span>
              </li>
            ))}
          </ul>
        )}

        <TeamForm />
      </div>
    </section>
  );
}
