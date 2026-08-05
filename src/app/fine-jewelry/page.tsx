import type { Metadata } from "next";
import FineJewelryContent from "./FineJewelryContent";

export const metadata: Metadata = {
  title: "Fine Jewelry",
  description: "Custom necklaces, earrings, bracelets, pendants, and chains. Handcrafted fine jewelry in Montreal.",
};

export default function FineJewelryPage() {
  return <FineJewelryContent />;
}
