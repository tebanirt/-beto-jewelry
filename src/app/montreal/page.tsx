import type { Metadata } from "next";
import { t } from "@/lib/translations";
import MontrealContent from "./MontrealContent";

const METADATA_DESCRIPTION =
  "Design a custom engagement ring in Montréal directly with independent goldsmith Rayane Tebani. 3D CAD in ~48h, rings from about $2,000 CAD, delivered in about two weeks. In person in Montréal or by video across Canada.";

export const metadata: Metadata = {
  title: "Custom Engagement Rings Montréal",
  description: METADATA_DESCRIPTION,
  keywords: [
    "custom engagement rings Montreal",
    "bague de fiançailles sur mesure Montréal",
    "joaillier sur mesure Montréal",
    "independent jeweller Montreal",
    "bespoke engagement ring Montreal",
    "custom jewellery Montreal",
  ],
  alternates: {
    canonical: "/montreal",
    languages: {
      en: "/montreal",
      "fr-CA": "/bagues-de-fiancailles-sur-mesure-montreal",
    },
  },
  openGraph: {
    title: "Custom Engagement Rings Montréal | Beto Jewelry",
    description:
      "Design a custom engagement ring in Montréal directly with the goldsmith who makes it. 3D CAD in ~48h, honest pricing, delivered in about two weeks.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Engagement Rings Montréal" }],
  },
};

const m = t.en.pages.montreal;

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom Engagement Rings — Montréal",
  serviceType: "Bespoke engagement ring design and manufacturing",
  description: METADATA_DESCRIPTION,
  areaServed: [
    { "@type": "City", name: "Montreal" },
    { "@type": "AdministrativeArea", name: "Quebec" },
    { "@type": "Country", name: "Canada" },
  ],
  availableChannel: {
    "@type": "ServiceChannel",
    availableLanguage: ["en", "fr"],
    description: "In person by appointment at one of our two private offices (downtown Montréal or Saint-Laurent), or by video consultation anywhere in Canada.",
  },
  provider: {
    "@type": "JewelryStore",
    "@id": "https://betojewelry.com/#business",
    name: "Beto Jewelry",
    url: "https://betojewelry.com",
  },
  offers: {
    "@type": "Offer",
    priceCurrency: "CAD",
    priceSpecification: {
      "@type": "PriceSpecification",
      minPrice: 2000,
      priceCurrency: "CAD",
      description: "Custom engagement rings from about $2,000 CAD including the diamond. $200 CAD design deposit, credited in full.",
    },
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: m.faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://betojewelry.com" },
    { "@type": "ListItem", position: 2, name: "Custom Engagement Rings Montréal", item: "https://betojewelry.com/montreal" },
  ],
};

export default function MontrealPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <MontrealContent />
    </>
  );
}
