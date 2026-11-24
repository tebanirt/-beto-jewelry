import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { blogMetadata } from "@/lib/dynamic-meta";
import Page from "@/app/blog/[slug]/page";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return blogMetadata(slug, "en");
}

export default Page;
