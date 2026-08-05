"use client";

import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { useStore } from "@/store/useStore";
import { CATEGORY_LABEL, type StylePage } from "@/lib/style-pages";
import { blogPosts } from "@/lib/blog-posts";

const copy = {
  en: { back: "← Back to", cta1: "Start Your Custom Design", cta2: "Book a Consultation", relatedLabel: "Related Guides" },
  fr: { back: "← Retour à", cta1: "Commencer votre design", cta2: "Réserver une consultation", relatedLabel: "Guides connexes" },
};

export default function StylePageContent({ page }: { page: StylePage }) {
  const language = useStore((s) => s.language);
  const p = page[language];
  const c = copy[language];
  const catLabel = CATEGORY_LABEL[page.category][language];
  const catHref = `/${page.category}`;
  const related = blogPosts.filter((b) => page.relatedBlogSlugs.includes(b.slug));

  return (
    <>
      <PageHero eyebrow={catLabel} title={p.title} subtitle={p.subtitle} />

      <section className="py-16 lg:py-24 bg-beto-white">
        <div className="container-beto max-w-2xl mx-auto">
          <Link href={catHref} className="text-xs font-medium tracking-widest uppercase text-beto-gray hover:text-beto-gold transition-colors">
            {c.back} {catLabel}
          </Link>

          <div className="relative w-full aspect-[16/10] mt-8 overflow-hidden bg-beto-offwhite">
            <Image
              src={page.heroImage}
              alt={page.heroImageAlt[language]}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </div>

          <div className="mt-10 flex flex-col gap-10">
            {p.sections.map((s) => (
              <AnimatedSection key={s.heading}>
                <h2 className="font-display text-beto-black text-xl font-normal mb-3">{s.heading}</h2>
                <p className="text-sm text-beto-gray leading-relaxed">{s.body}</p>
              </AnimatedSection>
            ))}
          </div>

          {related.length > 0 && (
            <AnimatedSection className="mt-14 pt-10 border-t border-beto-gray-subtle/40">
              <p className="text-label text-beto-gold mb-4">{c.relatedLabel}</p>
              <div className="flex flex-col gap-2">
                {related.map((b) => (
                  <Link key={b.slug} href={`/blog/${b.slug}`} className="text-sm text-beto-black hover:text-beto-gold transition-colors">
                    → {b[language].title}
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          )}

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
