import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import Page from "@/app/wedding-bands/page";

// Version anglaise : même page, textes anglais (la langue vient de l'adresse /en).
export const metadata: Metadata = pageMetadata("/wedding-bands", "en");

export default Page;
