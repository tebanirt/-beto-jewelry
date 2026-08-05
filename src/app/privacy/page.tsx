import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Beto Jewelry collects, uses, and protects your personal information, in accordance with PIPEDA and Quebec's Law 25.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
