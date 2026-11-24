import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import HomePage from "@/components/site/pages/HomePage";

export const metadata: Metadata = pageMetadata("/", "fr");

export default function Page() {
  return <HomePage />;
}
