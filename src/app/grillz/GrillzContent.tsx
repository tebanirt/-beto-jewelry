"use client";

import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";

const GRILLZ_IMAGES = [
  "/grillz/open-face.png",                   // Open Face
  "/grillz/custom-design.png",               // Custom Design
  "/grillz/mosaic.png",                      // Mosaic
  "/grillz/full-iced-out-big-pointers.png",  // Full Iced Out Big Pointers
  "/grillz/full-ice-out.png",                // Full Ice Out
  "/grillz/ten-on-ten.png",                  // 10 On 10
  "/grillz/opal-inlay.png",                  // Opal Inlay
  "/grillz/single-tooth.png",                // Single Tooth
  "/grillz/single-tooth-pave.png",           // Single Tooth Pavé
];

const GRILLZ_SLUGS: (string | null)[] = [
  null,           // Open Face
  null,           // Custom Design
  null,           // Mosaic
  null,           // Full Iced Out Big Pointers
  "full-ice-out", // Full Ice Out
  null,           // 10 On 10
  null,           // Opal Inlay
  "single-tooth", // Single Tooth
  null,           // Single Tooth Pavé
];

export default function GrillzContent() {
  const tr = useTranslation();
  const p = tr.pages.grillz;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        titleItalic={p.titleItalic}
        subtitle={p.subtitle}
      />

      {/* Styles Grid */}
      <section className="py-20 lg:py-28 bg-beto-white">
        <div className="container-beto">
          <AnimatedSection className="mb-12">
            <p className="text-label text-beto-gold mb-3">{p.stylesLabel}</p>
            <h2 className="font-display text-beto-black text-3xl lg:text-4xl font-light">
              {p.findDirection}
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-beto-gray-subtle/20">
            {p.styles.map((style, i) => {
              const slug = GRILLZ_SLUGS[i];
              const cardContent = (
                <>
                  <div className="w-full aspect-square relative overflow-hidden bg-beto-offwhite mb-6 flex items-center justify-center">
                    {GRILLZ_IMAGES[i] ? (
                      <Image
                        src={GRILLZ_IMAGES[i]}
                        alt={style.name}
                        fill
                        unoptimized
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <span className="text-beto-gray-subtle/60 text-xs tracking-widest uppercase">
                        {p.photographyPlaceholder}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-beto-black text-xl font-normal mb-1 group-hover:text-beto-gold transition-colors">
                      {style.name}
                    </h3>
                    <p className="text-sm text-beto-gray">{style.desc}</p>
                  </div>
                </>
              );
              const cardClass = "group bg-beto-white p-10 hover:bg-beto-offwhite transition-colors duration-300 cursor-pointer min-h-[240px] flex flex-col justify-between";
              return (
                <AnimatedSection key={style.name} delay={i * 0.06}>
                  {slug ? (
                    <Link href={`/grillz/${slug}`} className={cardClass}>
                      {cardContent}
                    </Link>
                  ) : (
                    <div className={cardClass}>{cardContent}</div>
                  )}
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 lg:py-28 bg-beto-offwhite">
        <div className="container-beto">
          <AnimatedSection className="mb-4">
            <p className="text-label text-beto-gold mb-3">{p.processLabel}</p>
          </AnimatedSection>
          <AnimatedSection className="mb-14 max-w-2xl">
            <p className="text-base text-beto-gray leading-relaxed border-l-2 border-beto-gold pl-5">
              {p.processIntro}
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {p.processSteps.map((step, i) => (
              <AnimatedSection key={step.number} delay={i * 0.06}>
                <div className="flex gap-8">
                  <div className="flex-shrink-0">
                    <span className="font-display text-4xl text-beto-gray-subtle font-light">{step.number}</span>
                  </div>
                  <div className="pt-1">
                    <div className="w-6 h-[1px] bg-beto-gold mb-4" />
                    <h3 className="font-display text-beto-black text-xl font-normal mb-2">{step.title}</h3>
                    <p className="text-sm text-beto-gray leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* CTA */}
          <AnimatedSection className="mt-16 pt-12 border-t border-beto-gray-subtle/40 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="max-w-lg">
              <p className="text-label text-beto-gold mb-2">{p.ctaLabel}</p>
              <p className="text-sm text-beto-gray leading-relaxed">{p.ctaBody}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
              <Button href="/design-your-jewelry/custom-design" variant="primary">
                {p.startDesign}
              </Button>
              <Button href="/design-your-jewelry/consultation" variant="secondary">
                {p.bookConsultation}
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
