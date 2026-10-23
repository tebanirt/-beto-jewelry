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
  | "consultation"
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
}): Promise<Client | null> {
  const email = input.email?.trim().toLowerCase() || undefined;
  const phone = input.phone?.trim() || undefined;
  if (!email && !phone) return null;

  const supabase = getSupabaseAdmin();

  const orFilters = [
    email ? `email.eq.${email}` : null,
    phone ? `phone.eq.${phone}` : null,
  ].filter(Boolean);

  const { data: existing, error: selectError } = await supabase
    .from("clients")
    .select("*")
    .or(orFilters.join(","))
    .limit(1)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("clients")
      .update({
        full_name: input.fullName?.trim() || existing.full_name,
        email: email || existing.email,
        phone: phone || existing.phone,
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
