import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import FineJewelryContent from "./FineJewelryContent";

export const metadata: Metadata = pageMetadata("/fine-jewelry", "fr");

export default function FineJewelryPage() {
  return <FineJewelryContent />;
}
