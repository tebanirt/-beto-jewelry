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
    datePublished: post.publishedDate,
    author: { "@type": "Organization", name: "Beto Jewelry" },
    publisher: { "@type": "Organization", name: "Beto Jewelry", logo: { "@type": "ImageObject", url: "https://betojewelry.com/logo.png" } },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogArticleContent post={post} />
    </>
  );
}
