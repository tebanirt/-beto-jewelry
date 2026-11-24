import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import Page from "@/app/privacy/page";

// Version anglaise : même page, textes anglais (la langue vient de l'adresse /en).
export const metadata: Metadata = pageMetadata("/privacy", "en");

export default Page;
