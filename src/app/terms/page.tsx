import type { Metadata } from "next";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing custom jewelry design and purchases from Beto Jewelry, Montreal.",
};

export default function TermsPage() {
  return <TermsContent />;
}
