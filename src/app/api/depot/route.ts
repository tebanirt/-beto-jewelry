import { NextResponse, type NextRequest } from "next/server";
import { getStripe, DEPOSIT_AMOUNT_CAD } from "@/lib/stripe";
import { addTaxes, toCents, TPS_LABEL, TVQ_LABEL } from "@/lib/taxes";

const SITE = "https://betojewelry.com";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Bouton « Payer le dépôt » du site : crée une page de paiement Stripe
 * (Checkout) de 250 $ + TPS + TVQ et y envoie le visiteur. Rien à créer à la
 * main dans Stripe : le montant et les taxes viennent d'ici, et le webhook
 * (/api/stripe/webhook) les relit dans les métadonnées pour les Finances.
 *
 * Paramètres facultatifs : prefilled_email, client_reference_id (fiche CRM,
 * envoyée par le formulaire après l'envoi), lang=en. Les cartes seulement
 * (Apple Pay et Google Pay compris) : pas de paiement en versements sur le
 * dépôt.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const english = q.get("lang") === "en";
  const email = q.get("prefilled_email")?.trim() ?? "";
  const clientRef = q.get("client_reference_id")?.trim() ?? "";
  const fallback = new URL("/design-your-jewelry/consultation", SITE);

  const taxed = addTaxes(DEPOSIT_AMOUNT_CAD);
  const metadata = {
    kind: "depot",
    source: "site",
    base: taxed.base.toFixed(2),
    tps: taxed.tps.toFixed(2),
    tvq: taxed.tvq.toFixed(2),
  };
  const line = (name: string, amount: number, description?: string) => ({
    price_data: { currency: "cad", unit_amount: toCents(amount), product_data: { name, description } },
    quantity: 1,
  });

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: english ? "en" : "fr-CA",
      allowed_payment_method_types: ["card"],
      line_items: [
        line(
          "Dépôt de design — Beto Jewelry",
          taxed.base,
          "Lance votre design 3D. Crédité à 100 % sur le prix final de votre pièce."
        ),
        line(TPS_LABEL, taxed.tps),
        line(TVQ_LABEL, taxed.tvq),
      ],
      metadata,
      payment_intent_data: { metadata, description: "Dépôt de design — Beto Jewelry" },
      ...(UUID_RE.test(clientRef) ? { client_reference_id: clientRef } : {}),
      ...(EMAIL_RE.test(email) ? { customer_email: email } : {}),
      phone_number_collection: { enabled: true },
      success_url: `${SITE}/design-your-jewelry/depot-recu`,
      cancel_url: fallback.toString(),
    });
    if (!session.url) throw new Error("Checkout session without URL");
    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    // Stripe pas encore configuré ou en panne : le visiteur garde un chemin
    // (réserver sa consultation) au lieu d'une page d'erreur.
    console.error("Deposit checkout error:", err);
    return NextResponse.redirect(fallback, 303);
  }
}
