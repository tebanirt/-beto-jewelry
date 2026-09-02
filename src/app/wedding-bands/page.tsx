import type { Metadata } from "next";
import WeddingBandsContent from "./WeddingBandsContent";

export const metadata: Metadata = {
  title: "Wedding Bands",
  description: "Custom wedding bands for men, women, and matching sets. Crafted in Montreal with ethically sourced gold and platinum.",
  alternates: { canonical: "/wedding-bands" },
};

export default function WeddingBandsPage() {
  return <WeddingBandsContent />;
}
