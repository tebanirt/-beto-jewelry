import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSupabaseAdmin, upsertClient } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import { syncClientFromOrders } from "@/lib/workspaceSync";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    // Le corps brut est requis pour vérifier la signature.
    event = await stripe.webhooks.constructEventAsync(await request.text(), signature, secret);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  if (event.type === "checkout.session.async_payment_failed") {
    console.error("Stripe async payment failed:", event.data.object.id);
    return NextResponse.json({ received: true });
  }

  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  // Paiement différé pas encore encaissé : on attendra async_payment_succeeded.
  if (session.payment_status === "unpaid") return NextResponse.json({ received: true });

  try {
    await recordPayment(stripe, session);
  } catch (err) {
    // 500 → Stripe réessaie plus tard ; un échec d'écriture n'est jamais silencieux.
    console.error("Stripe webhook CRM update error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

type Breakdown = { base: number; tps: number; tvq: number; detailed: boolean };

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Montant avant taxes, TPS et TVQ d'un paiement. Les liens créés par le CRM
 * portent ces montants dans leurs métadonnées ; un lien créé dans le tableau
 * de bord Stripe est relu ligne par ligne (« TPS… », « TVQ… »). Sans ligne de
 * taxes, tout le montant est noté avant taxes et la note demande de vérifier.
 */
async function breakdown(stripe: Stripe, session: Stripe.Checkout.Session, metadata: Stripe.Metadata): Promise<Breakdown> {
  const total = (session.amount_total ?? 0) / 100;
  const base = Number(metadata.base);
  const tps = Number(metadata.tps ?? 0);
  const tvq = Number(metadata.tvq ?? 0);
  if (metadata.base && Number.isFinite(base) && Number.isFinite(tps) && Number.isFinite(tvq) && Math.abs(base + tps + tvq - total) < 0.015) {
    return { base, tps, tvq, detailed: true };
  }
  const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 20 });
  let lineBase = 0;
  let lineTps = 0;
  let lineTvq = 0;
  for (const item of items.data) {
    const label = (item.description ?? "").trim().toUpperCase();
    const amount = item.amount_total / 100;
    if (label.startsWith("TPS")) lineTps += amount;
    else if (label.startsWith("TVQ")) lineTvq += amount;
    else lineBase += amount;
  }
  if (lineTps > 0 || lineTvq > 0) return { base: round2(lineBase), tps: round2(lineTps), tvq: round2(lineTvq), detailed: true };
  return { base: total, tps: 0, tvq: 0, detailed: false };
}

/**
 * Commande à laquelle rattacher le paiement : celle du numéro de facture du
 * lien, sinon la plus récente encore ouverte, sinon une nouvelle commande
 * (dépôt d'un client du site qui n'a pas encore de commande).
 */
