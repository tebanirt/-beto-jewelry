import type { Metadata } from "next";
import FineJewelryContent from "./FineJewelryContent";

export const metadata: Metadata = {
  title: "Fine Jewelry",
  description: "Custom necklaces, earrings, bracelets, pendants, and chains. Handcrafted fine jewelry in Montreal.",
  alternates: { canonical: "/fine-jewelry" },
  openGraph: {
    title: "Fine Jewelry | Beto Jewelry",
    description: "Custom necklaces, earrings, bracelets, pendants, and chains. Handcrafted fine jewelry in Montreal.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function FineJewelryPage() {
  return <FineJewelryContent />;
}
