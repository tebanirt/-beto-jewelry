import type { Metadata } from "next";
import ConsultationContent from "./ConsultationContent";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description: "Schedule a free consultation with our jewelry designer. Virtual or in-person in Montreal. No obligation.",
  alternates: { canonical: "/design-your-jewelry/consultation" },
  openGraph: {
    title: "Book a Consultation | Beto Jewelry",
    description: "Schedule a free consultation with our jewelry designer. Virtual or in-person in Montreal. No obligation.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function ConsultationPage() {
  return <ConsultationContent />;
}
