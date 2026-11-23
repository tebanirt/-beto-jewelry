import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import WeddingBandsContent from "./WeddingBandsContent";

export const metadata: Metadata = pageMetadata("/wedding-bands", "fr");

export default function WeddingBandsPage() {
  return <WeddingBandsContent />;
}
