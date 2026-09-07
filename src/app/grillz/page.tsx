import type { Metadata } from "next";
import GrillzContent from "./GrillzContent";

export const metadata: Metadata = {
  title: "Grillz | Beto Jewelry",
  description: "Custom gold and diamond grillz, crafted from your exact dental mold. Removable dental jewelry made by hand in Montreal.",
  alternates: { canonical: "/grillz" },
  openGraph: {
    title: "Grillz | Beto Jewelry",
    description: "Custom gold and diamond grillz, crafted from your exact dental mold. Removable dental jewelry made by hand in Montreal.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function GrillzPage() {
  return <GrillzContent />;
}
