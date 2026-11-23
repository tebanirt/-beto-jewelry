import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = pageMetadata("/privacy", "fr");

export default function PrivacyPage() {
  return <PrivacyContent />;
}
