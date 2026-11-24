import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import BaguesFiancaillesMontrealContent from "./BaguesFiancaillesMontrealContent";

export const metadata: Metadata = pageMetadata("/montreal", "fr");

export default function BaguesFiancaillesMontrealPage() {
  return <BaguesFiancaillesMontrealContent />;
}
