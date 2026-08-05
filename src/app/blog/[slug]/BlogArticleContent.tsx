"use client";

import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { useStore } from "@/store/useStore";
import type { BlogPost } from "@/lib/blog-posts";

const copy = {
  en: { backToGuides: "← All Guides", cta1: "Start Your Custom Design", cta2: "Book a Consultation" },
  fr: { backToGuides: "← Tous les guides", cta1: "Commencer votre design", cta2: "Réserver une consultation" },
};

export default function BlogArticleContent({ post }: { post: BlogPost }) {
  const language = useStore((s) => s.language);
  const post_l = post[language];
  const c = copy[language];

  return (
    <>
      <PageHero eyebrow={post.category[language]} title={post_l.title} subtitle={post_l.excerpt} />

      <section className="py-16 lg:py-24 bg-beto-white">
        <div className="container-beto max-w-2xl mx-auto">
          <Link href="/blog" className="text-xs font-medium tracking-widest uppercase text-beto-gray hover:text-beto-gold transition-colors">
            {c.backToGuides}
          </Link>

          <div className="relative w-full aspect-[16/10] mt-8 overflow-hidden bg-beto-offwhite">
            <Image
              src={post.heroImage}
              alt={post.heroImageAlt[language]}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </div>

          <div className="mt-10 flex flex-col gap-10">
            {post_l.sections.map((s) => (
              <AnimatedSection key={s.heading}>
                <h2 className="font-display text-beto-black text-xl font-normal mb-3">{s.heading}</h2>
                <p className="text-sm text-beto-gray leading-relaxed">{s.body}</p>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-16 pt-12 border-t border-beto-gray-subtle/40 flex flex-col sm:flex-row gap-4">
            <Button href="/design-your-jewelry/custom-design" variant="primary" size="lg">
              {c.cta1}
            </Button>
            <Button href="/design-your-jewelry/consultation" variant="secondary" size="lg">
              {c.cta2}
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
