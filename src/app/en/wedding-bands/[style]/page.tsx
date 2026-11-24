import type { Metadata } from "next";
import { getStylePagesByCategory } from "@/lib/style-pages";
import { styleMetadata } from "@/lib/dynamic-meta";
import Page from "@/app/wedding-bands/[style]/page";

export function generateStaticParams() {
  return getStylePagesByCategory("wedding-bands").map((p) => ({ style: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ style: string }>;
}): Promise<Metadata> {
  const { style } = await params;
  return styleMetadata("wedding-bands", style, "en");
}

export default Page;
