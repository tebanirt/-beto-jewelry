import type { Metadata } from "next";
import { t } from "@/lib/translations";
import FAQContent from "./FAQContent";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to the questions we get asked most — custom design process, timelines, materials, sizing, and more.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ | Beto Jewelry",
    description: "Answers to the questions we get asked most — custom design process, timelines, materials, sizing, and more.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: t.en.pages.faq.sections.flatMap((section) =>
    section.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    }))
  ),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://betojewelry.com" },
    { "@type": "ListItem", position: 2, name: "FAQ", item: "https://betojewelry.com/faq" },
  ],
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <FAQContent />
    </>
  );
}
