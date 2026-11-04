/**
 * Copy-ready Messenger texts for Lauren. Only facts Rayane confirmed
 * (docs/business-ops-brief.md): 3D design in ~48 h, ring ready ~2 weeks after
 * approval (3 weeks in platinum), Marketplace deposit 150 $ fully credited,
 * IGI certificate, Christmas order deadline December 11. No invented promise,
 * no delivery date. Lauren reads and sends them herself.
 */

export type Lang = "en" | "fr";
export type TemplateId = "checkin" | "serious" | "christmas" | "update" | "ready" | "balance";

type Vars = { name: string; status?: string; balance?: string };

const T: Record<TemplateId, { label: string; en: (v: Vars) => string; fr: (v: Vars) => string }> = {
  checkin: {
    label: "Friendly check-in",
    en: ({ name }) =>
      `Hi ${name}! Just checking in about the ring you were looking at. If you send me the carat, the metal (14k or 18k, white, yellow or rose gold) and a photo of a style you like, I'll get you an exact price. No rush at all!`,
    fr: ({ name }) =>
      `Bonjour ${name}! Je fais un petit suivi pour la bague qui vous intéressait. Si vous m'envoyez le carat, le métal (14k ou 18k, or blanc, jaune ou rose) et une photo d'un style que vous aimez, je vous donne un prix exact. Aucune pression!`,
  },
  serious: {
    label: "Ready to start?",
    en: ({ name }) =>
      `Hi ${name}! Have you had a chance to think about the ring? Whenever you're ready, we start with the 3D design: you see it in about 48 hours, and the ring is ready about 2 weeks after you approve it. The $150 deposit goes 100% toward your ring, and every stone comes with an IGI certificate.`,
    fr: ({ name }) =>
      `Bonjour ${name}! Avez-vous eu le temps de réfléchir à la bague? Dès que vous êtes prêt(e), on commence par le design 3D : vous le voyez en environ 48 heures, et la bague est prête environ 2 semaines après votre approbation. Le dépôt de 150 $ est crédité à 100 % sur votre bague, et chaque pierre est accompagnée d'un certificat IGI.`,
  },
  christmas: {
    label: "Christmas deadline",
    en: ({ name }) =>
      `Hi ${name}! A quick heads-up: to have your ring for Christmas, the order needs to be placed by December 11 (design approved and deposit in). Happy to help you lock it in!`,
    fr: ({ name }) =>
      `Bonjour ${name}! Petit rappel : pour avoir votre bague à Noël, il faut commander avant le 11 décembre (design approuvé et dépôt reçu). Je peux vous aider à tout mettre en place!`,
  },
  update: {
    label: "Order update",
    en: ({ name, status }) =>
      `Hi ${name}! Quick update on your ring: ${status ?? "it's moving along nicely"}. I'll let you know as soon as it's ready.`,
    fr: ({ name, status }) =>
      `Bonjour ${name}! Petite mise à jour sur votre bague : ${status ?? "tout avance bien"}. Je vous écris dès qu'elle est prête.`,
  },
  ready: {
    label: "Ring is ready",
    en: ({ name }) => `Hi ${name}! Great news, your ring is ready! When would be a good time for you to pick it up?`,
    fr: ({ name }) => `Bonjour ${name}! Bonne nouvelle, votre bague est prête! Quel moment vous conviendrait pour venir la chercher?`,
  },
  balance: {
    label: "Balance reminder",
    en: ({ name, balance }) =>
      `Hi ${name}! Just a friendly note that the balance for your ring is ${balance ?? "due"}. You can pay by Interac or in person at pickup. Thank you!`,
    fr: ({ name, balance }) =>
      `Bonjour ${name}! Petit rappel amical : le solde de votre bague est de ${balance ?? "à régler"}. Vous pouvez payer par Interac ou en personne à la remise. Merci!`,
  },
};

/** Statuses in plain words for the "update" message. */
export const STATUS_WORDS: Record<string, { en: string; fr: string }> = {
  quote: { en: "your quote is ready", fr: "votre soumission est prête" },
  design: { en: "the 3D design is in progress", fr: "le design 3D est en cours" },
  production: { en: "it's being made at the workshop", fr: "elle est en fabrication à l'atelier" },
  ready: { en: "it's ready", fr: "elle est prête" },
  delivered: { en: "it's been delivered", fr: "elle a été remise" },
};

export const TEMPLATE_IDS = Object.keys(T) as TemplateId[];

export function templateLabel(id: TemplateId) {
  return T[id].label;
}

export function renderTemplate(id: TemplateId, lang: Lang, vars: Vars) {
  return T[id][lang](vars);
}
