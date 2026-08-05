import type { Metadata } from "next";
import BlogIndexContent from "./BlogIndexContent";

export const metadata: Metadata = {
  title: "Guides & conseils bijouterie",
  description: "Guides pratiques sur le budget, les métaux, les pierres et le processus de bijouterie sur mesure — par Beto Jewelry, Montréal.",
};

export default function BlogPage() {
  return <BlogIndexContent />;
}
