import type { Metadata } from "next";
import BaguesFiancaillesMontrealContent from "./BaguesFiancaillesMontrealContent";

const TITLE = "Bague de Fiançailles Sur Mesure à Montréal | Beto Jewelry";
const DESCRIPTION =
  "Bague de fiançailles sur mesure conçue et fabriquée à Montréal par un joaillier diplômé (DEP). Rendu 3D en 48h, plus de 500 créations, consultation gratuite.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/bagues-de-fiancailles-sur-mesure-montreal",
    languages: {
      "fr-CA": "/bagues-de-fiancailles-sur-mesure-montreal",
      en: "/montreal",
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "fr_CA",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Bagues de fiançailles sur mesure à Montréal" }],
  },
};

export default function BaguesFiancaillesMontrealPage() {
  return <BaguesFiancaillesMontrealContent />;
}
