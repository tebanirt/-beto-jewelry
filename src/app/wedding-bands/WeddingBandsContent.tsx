"use client";

import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";

const BAND_IMAGES = [
  "/bands/band-women.webp",         // Women's Bands
  "/bands/band-men.png",            // Men's Bands
  "/bands/band-matching-set.png",   // Matching Sets
  "/bands/band-diamond.webp",       // Diamond Bands
  "/bands/band-classic.webp",       // Custom Bands
];

const BAND_SLUGS: (string | null)[] = [
  null,                  // Women's Bands
  "alliances-homme",     // Men's Bands
  "alliances-assorties", // Matching Sets
  "alliances-diamant",   // Diamond Bands
  null,                  // Custom Bands
];

export default function WeddingBandsContent() {
  const tr = useTranslation();
  const p = tr.pages.weddingBands;

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-beto-gray-subtle/20">
            {p.categories.map((cat, i) => {
              const slug = BAND_SLUGS[i];
              const cardContent = (
                <>
                  <div className="w-full aspect-square relative overflow-hidden bg-beto-offwhite mb-6">
                    <Image
                      src={BAND_IMAGES[i] ?? ""}
                      alt={cat.name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <h3 className="font-display text-beto-black text-xl font-normal mb-2 group-hover:text-beto-gold transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-beto-gray">{cat.desc}</p>
                </>
              );
              const cardClass = "group bg-beto-white p-10 hover:bg-beto-offwhite transition-colors duration-300 cursor-pointer";
              return (
                <AnimatedSection key={cat.name} delay={i * 0.07}>
                  {slug ? (
                    <Link href={`/wedding-bands/${slug}`} className={cardClass}>
                      {cardContent}
                    </Link>
                  ) : (
                    <div className={cardClass}>{cardContent}</div>
                  )}
                </AnimatedSection>
              );
            })}
          </div>

          <AnimatedSection className="mt-16 text-center">
            <Button href="/design-your-jewelry/custom-design" variant="primary" size="lg">
              {p.startCustomBand}
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
