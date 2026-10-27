import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin, type Client, type Submission } from "@/lib/supabase";
import { StatusSelect, FollowupControls } from "../ClientRowControls";
import FollowupBadge from "../FollowupBadge";
import { followupState } from "@/lib/followups";
import NotesEditor from "./NotesEditor";

export const dynamic = "force-dynamic";

async function getClientWithSubmissions(id: string) {
  const supabase = getSupabaseAdmin();
  const { data: client } = await supabase.from("clients").select("*").eq("id", id).single();
  if (!client) return null;
  const { data: submissions } = await supabase
    .from("submissions")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });
  return { client: client as Client, submissions: (submissions ?? []) as Submission[] };
}

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getClientWithSubmissions(id);
  if (!result) notFound();
  const { client, submissions } = result;

  return (
    <section className="min-h-screen bg-beto-offwhite px-5 py-10" style={{ paddingTop: "calc(var(--nav-height, 0px) + 2.5rem)" }}>
      <div className="max-w-3xl mx-auto">
        <Link href="/admin/clients" className="text-xs text-beto-gray-light hover:text-beto-black transition-colors">
          ← Retour à la liste
        </Link>

        <div className="bg-beto-white border border-beto-gray-subtle/40 p-8 mt-4 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-medium text-beto-black mb-1">{client.full_name || "Sans nom"}</h1>
              <p className="text-sm text-beto-gray-light">{client.email}</p>
              <p className="text-sm text-beto-gray-light">{client.phone}</p>
            </div>
            <StatusSelect clientId={client.id} status={client.status} />
          </div>
          <p className="text-xs text-beto-gray-light mb-4">
            Source : {client.source || "—"} · Créé le {new Date(client.created_at).toLocaleDateString("fr-CA")}
            {client.last_contact_at && (
              <> · Dernier contact de ta part : {new Date(client.last_contact_at).toLocaleDateString("fr-CA")}</>
            )}
          </p>
          <div className="mb-4">
            <FollowupBadge state={followupState(client)} />
          </div>
          <NotesEditor clientId={client.id} initialNotes={client.notes || ""} />
          <FollowupControls
            clientId={client.id}
            consultationAt={client.consultation_at}
            followupsPaused={client.followups_paused}
            followupCount={client.followup_count}
          />
        </div>

        <h2 className="text-label text-beto-gold mb-4">Historique ({submissions.length})</h2>
        <div className="flex flex-col gap-4">
          {submissions.length === 0 && <p className="text-sm text-beto-gray-light">Aucune soumission enregistrée.</p>}
          {submissions.map((s) => (
            <div key={s.id} className="bg-beto-white border border-beto-gray-subtle/40 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wide text-beto-gold">{s.form_type}</span>
                <span className="text-xs text-beto-gray-light">{new Date(s.created_at).toLocaleString("fr-CA")}</span>
              </div>
              <dl className="grid grid-cols-1 gap-1.5 text-sm">
                {Object.entries(s.fields)
                  .filter(([key]) => key !== "email")
                  .map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <dt className="text-beto-gray-light min-w-32 flex-shrink-0">{key}</dt>
                      <dd className="text-beto-black">{String(value)}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
