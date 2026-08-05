import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Beto Jewelry. Montreal-based custom jewelry. We respond to every inquiry personally within one business day.",
};

export default function ContactPage() {
  return <ContactContent />;
}
