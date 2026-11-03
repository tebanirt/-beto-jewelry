// Consentement aux témoins de mesure (Loi 25) : rien de Meta ni de Google ne se charge avant « Accepter ».
export type ConsentChoice = "granted" | "denied";

const KEY = "beto_consent_v1";
export const CONSENT_EVENT = "beto-consent-change";

export function readConsent(): ConsentChoice | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    // Stockage bloqué : le choix vaut pour cette visite seulement.
  }
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: choice }));
}
