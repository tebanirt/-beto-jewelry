import type { Metadata } from "next";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing custom jewelry design and purchases from Beto Jewelry, Montreal.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service | Beto Jewelry",
    description: "The terms governing custom jewelry design and purchases from Beto Jewelry, Montreal.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
