"use client";

import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";

export default function AboutContent() {
  const tr = useTranslation();
  const p = tr.pages.about;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        titleItalic={p.titleItalic}
        subtitle={p.subtitle}
      />

      <section className="py-20 lg:py-28 bg-beto-white">
        <div className="container-beto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <AnimatedSection>
              <div
                className="relative aspect-[4/5]"
                style={{
                  maskImage: "radial-gradient(ellipse 88% 88% at center, black 68%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(ellipse 88% 88% at center, black 68%, transparent 100%)",
                }}
              >
                <Image
                  src="/about/jeweler-workbench.png"
                  alt={p.photoCreditPlaceholder}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1} className="lg:pt-8">
              <p className="text-label text-beto-gold mb-5">{p.storyLabel}</p>
              <h2 className="font-display text-beto-black text-3xl lg:text-4xl font-light mb-6 leading-tight">
                {p.storyHeadline}
                <br />
                <span className="italic">{p.storyHeadlineItalic}</span>
              </h2>
              <div className="flex flex-col gap-4 text-sm text-beto-gray leading-relaxed">
                {p.storyParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-3 gap-6 py-8 border-t border-b border-beto-gray-subtle/30">
                {p.stats.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-beto-black text-2xl font-light">{s.value}</p>
                    <p className="text-xs text-beto-gray-light tracking-widest uppercase mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-4">
                <Button href="/design-your-jewelry/consultation" variant="primary">
                  {p.bookConsultation}
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-beto-offwhite">
        <div className="container-beto">
          <AnimatedSection className="mb-14">
            <p className="text-label text-beto-gold mb-3">{p.valuesLabel}</p>
            <h2 className="font-display text-beto-black text-3xl lg:text-4xl font-light">
              {p.valuesHeadline}
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {p.values.map((v, i) => (
              <AnimatedSection key={v.title} delay={i * 0.08}>
                <div className="flex gap-6">
                  <div className="w-px bg-beto-gold flex-shrink-0" style={{ minHeight: "3rem" }} />
                  <div>
                    <h3 className="font-display text-beto-black text-xl font-normal mb-2">{v.title}</h3>
                    <p className="text-sm text-beto-gray leading-relaxed">{v.body}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-beto-black text-center">
        <div className="container-beto max-w-xl mx-auto">
          <AnimatedSection>
            <p className="text-label text-beto-gold mb-4">{p.ctaLabel}</p>
            <h2 className="font-display text-white text-3xl lg:text-4xl font-light mb-6">
              {p.ctaHeadline}
              <br />
              <span className="italic">{p.ctaHeadlineItalic}</span>
            </h2>
            <p className="text-white/50 text-sm mb-10">{p.ctaSub}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/design-your-jewelry/custom-design" variant="gold">
                {p.startDesign}
              </Button>
              <Button href="/design-your-jewelry/consultation" variant="ghost">
                {p.bookConsultationCta}
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
