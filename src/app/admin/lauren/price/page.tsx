import { getEngagementPriceTable } from "@/lib/engagementPriceTable.server";
import PriceTool from "./PriceTool";

export const metadata = { title: "Price — Beto Jewelry" };

export default async function PricePage() {
  // Final prices only: Rayane's costs and margins stay on the server.
  const table = await getEngagementPriceTable();
  return (
    <div>
      <h1 className="text-2xl font-medium text-beto-black mb-1">Price</h1>
      <p className="text-sm text-beto-gray-light mb-6">
        Engagement rings, lab-grown diamond (E colour, VVS2, IGI certificate). Prices approved by Rayane, before tax.
      </p>
      <PriceTool table={table} />
    </div>
  );
}
