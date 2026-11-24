import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { stylePages } from "@/lib/style-pages";
import { localizePath } from "@/lib/locale";

const BASE_URL = "https://betojewelry.com";

const routes = [
  "",
  // Page Montréal : /bagues-de-fiancailles-sur-mesure-montreal en français, /en/montreal en anglais.
  "/bagues-de-fiancailles-sur-mesure-montreal",
  "/process",
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

/** Une entrée par langue, chacune avec ses versions française et anglaise (hreflang). */
function bothLanguages(frPath: string, entry: Omit<MetadataRoute.Sitemap[number], "url">): MetadataRoute.Sitemap {
  const fr = `${BASE_URL}${localizePath(frPath || "/", "fr")}`.replace(/\/$/, "");
  const en = `${BASE_URL}${localizePath(frPath || "/", "en")}`;
  const alternates = { languages: { "fr-CA": fr || BASE_URL, "en-CA": en, "x-default": fr || BASE_URL } };
  return [
    { ...entry, url: fr || BASE_URL, alternates },
    { ...entry, url: en, alternates },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = routes.flatMap((route) =>
    bothLanguages(route, {
      changeFrequency: route === "" ? "weekly" : "monthly",
      priority:
        route === ""
          ? 1
          : route === "/bagues-de-fiancailles-sur-mesure-montreal"
            ? 0.9
            : route.startsWith("/privacy") || route.startsWith("/terms")
              ? 0.2
              : 0.8,
    })
  );

  const blogEntries: MetadataRoute.Sitemap = blogPosts.flatMap((post) =>
    bothLanguages(`/blog/${post.slug}`, {
      lastModified: post.publishedDate,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  const styleEntries: MetadataRoute.Sitemap = stylePages.flatMap((page) =>
    bothLanguages(`/${page.category}/${page.slug}`, {
      changeFrequency: "monthly",
      priority: 0.85,
    })
  );

  return [...staticEntries, ...blogEntries, ...styleEntries];
}
