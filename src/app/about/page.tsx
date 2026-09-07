import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Beto Jewelry",
  description: "The story behind Beto Jewelry — Montreal's custom fine jewelry house. Learn about our goldsmith, our values, and our mission.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Beto Jewelry | Beto Jewelry",
    description: "The story behind Beto Jewelry — Montreal's custom fine jewelry house. Learn about our goldsmith, our values, and our mission.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
