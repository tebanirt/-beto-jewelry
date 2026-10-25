import type { Metadata } from "next";
import NouveauClientContent from "./NouveauClientContent";

export const metadata: Metadata = {
  title: "Bienvenue chez Beto Jewelry",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <NouveauClientContent />;
}
