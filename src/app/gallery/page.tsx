import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import GalleryContent from "@/components/site/pages/WorkPage";

export const metadata: Metadata = pageMetadata("/gallery", "fr");

export default function GalleryPage() {
  return <GalleryContent />;
}
