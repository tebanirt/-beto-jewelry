import type { Metadata } from "next";
import GalleryContent from "./GalleryContent";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse Beto Jewelry's portfolio of custom engagement rings, wedding bands, and fine jewelry created for clients in Montreal.",
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
