"use client";

import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";

const RING_IMAGES = [
  "/rings/ring-solitaire-rose-gold.jpg",   // Solitaire
  "/rings/ring-cushion-pave.jpg",          // Pavé
  "/rings/ring-halo-cushion.jpg",          // Halo
  "/rings/ring-three-stone-oval.jpg",      // Three-Stone
  "/rings/ring-toi-et-moi.jpg",           // Toi et Moi
  "/rings/ring-oval-hidden-halo.jpg",      // Hidden Halo
  "/rings/ring-toi-et-moi-2.jpg",         // Vintage
  "/rings/ring-marquise.jpg",             // Tension Set
  "/rings/ring-emerald-solitaire.jpg",    // Emerald Cut
  "/rings/ring-oval-accent.jpg",          // Floating Accents
  "/rings/ring-cushion-solitaire.jpg",    // Cushion Solitaire
];

const STYLE_SLUGS = [
  "solitaire",
  "pave",
  "halo",
  "trois-pierres",
  "toi-et-moi",
  "halo-cache",
  "vintage",
  "serti-tension",
  "taille-emeraude",
  "accents-flottants",
  "coussin-solitaire",
];

export default function EngagementRingsContent() {
  const tr = useTranslation();
  const p = tr.pages.engagementRings;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        titleItalic={p.titleItalic}
        subtitle={p.subtitle}
      />

      <section className="border-b border-beto-gray-subtle/40 bg-beto-white sticky top-[80px] z-30">
        <div className="container-beto py-4 flex items-center gap-2">
          <button className="flex-shrink-0 px-5 py-2 text-xs font-medium tracking-wider uppercase border border-beto-black bg-beto-black text-white transition-colors">
            {p.filters[0]}
          </button>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-beto-white">
        <div className="container-beto">
          <AnimatedSection className="mb-12">
            <p className="text-label text-beto-gold mb-3">{p.ourStyles}</p>
            <h2 className="font-display text-beto-black text-3xl lg:text-4xl font-light">
              {p.findDirection}
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-beto-gray-subtle/20">
            {p.styles.map((style, i) => (
              <AnimatedSection key={style.name} delay={i * 0.06}>
                <Link href={`/engagement-rings/${STYLE_SLUGS[i]}`} className="group bg-beto-white hover:bg-beto-offwhite transition-colors duration-300 flex flex-col">
                  <div className="w-full aspect-square relative overflow-hidden bg-beto-offwhite">
                    <Image
                      src={RING_IMAGES[i] ?? ""}
                      alt={style.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="font-display text-beto-black text-xl font-normal mb-1 group-hover:text-beto-gold transition-colors">
                      {style.name}
                    </h3>
                    <p className="text-sm text-beto-gray">{style.desc}</p>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-24 mb-12 pt-16 border-t border-beto-gray-subtle/40">
            <p className="text-label text-beto-gold mb-3">{p.shapesLabel}</p>
            <h2 className="font-display text-beto-black text-3xl lg:text-4xl font-light">
              {p.shapesTitle}
            </h2>
          </AnimatedSection>

          <AnimatedSection>
            <div className="w-full relative bg-beto-offwhite border border-beto-gray-subtle/40">
              <Image
                src="/stones/diamond-shapes-chart.jpg"
                alt={p.shapesTitle}
                width={1000}
                height={580}
                className="w-full h-auto"
              />
            </div>
            <p className="text-sm text-beto-gray text-center mt-6 max-w-xl mx-auto leading-relaxed">
              {p.shapesCustomNote}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-beto-black py-24 lg:py-32">
        <div className="container-beto text-center max-w-2xl mx-auto">
          <p className="text-label text-beto-gold mb-4">{p.readyLabel}</p>
          <h2 className="font-display text-white text-5xl lg:text-7xl font-light mb-6 leading-tight">
            {p.readyHeadline}
          </h2>
          <p className="text-white/60 text-base mb-10 max-w-lg mx-auto leading-relaxed">
            {p.readyBody}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/design-your-jewelry/custom-design" variant="gold" size="lg">
              {p.startDesign}
            </Button>
            <Button href="/design-your-jewelry/consultation" variant="secondary" size="lg" className="!text-white !border-white hover:!bg-white hover:!text-beto-black">
              {p.bookConsultation}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
