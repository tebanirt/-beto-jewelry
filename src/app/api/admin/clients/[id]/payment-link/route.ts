import { NextResponse } from "next/server";
import { getAdminSession, logActivity } from "@/lib/adminSession";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getStripe, DEPOSIT_AMOUNT_CAD, type PaymentKind } from "@/lib/stripe";
import { addTaxes, toCents, TPS_LABEL, TVQ_LABEL } from "@/lib/taxes";

/**
 * Crée un lien de paiement Stripe à usage unique pour un client (dépôt ou
 * solde). Rayane le colle lui-même dans son courriel ou sous le PDF officiel —
 * rien n'est envoyé au client automatiquement.
 *
 * Le montant reçu est avant taxes : la TPS et la TVQ s'ajoutent en deux lignes
 * séparées (option A de Rayane, 6 nov. 2026 : 250 $ + taxes = 287,44 $).
 */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/clients/[id]/payment-link">) {
  // Un compte d'équipe désactivé perd l'accès tout de suite, pas 7 jours plus tard.
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await ctx.params;
  const body = (await request.json()) as { kind?: string; amount?: number; reference?: string };

  const kind: PaymentKind = body.kind === "solde" ? "solde" : "depot";
  // Le dépôt peut différer du montant standard (ex. client honoré à l'ancien prix de 200 $).
  const amount = kind === "depot" && body.amount === undefined ? DEPOSIT_AMOUNT_CAD : Number(body.amount);
  if (!Number.isFinite(amount) || amount < 1 || amount > 100000) {
    return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
  }
  const reference = body.reference?.trim().slice(0, 80) || "";

  const supabase = getSupabaseAdmin();
  const { data: client, error } = await supabase.from("clients").select("id, full_name, email").eq("id", id).single();
  if (error || !client) {
    console.error("Payment link client read error:", error);
    return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  }

  const name =
    kind === "depot"
      ? "Dépôt de design — Beto Jewelry"
      : `Solde de votre création — Beto Jewelry${reference ? ` (${reference})` : ""}`;

  const taxed = addTaxes(amount);
  const line = (label: string, value: number, description?: string) => ({
    price_data: { currency: "cad", unit_amount: toCents(value), product_data: { name: label, description } },
    quantity: 1,
  });
  // Le webhook relit ces montants pour écrire le paiement dans les Finances.
  const metadata = {
    client_id: client.id,
    kind,
    reference,
    base: taxed.base.toFixed(2),
    tps: taxed.tps.toFixed(2),
    tvq: taxed.tvq.toFixed(2),
  };

  try {
    const stripe = getStripe();
    const link = await stripe.paymentLinks.create({
      line_items: [
        line(
          name,
          taxed.base,
          kind === "depot" ? "Lance votre design 3D. Entièrement crédité sur le prix final de votre pièce." : undefined
        ),
        line(TPS_LABEL, taxed.tps),
        line(TVQ_LABEL, taxed.tvq),
      ],
      metadata,
      payment_intent_data: { metadata },
      // Un seul paiement par lien : il se désactive dès que le client a payé.
      restrictions: { completed_sessions: { limit: 1 } },
      after_completion: {
        type: "hosted_confirmation",
        hosted_confirmation: {
          custom_message: "Merci ! Votre paiement est confirmé. Rayane vous contacte très bientôt pour la suite.",
        },
      },
    });

    const url = new URL(link.url);
    url.searchParams.set("client_reference_id", client.id);
    if (client.email) url.searchParams.set("prefilled_email", client.email);

    await logActivity(
      session,
      "payment_link_created",
      { type: "client", id: client.id },
      `${kind} : ${taxed.base.toFixed(2)} $ + TPS ${taxed.tps.toFixed(2)} $ + TVQ ${taxed.tvq.toFixed(2)} $ = ${taxed.total.toFixed(2)} $`
    );
    return NextResponse.json({ url: url.toString(), amount: taxed.base, tps: taxed.tps, tvq: taxed.tvq, total: taxed.total, kind });
  } catch (err) {
    console.error("Stripe payment link error:", err);
    return NextResponse.json({ error: "Erreur Stripe" }, { status: 502 });
  }
}
