import type { Metadata } from "next";
import { localizePath, type Lang } from "@/lib/locale";

/**
 * Titres et descriptions Google de chaque page, dans les deux langues.
 * Le français est la version par défaut (à la racine), l'anglais est sous /en.
 * Les textes anglais sont ceux qui étaient en ligne ; les français en sont la traduction,
 * sans nouvelle promesse (23 nov. 2026).
 */
type Copy = { title: string; description: string; absolute?: boolean };

export const PAGE_META: Record<string, { fr: Copy; en: Copy }> = {
  "/": {
    fr: {
      title: "Beto Jewelry | Bagues de fiançailles sur mesure à Montréal",
      description:
        "Bagues de fiançailles et bijoux sur mesure à Montréal, dessinés avec vous par le joaillier diplômé Rayane Tebani. Rendu 3D en 48 heures, bague de fiançailles prête en environ deux semaines.",
      absolute: true,
    },
    en: {
      title: "Beto Jewelry | Custom Engagement Rings Montreal",
      description:
        "Custom engagement rings and fine jewelry in Montreal, designed with you by certified goldsmith Rayane Tebani. 3D rendering in 48 hours, engagement rings delivered in about two weeks.",
      absolute: true,
    },
  },
  "/process": {
    fr: {
      title: "Notre processus",
      description:
        "Comment se fait une bague de fiançailles sur mesure Beto Jewelry : votre demande, le dépôt de design de 250 $, votre rendu 3D en 48 heures, une consultation gratuite, les révisions, environ deux semaines de fabrication à Montréal, puis la remise.",
    },
    en: {
      title: "Our Process",
      description:
        "How a Beto Jewelry custom engagement ring is made: your request, the $250 design deposit, your 3D render in 48 hours, a free consultation, revisions, about two weeks of making in Montreal, and delivery.",
    },
  },
  "/about": {
    fr: {
      title: "À propos",
      description:
        "Rencontrez Rayane Tebani, le joaillier diplômé derrière Beto Jewelry à Montréal : sa formation, ses valeurs, et pourquoi il dessine chaque bague avec vous, pas seulement pour vous.",
    },
    en: {
      title: "About",
      description:
        "Meet Rayane Tebani, the certified goldsmith behind Beto Jewelry in Montreal — his training, his values, and why he designs every ring with you, not just for you.",
    },
  },
  "/blog": {
    fr: {
      title: "Guides et conseils en joaillerie",
      description:
        "Guides pratiques sur le budget, les métaux, les pierres et le processus de joaillerie sur mesure, par Beto Jewelry, Montréal.",
    },
    en: {
      title: "Jewelry Guides & Advice",
      description:
        "Practical guides on budget, metals, stones and the custom jewelry process, by Beto Jewelry, Montreal.",
    },
  },
  "/contact": {
    fr: {
      title: "Contact",
      description:
        "Écrivez à Beto Jewelry, joaillerie sur mesure à Montréal. Nous répondons personnellement à chaque demande en un jour ouvrable.",
    },
    en: {
      title: "Contact",
      description:
        "Get in touch with Beto Jewelry. Montreal-based custom jewelry. We respond to every inquiry personally within one business day.",
    },
  },
  "/custom-jewelry": {
    fr: {
      title: "Bijoux sur mesure",
      description:
        "Des bijoux conçus pour vous seulement. Découvrez notre processus sur mesure : de la consultation au design 3D, jusqu'à la remise.",
    },
    en: {
      title: "Custom Jewelry",
      description:
        "Bespoke jewelry designed exclusively for you. Learn how our custom process works — from consultation to CAD design to final delivery.",
    },
  },
  "/design-your-jewelry": {
    fr: {
      title: "Créer votre bijou",
      description:
        "Trois façons de commencer votre bijou sur mesure avec Beto Jewelry : commencer votre design, réserver une consultation ou demander une soumission.",
    },
    en: {
      title: "Design Your Jewelry",
      description:
        "Three ways to begin creating your custom jewelry with Beto Jewelry. Start your custom design, book a consultation, or request a quote.",
    },
  },
  "/design-your-jewelry/consultation": {
    fr: {
      title: "Réserver une consultation",
      description:
        "Réservez une consultation gratuite avec votre joaillier, en vidéo ou en personne à Montréal. Sans engagement.",
    },
    en: {
      title: "Book a Consultation",
      description:
        "Schedule a free consultation with our jewelry designer. Virtual or in-person in Montreal. No obligation.",
    },
  },
  "/design-your-jewelry/custom-design": {
    fr: {
      title: "Commencer mon design",
      description:
        "Commencez votre bijou sur mesure : parlez-nous de votre projet, de la pierre, du métal et de votre budget. Consultation gratuite, sans engagement.",
    },
    en: {
      title: "Start Your Custom Design",
      description:
        "Begin your custom jewelry journey — tell us about your project, stone, metal, and budget. Free consultation, no obligation.",
    },
  },
  "/design-your-jewelry/quote": {
    fr: {
      title: "Demander une soumission",
      description:
        "Demandez une soumission personnalisée à Beto Jewelry, sans engagement. Nous préparons une estimation selon votre projet.",
    },
    en: {
      title: "Request a Quote",
      description:
        "Request a personalized jewelry quote from Beto Jewelry. No commitment required. We'll prepare an estimate based on your project.",
    },
  },
  "/education": {
    fr: {
      title: "Guide des diamants et des bijoux",
      description:
        "Tout savoir sur les diamants, les métaux, les montures et la joaillerie fine. Le centre d'information de Beto Jewelry : des conseils honnêtes, sans pression de vente.",
    },
    en: {
      title: "Education",
      description:
        "Learn everything about diamonds, metals, ring settings, and fine jewelry. Beto Jewelry's education center — honest, expert guidance with no sales pressure.",
    },
  },
  "/engagement-rings": {
    fr: {
      title: "Bagues de fiançailles sur mesure",
      description:
        "Bagues de fiançailles sur mesure, dessinées et fabriquées à Montréal. Chaque bague est créée pour vous seulement, du design 3D à la fabrication.",
    },
    en: {
      title: "Custom Engagement Rings",
      description:
        "Custom engagement rings designed and crafted in Montreal. Every ring is created exclusively for you — from CAD design to final production.",
    },
  },
  "/faq": {
    fr: {
      title: "Questions fréquentes",
      description:
        "Les réponses aux questions qu'on nous pose le plus : le processus sur mesure, les délais, les matériaux, la grandeur et plus encore.",
    },
    en: {
      title: "FAQ",
      description:
        "Answers to the questions we get asked most — custom design process, timelines, materials, sizing, and more.",
    },
  },
  "/fine-jewelry": {
    fr: {
      title: "Joaillerie fine",
      description:
        "Colliers, boucles d'oreilles, bracelets, pendentifs et chaînes sur mesure. Joaillerie fine fabriquée à Montréal.",
    },
    en: {
      title: "Fine Jewelry",
      description:
        "Custom necklaces, earrings, bracelets, pendants, and chains. Handcrafted fine jewelry in Montreal.",
    },
  },
  "/gallery": {
    fr: {
      title: "Réalisations",
      description:
        "Bagues de fiançailles sur mesure dessinées par Rayane Tebani et fabriquées à Montréal : solitaires, halos cachés, trois pierres, toi et moi.",
    },
    en: {
      title: "Gallery",
      description:
        "Custom engagement rings designed by Rayane Tebani and made in Montreal: solitaires, hidden halos, three stones, toi et moi.",
    },
  },
  "/grillz": {
    fr: {
      title: "Grillz",
      description:
        "Grillz sur mesure en or et en diamants, faits à partir de votre empreinte dentaire. Bijoux dentaires amovibles fabriqués à la main à Montréal.",
    },
    en: {
      title: "Grillz",
      description:
        "Custom gold and diamond grillz, crafted from your exact dental mold. Removable dental jewelry made by hand in Montreal.",
    },
  },
  "/montreal": {
    fr: {
      title: "Bague de Fiançailles Sur Mesure à Montréal | Beto Jewelry",
      description:
        "Bague de fiançailles sur mesure conçue et fabriquée à Montréal par un joaillier diplômé (DEP). Rendu 3D en 48h, plus de 500 créations, consultation gratuite.",
      absolute: true,
    },
    en: {
      title: "Custom Engagement Rings Montréal",
      description:
        "Design a custom engagement ring in Montréal directly with independent goldsmith Rayane Tebani. 3D CAD in ~48h, rings from about $2,000 CAD, delivered in about two weeks. In person in Montréal or by video across Canada.",
    },
  },
  "/privacy": {
    fr: {
      title: "Politique de confidentialité",
      description:
        "Comment Beto Jewelry recueille, utilise et protège vos renseignements personnels, conformément à la LPRPDE et à la Loi 25 du Québec.",
    },
    en: {
      title: "Privacy Policy",
      description:
        "How Beto Jewelry collects, uses, and protects your personal information, in accordance with PIPEDA and Quebec's Law 25.",
    },
  },
  "/terms": {
    fr: {
      title: "Conditions d'utilisation",
      description: "Les conditions qui encadrent la création et l'achat de bijoux sur mesure chez Beto Jewelry, Montréal.",
    },
    en: {
      title: "Terms of Service",
      description: "The terms governing custom jewelry design and purchases from Beto Jewelry, Montreal.",
    },
  },
  "/wedding-bands": {
    fr: {
      title: "Alliances et joncs de mariage",
      description:
        "Alliances sur mesure pour elle, pour lui, et ensembles assortis. Fabriquées à Montréal en or et en platine de source responsable.",
    },
    en: {
      title: "Wedding Bands",
      description:
        "Custom wedding bands for men, women, and matching sets. Crafted in Montreal with ethically sourced gold and platinum.",
    },
  },
};

const OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Montréal" };

/** Adresses d'une page dans les deux langues (pour hreflang, canonical et sitemap). */
export function alternatesFor(frPath: string, lang: Lang): NonNullable<Metadata["alternates"]> {
  const fr = localizePath(frPath, "fr");
  const en = localizePath(frPath, "en");
  return {
    canonical: lang === "fr" ? fr : en,
    languages: { "fr-CA": fr, "en-CA": en, "x-default": fr },
  };
}

type Extra = { image?: { url: string; alt: string }; type?: "website" | "article"; publishedTime?: string };

/** Metadata complète d'une page : titre, description, langue, canonical, hreflang, Open Graph. */
export function buildMetadata(frPath: string, lang: Lang, copy: Copy, extra: Extra = {}): Metadata {
  const fullTitle = copy.absolute ? copy.title : `${copy.title} | Beto Jewelry`;
  return {
    title: copy.absolute ? { absolute: copy.title } : copy.title,
    description: copy.description,
    alternates: alternatesFor(frPath, lang),
    openGraph: {
      title: fullTitle,
      description: copy.description,
      type: extra.type ?? "website",
      locale: lang === "fr" ? "fr_CA" : "en_CA",
      alternateLocale: lang === "fr" ? "en_CA" : "fr_CA",
      url: localizePath(frPath, lang),
      siteName: "Beto Jewelry",
      ...(extra.publishedTime ? { publishedTime: extra.publishedTime } : {}),
      images: [extra.image ?? OG_IMAGE],
    },
  };
}

/** Metadata d'une page fixe, à partir de PAGE_META. */
export function pageMetadata(frPath: string, lang: Lang): Metadata {
  const entry = PAGE_META[frPath];
  if (!entry) throw new Error(`PAGE_META manquant pour ${frPath}`);
  return buildMetadata(frPath, lang, entry[lang]);
}
