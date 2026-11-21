import type { Metadata } from "next";
import NouveauClientContent from "./NouveauClientContent";

export const metadata: Metadata = {
  // absolute : le titre contient déjà la marque ; sans ça, le gabarit du layout l'ajoute une deuxième fois.
  title: { absolute: "Bienvenue chez Beto Jewelry" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <NouveauClientContent />;
}
