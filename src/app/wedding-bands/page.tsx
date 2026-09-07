import type { Metadata } from "next";
import WeddingBandsContent from "./WeddingBandsContent";

export const metadata: Metadata = {
  title: "Wedding Bands",
  description: "Custom wedding bands for men, women, and matching sets. Crafted in Montreal with ethically sourced gold and platinum.",
  alternates: { canonical: "/wedding-bands" },
  openGraph: {
    title: "Wedding Bands | Beto Jewelry",
    description: "Custom wedding bands for men, women, and matching sets. Crafted in Montreal with ethically sourced gold and platinum.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function WeddingBandsPage() {
  return <WeddingBandsContent />;
}
