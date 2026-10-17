"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import TrustBar from "@/components/shared/TrustBar";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { useStore } from "@/store/useStore";
import { getBlogPost } from "@/lib/blog-posts";

const RELATED_SLUGS = [
  "prix-bague-fiancailles-montreal-2026",
  "a-quoi-sattendre-consultation-joaillier",
  "grande-bijouterie-vs-joaillier-independant-montreal",
  "bague-sur-mesure-vs-pret-a-porter",
  "meilleurs-endroits-demande-mariage-montreal",
];

export default function MontrealContent() {
  const tr = useTranslation();
  const language = useStore((s) => s.language);
  const p = tr.pages.montreal;

  const related = RELATED_SLUGS.map((slug) => {
    const post = getBlogPost(slug);
    return post ? { slug, title: post[language].title } : null;
  }).filter((x): x is { slug: string; title: string } => x !== null);

  return (
    <>
      <PageHero eyebrow={p.eyebrow} title={p.title} titleItalic={p.titleItalic} subtitle={p.subtitle} />

      <TrustBar />

      <section className="bg-beto-white py-20 lg:py-28">
        <div className="container-beto max-w-3xl">
          <AnimatedSection>
            <h2 className="font-display text-beto-black text-2xl lg:text-3xl font-light mb-6">{p.introHeading}</h2>
            <p className="text-sm text-beto-gray leading-relaxed">{p.introBody}</p>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-beto-offwhite py-20 lg:py-28">
        <div className="container-beto">
          <AnimatedSection className="mb-12">
            <p className="text-label text-beto-gold mb-3">{p.makeLabel}</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {p.make.map((item, i) => (
              <AnimatedSection key={item.href} delay={i * 0.06}>
                <div className="w-6 h-[1px] bg-beto-gold mb-4" />
                <h3 className="font-display text-beto-black text-xl font-normal mb-2">{item.title}</h3>
                <p className="text-sm text-beto-gray leading-relaxed mb-4">{item.body}</p>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-sm text-beto-black hover:text-beto-gold transition-colors"
                >
                  {item.cta}
                  <ArrowRight size={14} />
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-beto-white py-20 lg:py-28">
        <div className="container-beto">
          <AnimatedSection className="mb-12">
            <p className="text-label text-beto-gold mb-3">{p.processLabel}</p>
            <h2 className="font-display text-beto-black text-2xl lg:text-3xl font-light">{p.processHeading}</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {p.process.map((step, i) => (
              <AnimatedSection key={step.n} delay={i * 0.05}>
                <span className="font-display text-3xl text-beto-gray-subtle font-light">{step.n}</span>
                <h3 className="font-display text-beto-black text-lg font-normal mt-2 mb-2">{step.t}</h3>
                <p className="text-sm text-beto-gray leading-relaxed">{step.b}</p>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection className="mt-10">
            <Link
              href="/custom-jewelry"
              className="inline-flex items-center gap-1.5 text-sm text-beto-black hover:text-beto-gold transition-colors"
            >
              {p.seeFullProcess}
              <ArrowRight size={14} />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-beto-offwhite py-20 lg:py-28">
        <div className="container-beto">
          <AnimatedSection className="mb-12">
            <p className="text-label text-beto-gold mb-3">{p.whyLabel}</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
            {p.why.map((row, i) => (
              <AnimatedSection key={row.title} delay={i * 0.05}>
                <div className="border-t border-beto-gray-subtle/40 pt-4">
                  <h3 className="font-display text-beto-black text-base font-normal mb-1">{row.title}</h3>
                  <p className="text-sm text-beto-gray leading-relaxed">{row.body}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-beto-white py-20 lg:py-28">
        <div className="container-beto max-w-3xl">
          <AnimatedSection className="mb-10">
            <p className="text-label text-beto-gold mb-3">{p.faqLabel}</p>
          </AnimatedSection>
          <div className="flex flex-col">
            {p.faq.map((item, i) => (
              <AnimatedSection key={item.q} delay={i * 0.05}>
                <div className="border-b border-beto-gray-subtle/40 py-5">
                  <h3 className="font-display text-beto-black text-lg font-normal mb-2 leading-snug">{item.q}</h3>
                  <p className="text-sm text-beto-gray leading-relaxed">{item.a}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {related.length > 0 && (
            <AnimatedSection className="mt-14">
              <p className="text-label text-beto-gold mb-5">{p.relatedLabel}</p>
              <ul className="flex flex-col gap-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/blog/${r.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm text-beto-gray hover:text-beto-black transition-colors"
                    >
                      <ArrowRight size={13} className="text-beto-gold" />
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          )}

          <AnimatedSection className="mt-14 pt-12 border-t border-beto-gray-subtle/40 flex flex-col sm:flex-row gap-4">
            <Button href="/design-your-jewelry/consultation" variant="primary" size="lg">
              {p.cta}
            </Button>
            <Button href="/design-your-jewelry/custom-design" variant="secondary" size="lg">
              {p.ctaSecondary}
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
