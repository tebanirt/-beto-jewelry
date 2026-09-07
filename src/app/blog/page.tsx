import type { Metadata } from "next";
import BlogIndexContent from "./BlogIndexContent";

export const metadata: Metadata = {
  title: "Guides & conseils bijouterie",
  description: "Guides pratiques sur le budget, les métaux, les pierres et le processus de bijouterie sur mesure — par Beto Jewelry, Montréal.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Guides & conseils bijouterie | Beto Jewelry",
    description: "Guides pratiques sur le budget, les métaux, les pierres et le processus de bijouterie sur mesure — par Beto Jewelry, Montréal.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function BlogPage() {
  return <BlogIndexContent />;
}
