import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSupabaseAdmin, type ClientStatus } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

// Un dépôt reçu ne doit jamais faire reculer un client déjà plus loin dans le pipeline.
const BEFORE_DEPOSIT: ClientStatus[] = ["nouveau", "consultation_reservee", "consultation_faite", "perdu"];

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

async function recordPayment(stripe: Stripe, session: Stripe.Checkout.Session) {
  let metadata: Stripe.Metadata = session.metadata ?? {};
  if (!metadata.kind && session.payment_link) {
    const linkId = typeof session.payment_link === "string" ? session.payment_link : session.payment_link.id;
    metadata = (await stripe.paymentLinks.retrieve(linkId)).metadata;
  }

  const clientId = session.client_reference_id || metadata.client_id;
  if (!clientId) {
    console.error("Stripe payment without client reference:", session.id);
    return;
  }

  const supabase = getSupabaseAdmin();
  const { data: client, error } = await supabase.from("clients").select("status, notes").eq("id", clientId).single();
  if (error) throw error;

  // Stripe peut livrer le même événement plusieurs fois : la note porte l'ID de session.
  if (client.notes?.includes(session.id)) return;

  const amount = ((session.amount_total ?? 0) / 100).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
  const label = metadata.kind === "solde" ? "solde" : "dépôt";
  const line = `[${new Date().toLocaleDateString("fr-CA")}] Paiement Stripe reçu : ${amount} (${label}${metadata.reference ? ` — ${metadata.reference}` : ""}) · ${session.id}`;

  const now = new Date().toISOString();
  const update: Record<string, string | number> = {
    notes: client.notes ? `${client.notes}\n${line}` : line,
    updated_at: now,
  };
  if (metadata.kind !== "solde" && BEFORE_DEPOSIT.includes(client.status)) {
    update.status = "depot_recu";
    update.followup_count = 0;
  }

  const { error: updateError } = await supabase.from("clients").update(update).eq("id", clientId);
  if (updateError) throw updateError;
}
