import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/lib/blog-posts";
import BlogArticleContent from "./BlogArticleContent";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.fr.seoTitle,
    description: post.fr.seoDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.fr.seoTitle,
      description: post.fr.seoDescription,
      type: "article",
      publishedTime: post.publishedDate,
      images: [{ url: post.heroImage, alt: post.heroImageAlt.fr }],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.fr.title,
    description: post.fr.seoDescription,
    image: `https://betojewelry.com${post.heroImage}`,
    datePublished: post.publishedDate,
    dateModified: post.publishedDate,
    inLanguage: "fr-CA",
    mainEntityOfPage: `https://betojewelry.com/blog/${post.slug}`,
    author: {
      "@type": "Person",
      name: "Rayane Tebani",
      jobTitle: "Goldsmith & Founder, Beto Jewelry",
      description:
        "Certified goldsmith trained at the École des métiers du Sud-Ouest-de-Montréal. 500+ designs created over his career.",
      url: "https://betojewelry.com/about",
    },
    publisher: { "@type": "Organization", name: "Beto Jewelry", logo: { "@type": "ImageObject", url: "https://betojewelry.com/logo.png" } },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://betojewelry.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://betojewelry.com/blog" },
      { "@type": "ListItem", position: 3, name: post.fr.title, item: `https://betojewelry.com/blog/${post.slug}` },
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
      <BlogArticleContent post={post} />
    </>
  );
}
