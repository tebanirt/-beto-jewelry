import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { stylePages } from "@/lib/style-pages";

const BASE_URL = "https://betojewelry.com";

const routes = [
  "",
  "/engagement-rings",
  "/wedding-bands",
  "/fine-jewelry",
  "/custom-jewelry",
  "/grillz",
  "/design-your-jewelry",
  "/design-your-jewelry/custom-design",
  "/design-your-jewelry/consultation",
  "/design-your-jewelry/quote",
  "/gallery",
  "/about",
  "/education",
  "/blog",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/privacy") || route.startsWith("/terms") ? 0.2 : 0.8,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.publishedDate,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const styleEntries: MetadataRoute.Sitemap = stylePages.map((page) => ({
    url: `${BASE_URL}/${page.category}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  return [...staticEntries, ...blogEntries, ...styleEntries];
}
