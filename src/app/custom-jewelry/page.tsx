import type { Metadata } from "next";
import CustomJewelryContent from "./CustomJewelryContent";

export const metadata: Metadata = {
  title: "Custom Jewelry",
  description: "Bespoke jewelry designed exclusively for you. Learn how our custom process works — from consultation to CAD design to final delivery.",
  alternates: { canonical: "/custom-jewelry" },
  openGraph: {
    title: "Custom Jewelry | Beto Jewelry",
    description: "Bespoke jewelry designed exclusively for you. Learn how our custom process works — from consultation to CAD design to final delivery.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function CustomJewelryPage() {
  return <CustomJewelryContent />;
}
