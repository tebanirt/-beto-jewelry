import type { Metadata } from "next";
import CustomJewelryContent from "./CustomJewelryContent";

export const metadata: Metadata = {
  title: "Custom Jewelry",
  description: "Bespoke jewelry designed exclusively for you. Learn how our custom process works — from consultation to CAD design to final delivery.",
  alternates: { canonical: "/custom-jewelry" },
  openGraph: {
    title: "Custom Jewelry | Beto Jewelry",
    description: "Bespoke jewelry designed exclusively for you. Learn how our custom process works — from consultation to CAD design to final delivery.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom Jewelry Design — Montreal",
  serviceType: "Bespoke jewellery design and manufacturing",
  description:
    "A structured custom process: consultation, 3D CAD rendering within ~48 hours of design approval, unlimited revisions before production, then handcrafting. Engagement rings delivered in about two weeks after CAD sign-off; more complex pieces in 2–4 weeks.",
  areaServed: [
    { "@type": "City", name: "Montreal" },
    { "@type": "Country", name: "Canada" },
  ],
  availableChannel: {
    "@type": "ServiceChannel",
    serviceLocation: { "@type": "Place", name: "Beto Jewelry atelier, Montreal" },
    availableLanguage: ["en", "fr"],
    description: "In person in Montreal or by virtual consultation anywhere in Canada.",
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
      description:
        "Custom engagement rings typically start around $2,000 CAD including the diamond. A $200 CAD design deposit — credited in full toward your piece — secures your project.",
    },
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://betojewelry.com" },
    { "@type": "ListItem", position: 2, name: "Custom Jewelry", item: "https://betojewelry.com/custom-jewelry" },
  ],
};

export default function CustomJewelryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CustomJewelryContent />
    </>
  );
}
