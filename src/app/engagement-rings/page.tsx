import type { Metadata } from "next";
import EngagementRingsContent from "./EngagementRingsContent";

export const metadata: Metadata = {
  title: "Engagement Rings",
  description: "Custom engagement rings designed and crafted in Montreal. Every ring is created exclusively for you — from CAD design to final production.",
};

export default function EngagementRingsPage() {
  return <EngagementRingsContent />;
}
