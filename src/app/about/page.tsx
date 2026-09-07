import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Beto Jewelry",
  description: "Meet Rayane Tebani, the certified goldsmith behind Beto Jewelry in Montreal — his training, his values, and why he designs every ring with you, not just for you.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Beto Jewelry | Beto Jewelry",
    description: "Meet Rayane Tebani, the certified goldsmith behind Beto Jewelry in Montreal — his training, his values, and why he designs every ring with you, not just for you.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
