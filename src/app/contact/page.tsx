import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import ContactContent from "./ContactContent";

export const metadata: Metadata = pageMetadata("/contact", "fr");

export default function ContactPage() {
  return <ContactContent />;
}
