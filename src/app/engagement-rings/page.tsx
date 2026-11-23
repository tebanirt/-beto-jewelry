import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import EngagementRingsContent from "@/components/site/pages/CustomRingsPage";

export const metadata: Metadata = pageMetadata("/engagement-rings", "fr");

export default function EngagementRingsPage() {
  return <EngagementRingsContent />;
}
