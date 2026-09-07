import type { Metadata } from "next";
import DesignYourJewelryContent from "./DesignYourJewelryContent";

export const metadata: Metadata = {
  title: "Design Your Jewelry",
  description: "Three ways to begin creating your custom jewelry with Beto Jewelry. Start your custom design, book a consultation, or request a quote.",
  alternates: { canonical: "/design-your-jewelry" },
  openGraph: {
    title: "Design Your Jewelry | Beto Jewelry",
    description: "Three ways to begin creating your custom jewelry with Beto Jewelry. Start your custom design, book a consultation, or request a quote.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function DesignYourJewelryPage() {
  return <DesignYourJewelryContent />;
}
