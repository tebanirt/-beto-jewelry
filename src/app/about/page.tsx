import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import AboutContent from "@/components/site/pages/AboutPage";

export const metadata: Metadata = pageMetadata("/about", "fr");

export default function AboutPage() {
  return <AboutContent />;
}
