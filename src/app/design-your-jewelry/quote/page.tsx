import type { Metadata } from "next";
import QuoteContent from "./QuoteContent";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Request a personalized jewelry quote from Beto Jewelry. No commitment required. We'll prepare an estimate based on your project.",
  alternates: { canonical: "/design-your-jewelry/quote" },
  openGraph: {
    title: "Request a Quote | Beto Jewelry",
    description: "Request a personalized jewelry quote from Beto Jewelry. No commitment required. We'll prepare an estimate based on your project.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function QuotePage() {
  return <QuoteContent />;
}
