import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import ProcessPage from "@/components/site/pages/ProcessPage";

export const metadata: Metadata = pageMetadata("/process", "fr");

export default function Page() {
  return <ProcessPage />;
}
