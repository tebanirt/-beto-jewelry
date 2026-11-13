export const GOOGLE_REVIEW_URL = "https://share.google/3Hj8w8Aal4iav1yPN";

/**
 * Bouton du dépôt de design de 250 $ + taxes (clients du site) : la route
 * /api/depot crée la page de paiement Stripe à chaque clic (montant, TPS et
 * TVQ calculés par le site) et revient sur /design-your-jewelry/depot-recu.
 * Le bouton reste caché tant que STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET
 * ne sont pas dans Vercel (drapeau STRIPE_DEPOSIT_READY de next.config.ts) :
 * la réservation Calendly reste alors en premier. Après l'ajout des clés,
 * redéployer pour que le bouton apparaisse.
 */
export const DEPOSIT_PAYMENT_URL: string = process.env.STRIPE_DEPOSIT_READY ? "/api/depot" : "";

/**
 * Emplacements « Photo à fournir » (PhotoSlot) : cachés sur le site tant que
 * les vraies photos n'existent pas (revue design du 8 nov. 2026, accord de
 * Rayane). Les sections qui n'ont que des emplacements sont masquées ; les
 * autres passent en texte seul. Remettre à true pour revoir la liste.
 */
export const SHOW_PHOTO_SLOTS = false;

/** Rayane's business line, shown as "need help?" inside the forms. */
export const BUSINESS_PHONE_DISPLAY = "438 874-5759";
export const BUSINESS_PHONE_TEL = "+14388745759";
