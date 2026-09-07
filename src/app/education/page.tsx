import type { Metadata } from "next";
import EducationContent from "./EducationContent";

export const metadata: Metadata = {
  title: "Education",
  description: "Learn everything about diamonds, metals, ring settings, and fine jewelry. Beto Jewelry's education center — honest, expert guidance with no sales pressure.",
  alternates: { canonical: "/education" },
  openGraph: {
    title: "Education | Beto Jewelry",
    description: "Learn everything about diamonds, metals, ring settings, and fine jewelry. Beto Jewelry's education center — honest, expert guidance with no sales pressure.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function EducationPage() {
  return <EducationContent />;
}
