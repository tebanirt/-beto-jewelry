import type { Metadata } from "next";
import ProcessPage from "@/components/site/pages/ProcessPage";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "How a Beto Jewelry custom engagement ring is made: your request, the $250 design deposit, your 3D render in 48 hours, a free consultation, revisions, about two weeks of making in Montreal, and delivery.",
  alternates: { canonical: "/process" },
  openGraph: {
    title: "Our Process | Beto Jewelry",
    description:
      "Seven clear steps from your idea to your ring: 3D render in 48 hours, made in Montreal in about two weeks, IGI certificate for every stone.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function Page() {
  return <ProcessPage />;
}
