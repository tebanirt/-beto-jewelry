import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import TermsContent from "./TermsContent";

export const metadata: Metadata = pageMetadata("/terms", "fr");

export default function TermsPage() {
  return <TermsContent />;
}
