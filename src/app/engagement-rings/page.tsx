import type { Metadata } from "next";
import EngagementRingsContent from "./EngagementRingsContent";

export const metadata: Metadata = {
  title: "Engagement Rings",
  description: "Custom engagement rings designed and crafted in Montreal. Every ring is created exclusively for you — from CAD design to final production.",
  alternates: { canonical: "/engagement-rings" },
  openGraph: {
    title: "Engagement Rings | Beto Jewelry",
    description: "Custom engagement rings designed and crafted in Montreal. Every ring is created exclusively for you — from CAD design to final production.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function EngagementRingsPage() {
  return <EngagementRingsContent />;
}
