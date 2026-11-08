import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service_role key. This bypasses
 * Row Level Security, so this module must never be imported from client
 * components — only from API routes / server components.
 */
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export type ClientStatus =
  | "nouveau"
  | "consultation_reservee"
  | "consultation_faite"
  | "depot_recu"
  | "design"
  | "production"
  | "livre"
  | "perdu";

export interface Client {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  notes: string | null;
  status: ClientStatus;
  consultation_at: string | null;
  last_contact_at: string | null;
  followup_count: number;
  followups_paused: boolean;
  /** Noms Meta (campagne / ensemble / pub) du lead, tels que reçus de Zapier. */
  attribution: string | null;
  /** Interne seulement — jamais visible des clients. */
  sale_price: number | null;
  production_cost: number | null;
  /** Qui suit ce client : Rayane (courriel, site, pubs) ou Lauren (Marketplace). */
  owner: "rayane" | "lauren" | null;
  /** Lauren : client sérieux (relance 3 jours) ou qui magasine (7 jours). */
  seriousness: "serious" | "browsing" | null;
  messenger_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  client_id: string | null;
  form_type: string;
  fields: Record<string, string>;
  created_at: string;
}

/**
 * Finds an existing client by email or phone, or creates a new one.
 * Updates any newly-provided fields (name/email/phone) on an existing match.
 */
export async function upsertClient(input: {
  fullName?: string;
  email?: string;
  phone?: string;
  source: string;
  /** Where the lead came from (ad, site). Set once: never overwrites an existing value. */
  attribution?: string;
}): Promise<Client | null> {
  const email = input.email?.trim().toLowerCase() || undefined;
  const phone = input.phone?.trim() || undefined;
  if (!email && !phone) return null;

  const supabase = getSupabaseAdmin();

  // Looked up with separate .eq() filters (rather than building a single
  // .or(`email.eq.${email},...`) string) so a user-supplied email/phone
  // containing "," or "." can't be parsed as extra PostgREST filter clauses.
  let existing: Client | null = null;
  if (email) {
    const { data, error } = await supabase.from("clients").select("*").eq("email", email).limit(1).maybeSingle();
    if (error) throw error;
    existing = data;
  }
  if (!existing && phone) {
    const { data, error } = await supabase.from("clients").select("*").eq("phone", phone).limit(1).maybeSingle();
    if (error) throw error;
    existing = data;
  }

  if (existing) {
    // A public form only fills what is missing: a typo, or someone typing
    // another client's email or phone, must never replace the name, email or
    // phone already on file (drafts would go to the wrong person). A
    // different value is kept in the notes so Rayane can decide.
    const fullName = input.fullName?.trim() || undefined;
    const differs = (incoming: string | undefined, current: string | null, normalize: (v: string) => string) =>
      incoming !== undefined && current !== null && current !== "" && normalize(incoming) !== normalize(current);
    const lower = (v: string) => v.trim().toLowerCase().replace(/\s+/g, " ");
    const digits = (v: string) => v.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
    const conflicts = [
      differs(fullName, existing.full_name, lower) ? `nom « ${fullName} »` : null,
      differs(email, existing.email, lower) ? `courriel « ${email} »` : null,
      differs(phone, existing.phone, digits) ? `téléphone « ${phone} »` : null,
    ].filter(Boolean);
    const note = conflicts.length
      ? `[${new Date().toLocaleDateString("fr-CA", { timeZone: "America/Toronto" })}] Formulaire (${input.source}) reçu avec un autre ${conflicts.join(", ")} : fiche non modifiée, à vérifier.`
      : null;

    const { data: updated, error: updateError } = await supabase
      .from("clients")
      .update({
        full_name: existing.full_name || fullName || null,
        email: existing.email || email || null,
        phone: existing.phone || phone || null,
        ...(note ? { notes: existing.notes ? `${existing.notes}\n${note}` : note } : {}),
        ...(input.attribution && !(existing as { attribution?: string | null }).attribution
          ? { attribution: input.attribution }
          : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (updateError) throw updateError;
    return updated ?? existing;
  }

  const { data: created, error: insertError } = await supabase
    .from("clients")
    .insert({
      full_name: input.fullName?.trim() || null,
      email: email || null,
      phone: phone || null,
      source: input.source,
      ...(input.attribution ? { attribution: input.attribution } : {}),
    })
    .select("*")
    .single();

  if (insertError) throw insertError;

  return created ?? null;
}

export async function recordSubmission(input: {
  clientId: string | null;
  formType: string;
  fields: Record<string, string>;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("submissions").insert({
    client_id: input.clientId,
    form_type: input.formType,
    fields: input.fields,
  });
  if (error) throw error;
}
