import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import Page from "@/app/faq/page";

// Version anglaise : même page, textes anglais (la langue vient de l'adresse /en).
export const metadata: Metadata = pageMetadata("/faq", "en");

export default Page;
