import type { Metadata } from "next";
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

export default function FAQPage() {
  return <FAQContent />;
}
