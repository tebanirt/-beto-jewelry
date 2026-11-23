import type { Metadata } from "next";
import type { Lang } from "@/lib/locale";
import { buildMetadata } from "@/lib/page-meta";
import { getBlogPost } from "@/lib/blog-posts";
import { getStylePage, type StyleCategory } from "@/lib/style-pages";

/** Metadata d'une page de style (solitaire, pavé…), en français ou en anglais. */
export function styleMetadata(category: StyleCategory, slug: string, lang: Lang): Metadata {
  const page = getStylePage(category, slug);
  if (!page) return {};
  return buildMetadata(
    `/${page.category}/${page.slug}`,
    lang,
    { title: page[lang].seoTitle, description: page[lang].seoDescription },
    { image: { url: page.heroImage, alt: page.heroImageAlt[lang] } }
  );
}

/** Metadata d'un article du blogue, en français ou en anglais. */
export function blogMetadata(slug: string, lang: Lang): Metadata {
  const post = getBlogPost(slug);
  if (!post) return {};
  return buildMetadata(
    `/blog/${post.slug}`,
    lang,
    { title: post[lang].seoTitle, description: post[lang].seoDescription },
    { image: { url: post.heroImage, alt: post.heroImageAlt[lang] }, type: "article", publishedTime: post.publishedDate }
  );
}
