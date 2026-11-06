import type { Metadata } from "next";
import HomePage from "@/components/site/pages/HomePage";

export const metadata: Metadata = {
  title: "Beto Jewelry | Custom Engagement Rings Montreal",
  description:
    "Custom engagement rings and fine jewelry in Montreal, designed with you by certified goldsmith Rayane Tebani. 3D rendering in 48 hours, engagement rings delivered in about two weeks.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <HomePage />;
}