async function orderFor(clientId: string, kind: string, reference: string, base: number, sessionId: string) {
  const supabase = getSupabaseAdmin();
  const closed = kind === "solde" ? ["cancelled"] : ["cancelled", "delivered"];

  if (reference) {
    const { data, error } = await supabase
      .from("orders")
      .select("id, status, deposit_amount")
      .eq("client_id", clientId)
      .eq("quote_number", reference)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data) return data;
  }

  const { data: open, error } = await supabase
    .from("orders")
    .select("id, status, deposit_amount")
    .eq("client_id", clientId)
    .not("status", "in", `(${closed.join(",")})`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (open) return open;

  // Une nouvelle tentative de Stripe ne doit pas créer une deuxième commande.
  const { data: earlier, error: earlierError } = await supabase
    .from("orders")
    .select("id, status, deposit_amount")
    .eq("client_id", clientId)
    .ilike("notes", `%${sessionId}%`)
    .limit(1)
    .maybeSingle();
  if (earlierError) throw earlierError;
  if (earlier) return earlier;

  // Un prix ou un coût saisi à la main sur la fiche (avant les commandes) passe
  // dans la nouvelle commande : les totaux de la fiche sont recalculés à partir
  // des commandes et ne doivent pas être effacés.
  const { data: card, error: cardError } = await supabase
    .from("clients")
    .select("sale_price, production_cost")
    .eq("id", clientId)
    .single();
  if (cardError) throw cardError;
  const { count, error: countError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .neq("status", "cancelled");
  if (countError) throw countError;
  const carried = count ? {} : { total_price: card.sale_price, production_cost: card.production_cost };

  const { data: created, error: createError } = await supabase
    .from("orders")
    .insert({
      ...carried,
      client_id: clientId,
      description: kind === "solde" ? "Paiement Stripe à rattacher" : "Création sur mesure (dépôt de design)",
      status: "design",
      deposit_amount: kind === "solde" ? null : base,
      created_by: "Stripe",
      notes: `[${new Date().toLocaleDateString("fr-CA", { timeZone: "America/Toronto" })}] Créée par le paiement Stripe ${sessionId}. Prix, détails et coût à compléter.`,
    })
    .select("id, status, deposit_amount")
    .single();
  if (createError) throw createError;
  return created;
}

async function recordPayment(stripe: Stripe, session: Stripe.Checkout.Session) {
  let metadata: Stripe.Metadata = session.metadata ?? {};
  if (!metadata.kind && session.payment_link) {
    const linkId = typeof session.payment_link === "string" ? session.payment_link : session.payment_link.id;
    metadata = (await stripe.paymentLinks.retrieve(linkId)).metadata;
  }

  // Dépôt payé depuis le site sans fiche connue (bouton de la page
  // consultation) : la fiche est retrouvée, ou créée, avec le courriel et le
  // téléphone saisis dans Stripe. Une fiche existante n'est jamais écrasée.
  let clientId = session.client_reference_id || metadata.client_id || "";
  if (!clientId) {
    const details = session.customer_details;
    const found = await upsertClient({
      fullName: details?.name ?? undefined,
      email: details?.email ?? session.customer_email ?? undefined,
      phone: details?.phone ?? undefined,
      source: "site-depot-stripe",
    });
    clientId = found?.id ?? "";
  }
  if (!clientId) {
    console.error("Stripe payment without client reference:", session.id);
    return;
  }

  const supabase = getSupabaseAdmin();
  const { data: client, error } = await supabase.from("clients").select("status, notes").eq("id", clientId).single();
  if (error) throw error;

  const kind = metadata.kind === "solde" ? "solde" : "depot";
  const reference = metadata.reference ?? "";
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });

  // 1. Le paiement dans les Finances (table payments), une seule fois par session Stripe.
  const { data: existing, error: existingError } = await supabase
    .from("payments")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  if (existingError) throw existingError;

  const taxes = await breakdown(stripe, session, metadata);
  if (!existing) {
    const order = await orderFor(clientId, kind, reference, taxes.base, session.id);
    if (kind === "depot" && order.status === "quote") {
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "design", ...(order.deposit_amount === null ? { deposit_amount: taxes.base } : {}), updated_at: new Date().toISOString() })
        .eq("id", order.id);
      if (orderError) throw orderError;
    }
    const { error: payError } = await supabase.from("payments").insert({
      order_id: order.id,
      amount: taxes.base,
      tps: taxes.tps,
      tvq: taxes.tvq,
      method: "stripe",
      kind: kind === "solde" ? "balance" : "deposit",
      received_at: today,
      note: taxes.detailed ? `Stripe ${session.id}` : `Stripe ${session.id} : taxes non détaillées dans le lien, à vérifier`,
      recorded_by: "Stripe",
      stripe_session_id: session.id,
    });
    // 23505 : déjà enregistré par un envoi simultané du même événement.
    if (payError && payError.code !== "23505") throw payError;
  }

  // 2. La note dans la fiche du client, une seule fois aussi.
  const money = (n: number) => n.toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
  const label =
    metadata.stage === "approbation"
      ? "paiement de 50 % à l’approbation"
      : metadata.stage === "plan"
        ? "paiement complet (plan de paiement)"
        : kind === "solde"
          ? "solde"
          : "dépôt";
  const detail = taxes.detailed ? `${money(taxes.base)} + TPS ${money(taxes.tps)} + TVQ ${money(taxes.tvq)}` : "taxes à vérifier";
  const total = money((session.amount_total ?? 0) / 100);
  if (!client.notes?.includes(session.id)) {
    const line = `[${new Date().toLocaleDateString("fr-CA", { timeZone: "America/Toronto" })}] Paiement Stripe reçu : ${total} (${label}${reference ? ` — ${reference}` : ""} ; ${detail}) · ${session.id}`;
    const { error: noteError } = await supabase
      .from("clients")
      .update({ notes: client.notes ? `${client.notes}\n${line}` : line, updated_at: new Date().toISOString() })
      .eq("id", clientId);
    if (noteError) throw noteError;
  }

  // 3. Statut et totaux du client : un dépôt fait avancer la fiche, jamais reculer.
  // Un client « perdu » qui paie un dépôt est revenu : c'est un fait, la fiche repart.
  if (kind === "depot" && client.status === "perdu") {
    const { error: backError } = await supabase
      .from("clients")
      .update({ status: "depot_recu", followup_count: 0, updated_at: new Date().toISOString() })
      .eq("id", clientId);
    if (backError) throw backError;
  }
  const warning = await syncClientFromOrders(clientId, { depositReceived: kind === "depot" });
  if (warning) throw new Error(warning);
}
