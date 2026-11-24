import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import QuoteContent from "./QuoteContent";

export const metadata: Metadata = pageMetadata("/design-your-jewelry/quote", "fr");

export default function QuotePage() {
  return <QuoteContent />;
}
