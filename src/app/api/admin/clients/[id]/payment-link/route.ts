import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getStripe, DEPOSIT_AMOUNT_CAD, type PaymentKind } from "@/lib/stripe";

/**
 * Crée un lien de paiement Stripe à usage unique pour un client (dépôt ou
 * solde). Rayane le colle lui-même dans son courriel ou sous le PDF officiel —
 * rien n'est envoyé au client automatiquement.
 */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/clients/[id]/payment-link">) {
  const { id } = await ctx.params;
  const body = (await request.json()) as { kind?: string; amount?: number; reference?: string };

  const kind: PaymentKind = body.kind === "solde" ? "solde" : "depot";
  const amount = kind === "depot" ? DEPOSIT_AMOUNT_CAD : Number(body.amount);
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

  try {
    const stripe = getStripe();
    const link = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: "cad",
            unit_amount: Math.round(amount * 100),
            product_data: {
              name,
              description:
                kind === "depot"
                  ? "Lance votre design 3D. Entièrement crédité sur le prix final de votre pièce."
                  : undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { client_id: client.id, kind, reference },
      payment_intent_data: { metadata: { client_id: client.id, kind, reference } },
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

    return NextResponse.json({ url: url.toString(), amount, kind });
  } catch (err) {
    console.error("Stripe payment link error:", err);
    return NextResponse.json({ error: "Erreur Stripe" }, { status: 502 });
  }
}
