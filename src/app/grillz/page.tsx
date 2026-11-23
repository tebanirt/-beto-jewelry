import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import GrillzContent from "./GrillzContent";

export const metadata: Metadata = pageMetadata("/grillz", "fr");

export default function GrillzPage() {
  return <GrillzContent />;
}
