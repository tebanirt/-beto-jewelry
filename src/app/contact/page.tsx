import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Beto Jewelry. Montreal-based custom jewelry. We respond to every inquiry personally within one business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | Beto Jewelry",
    description: "Get in touch with Beto Jewelry. Montreal-based custom jewelry. We respond to every inquiry personally within one business day.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
