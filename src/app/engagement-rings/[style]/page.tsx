import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStylePage, getStylePagesByCategory } from "@/lib/style-pages";
import StylePageContent from "@/components/shared/StylePageContent";

const CATEGORY = "engagement-rings" as const;

export function generateStaticParams() {
  return getStylePagesByCategory(CATEGORY).map((p) => ({ style: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ style: string }>;
}): Promise<Metadata> {
  const { style } = await params;
  const page = getStylePage(CATEGORY, style);
  if (!page) return {};

  return {
    title: page.fr.seoTitle,
    description: page.fr.seoDescription,
    alternates: { canonical: `/${page.category}/${page.slug}` },
    openGraph: {
      title: page.fr.seoTitle,
      description: page.fr.seoDescription,
      type: "website",
    },
  };
}

export default async function EngagementRingStylePage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style } = await params;
  const page = getStylePage(CATEGORY, style);
  if (!page) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: page.fr.title,
    name: page.fr.title,
    description: page.fr.seoDescription,
    areaServed: { "@type": "City", name: "Montreal" },
    provider: { "@type": "JewelryStore", name: "Beto Jewelry", url: "https://betojewelry.com" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StylePageContent page={page} />
    </>
  );
}
