import type { Metadata } from "next";
import EducationContent from "./EducationContent";

export const metadata: Metadata = {
  title: "Education",
  description: "Learn everything about diamonds, metals, ring settings, and fine jewelry. Beto Jewelry's education center — honest, expert guidance with no sales pressure.",
};

export default function EducationPage() {
  return <EducationContent />;
}
