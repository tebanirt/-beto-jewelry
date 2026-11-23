import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import ConsultationContent from "@/components/site/pages/BookPage";

export const metadata: Metadata = pageMetadata("/design-your-jewelry/consultation", "fr");

export default function ConsultationPage() {
  return <ConsultationContent />;
}
