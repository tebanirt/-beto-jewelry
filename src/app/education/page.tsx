import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import EducationContent from "./EducationContent";

export const metadata: Metadata = pageMetadata("/education", "fr");

export default function EducationPage() {
  return <EducationContent />;
}
