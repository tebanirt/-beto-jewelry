import type { Metadata } from "next";
import WeddingBandsContent from "./WeddingBandsContent";

export const metadata: Metadata = {
  title: "Wedding Bands",
  description: "Custom wedding bands for men, women, and matching sets. Crafted in Montreal with ethically sourced gold and platinum.",
};

export default function WeddingBandsPage() {
  return <WeddingBandsContent />;
}
