import type { Metadata } from "next";
import QuoteContent from "./QuoteContent";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Request a personalized jewelry quote from Beto Jewelry. No commitment required. We'll prepare an estimate based on your project.",
};

export default function QuotePage() {
  return <QuoteContent />;
}
