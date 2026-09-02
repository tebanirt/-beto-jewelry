import type { Metadata } from "next";
import GalleryContent from "./GalleryContent";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse Beto Jewelry's portfolio of custom engagement rings, wedding bands, and fine jewelry created for clients in Montreal.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return <GalleryContent />;
}
