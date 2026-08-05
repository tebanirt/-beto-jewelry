import type { Metadata } from "next";
import GrillzContent from "./GrillzContent";

export const metadata: Metadata = {
  title: "Grillz | Beto Jewelry",
  description: "Custom gold and diamond grillz, crafted from your exact dental mold. Removable dental jewelry made by hand in Montreal.",
};

export default function GrillzPage() {
  return <GrillzContent />;
}
