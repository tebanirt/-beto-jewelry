import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import CustomDesignContent from "./CustomDesignContent";
import { getEngagementPriceTable } from "@/lib/engagementPriceTable.server";

export const metadata: Metadata = pageMetadata("/design-your-jewelry/custom-design", "fr");

// Prices are recomputed from the private cost table at most once an hour.
export const revalidate = 3600;

export default async function CustomDesignPage() {
  // Only final prices reach the browser: costs and margins stay on the server.
  const priceTable = await getEngagementPriceTable();
  return <CustomDesignContent priceTable={priceTable} />;
}
