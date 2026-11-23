import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-meta";
import BlogIndexContent from "./BlogIndexContent";

export const metadata: Metadata = pageMetadata("/blog", "fr");

export default function BlogPage() {
  return <BlogIndexContent />;
}
