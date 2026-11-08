export const GOOGLE_REVIEW_URL = "https://share.google/3Hj8w8Aal4iav1yPN";

/**
 * Stripe Payment Link for the 250 $ design deposit (website clients). Leave
 * empty until Rayane creates it: the deposit button stays hidden. In Stripe,
 * set "After payment" to redirect to /design-your-jewelry/depot-recu.
 */
export const DEPOSIT_PAYMENT_URL: string = "";

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
