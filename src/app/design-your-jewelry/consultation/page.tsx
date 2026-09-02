import type { Metadata } from "next";
import ConsultationContent from "./ConsultationContent";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description: "Schedule a 30–45 minute consultation with our jewelry designer. Virtual or in-person in Montreal. No obligation.",
  alternates: { canonical: "/design-your-jewelry/consultation" },
};

export default function ConsultationPage() {
  return <ConsultationContent />;
}
