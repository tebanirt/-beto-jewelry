import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStylePage, getStylePagesByCategory, CATEGORY_LABEL } from "@/lib/style-pages";
import StylePageContent from "@/components/shared/StylePageContent";

const CATEGORY = "grillz" as const;

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
      images: [{ url: page.heroImage, alt: page.heroImageAlt.fr }],
    },
  };
}

export default async function GrillzStylePage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style } = await params;
  const page = getStylePage(CATEGORY, style);
  if (!page) notFound();

  const catLabel = CATEGORY_LABEL[page.category].en;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: page.fr.title,
    name: page.fr.title,
    description: page.fr.seoDescription,
    inLanguage: "fr-CA",
    areaServed: { "@type": "City", name: "Montreal" },
    provider: {
      "@type": "JewelryStore",
      "@id": "https://betojewelry.com/#business",
      name: "Beto Jewelry",
      url: "https://betojewelry.com",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "CAD",
      priceSpecification: { "@type": "PriceSpecification", minPrice: 2000, priceCurrency: "CAD" },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://betojewelry.com" },
      { "@type": "ListItem", position: 2, name: catLabel, item: `https://betojewelry.com/${page.category}` },
      { "@type": "ListItem", position: 3, name: page.fr.title, item: `https://betojewelry.com/${page.category}/${page.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <StylePageContent page={page} />
    </>
  );
}
