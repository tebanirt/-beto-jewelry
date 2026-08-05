import type { Metadata } from "next";
import CustomJewelryContent from "./CustomJewelryContent";

export const metadata: Metadata = {
  title: "Custom Jewelry",
  description: "Bespoke jewelry designed exclusively for you. Learn how our custom process works — from consultation to CAD design to final delivery.",
};

export default function CustomJewelryPage() {
  return <CustomJewelryContent />;
}
