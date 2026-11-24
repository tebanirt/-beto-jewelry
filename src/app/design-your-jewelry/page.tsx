import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import DesignYourJewelryContent from "./DesignYourJewelryContent";

export const metadata: Metadata = pageMetadata("/design-your-jewelry", "fr");

export default function DesignYourJewelryPage() {
  return <DesignYourJewelryContent />;
}
