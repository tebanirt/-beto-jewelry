"use client";

import { useState } from "react";
import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

const GALLERY_ITEMS: { src: string; category: number; ratio: string }[] = [
  // 1 = Engagement Rings / Bagues de fiançailles
  { src: "/rings/ring-solitaire-rose-gold.jpg", category: 1, ratio: "3/4" },
  { src: "/rings/ring-cushion-pave.jpg", category: 1, ratio: "1/1" },
  { src: "/rings/ring-halo-cushion.jpg", category: 1, ratio: "4/5" },
  { src: "/rings/ring-three-stone-oval.jpg", category: 1, ratio: "3/4" },
  { src: "/rings/ring-toi-et-moi.jpg", category: 1, ratio: "1/1" },
  { src: "/rings/ring-oval-hidden-halo.jpg", category: 1, ratio: "4/5" },
  { src: "/rings/ring-toi-et-moi-2.jpg", category: 1, ratio: "3/4" },
  { src: "/rings/ring-marquise.jpg", category: 1, ratio: "1/1" },
  { src: "/rings/ring-emerald-solitaire.jpg", category: 1, ratio: "4/5" },
  { src: "/rings/ring-oval-accent.jpg", category: 1, ratio: "3/4" },
  { src: "/rings/ring-cushion-solitaire.jpg", category: 1, ratio: "1/1" },
  // 2 = Wedding Bands / Alliances
  { src: "/bands/band-women.webp", category: 2, ratio: "4/5" },
  { src: "/bands/band-men.png", category: 2, ratio: "1/1" },
  { src: "/bands/band-matching-set.png", category: 2, ratio: "3/4" },
  { src: "/bands/band-diamond.webp", category: 2, ratio: "1/1" },
  { src: "/bands/band-classic.webp", category: 2, ratio: "4/5" },
  // 3 = Custom / Sur mesure
  { src: "/custom-jewelry/cad-to-reality-white.png", category: 3, ratio: "1/1" },
];

export default function GalleryContent() {
  const tr = useTranslation();
  const p = tr.pages.gallery;
  const [active, setActive] = useState(0);

  const items = active === 0 ? GALLERY_ITEMS : GALLERY_ITEMS.filter((item) => item.category === active);

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        titleItalic={p.titleItalic}
        subtitle={p.subtitle}
        centered
      />

      <section className="py-16 lg:py-24 bg-beto-white">
        <div className="container-beto">
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {p.categories.map((cat, i) => (
              <button
                key={cat}
                onClick={() => setActive(i)}
                className={cn(
                  "px-5 py-2 text-xs font-medium tracking-wider uppercase border transition-colors",
                  i === active
                    ? "bg-beto-black text-white border-beto-black"
                    : "border-beto-gray-subtle text-beto-gray hover:border-beto-gold hover:text-beto-gold"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {items.map((item, i) => (
              <AnimatedSection key={item.src} delay={i * 0.04}>
                <div
                  className="group w-full bg-beto-offwhite break-inside-avoid overflow-hidden cursor-pointer relative"
                  style={{ aspectRatio: item.ratio }}
                >
                  <Image
                    src={item.src}
                    alt={p.categories[item.category]}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-beto-black/0 group-hover:bg-beto-black/40 transition-all duration-300 flex items-end p-5">
                    <div className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-beto-gold text-xs tracking-wide mt-0.5">{p.categories[item.category]}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-16 text-center">
            <p className="text-sm text-beto-gray mb-6">{p.inspired}</p>
            <Button href="/design-your-jewelry/custom-design" variant="primary" size="lg">
              {p.cta}
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
