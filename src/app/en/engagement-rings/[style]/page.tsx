import type { Metadata } from "next";
import { getStylePagesByCategory } from "@/lib/style-pages";
import { styleMetadata } from "@/lib/dynamic-meta";
import Page from "@/app/engagement-rings/[style]/page";

export function generateStaticParams() {
  return getStylePagesByCategory("engagement-rings").map((p) => ({ style: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ style: string }>;
}): Promise<Metadata> {
  const { style } = await params;
  return styleMetadata("engagement-rings", style, "en");
}

export default Page;
