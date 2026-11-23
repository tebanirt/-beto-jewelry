import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import { t } from "@/lib/translations";
import MontrealContent from "./MontrealContent";

const METADATA_DESCRIPTION =
  "Design a custom engagement ring in Montréal directly with independent goldsmith Rayane Tebani. 3D CAD in ~48h, rings from about $2,000 CAD, delivered in about two weeks. In person in Montréal or by video across Canada.";

export const metadata: Metadata = pageMetadata("/montreal", "en");

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
      description: "Custom engagement rings from about $2,000 CAD including the diamond. $250 CAD design deposit, credited in full.",
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
