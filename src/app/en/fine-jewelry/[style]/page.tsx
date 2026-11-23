import type { Metadata } from "next";
import { getStylePagesByCategory } from "@/lib/style-pages";
import { styleMetadata } from "@/lib/dynamic-meta";
import Page from "@/app/fine-jewelry/[style]/page";

export function generateStaticParams() {
  return getStylePagesByCategory("fine-jewelry").map((p) => ({ style: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ style: string }>;
}): Promise<Metadata> {
  const { style } = await params;
  return styleMetadata("fine-jewelry", style, "en");
}

export default Page;
