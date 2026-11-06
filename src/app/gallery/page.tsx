import type { Metadata } from "next";
import GalleryContent from "@/components/site/pages/WorkPage";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Custom engagement rings designed by Rayane Tebani and made in Montreal: solitaires, hidden halos, three stones, toi et moi.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Gallery | Beto Jewelry",
    description: "Browse Beto Jewelry's portfolio of custom engagement rings, wedding bands, and fine jewelry created for clients in Montreal.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function GalleryPage() {
  return <GalleryContent />;
}
