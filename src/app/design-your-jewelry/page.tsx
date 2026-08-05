import type { Metadata } from "next";
import DesignYourJewelryContent from "./DesignYourJewelryContent";

export const metadata: Metadata = {
  title: "Design Your Jewelry",
  description: "Three ways to begin creating your custom jewelry with Beto Jewelry. Start your custom design, book a consultation, or request a quote.",
};

export default function DesignYourJewelryPage() {
  return <DesignYourJewelryContent />;
}
