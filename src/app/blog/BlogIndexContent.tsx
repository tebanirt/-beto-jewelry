"use client";

import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useStore } from "@/store/useStore";
import { blogPosts } from "@/lib/blog-posts";

const copy = {
  en: { eyebrow: "Guides", title: "Buying guides,", titleItalic: "written for you.", subtitle: "Honest, practical guides on budget, materials, and the custom jewelry process — no sales pressure, just information." },
  fr: { eyebrow: "Guides", title: "Des guides d'achat,", titleItalic: "écrits pour vous.", subtitle: "Des guides honnêtes et pratiques sur le budget, les matériaux et le processus sur mesure — sans pression de vente, juste de l'information." },
};

export default function BlogIndexContent() {
  const language = useStore((s) => s.language);
  const c = copy[language];

  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} titleItalic={c.titleItalic} subtitle={c.subtitle} centered />

      <section className="py-16 lg:py-24 bg-beto-white">
        <div className="container-beto max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-beto-gray-subtle/20">
            {blogPosts.map((post, i) => {
              const post_l = post[language];
              return (
                <AnimatedSection key={post.slug} delay={i * 0.05}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block h-full bg-beto-white hover:bg-beto-offwhite transition-colors duration-300"
                  >
                    <div className="w-full aspect-[4/3] relative overflow-hidden bg-beto-offwhite">
                      <Image
                        src={post.heroImage}
                        alt={post.heroImageAlt[language]}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="p-8">
                      <p className="text-label text-beto-gold mb-3">{post.category[language]}</p>
                      <h2 className="font-display text-beto-black text-xl font-normal mb-3 leading-snug group-hover:text-beto-gold transition-colors">
                        {post_l.title}
                      </h2>
                      <p className="text-sm text-beto-gray leading-relaxed mb-4">{post_l.excerpt}</p>
                      <span className="text-xs text-beto-gray-light tracking-wide">{post.readTime}</span>
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
