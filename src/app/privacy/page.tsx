import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Beto Jewelry collects, uses, and protects your personal information, in accordance with PIPEDA and Quebec's Law 25.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy | Beto Jewelry",
    description: "How Beto Jewelry collects, uses, and protects your personal information, in accordance with PIPEDA and Quebec's Law 25.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
