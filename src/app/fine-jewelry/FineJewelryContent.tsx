"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/ui/Magnetic";
import { useTranslation } from "@/hooks/useTranslation";

const SLIDESHOW_IMAGES = [
  { src: "/blog/pendant-guide-hero.jpg", alt: "A square diamond pendant on a delicate gold chain" },
  { src: "/blog/earrings-guide-hero.jpg", alt: "A pair of gold huggie earrings set with baguette diamonds" },
  { src: "/blog/initial-symbol-pendants-hero.jpg", alt: "Several delicate gold necklaces displayed on white" },
  { src: "/jewelry/bracelet-tennis-diamond.jpg", alt: "A white gold diamond tennis bracelet" },
];

// Matches the real pages under src/lib/style-pages.ts (category: "fine-jewelry"),
// in slug order, so this grid actually links to them — previously this page had
// no on-site link to /fine-jewelry/pendentifs, /boucles-oreilles or /bracelets
// at all, leaving them reachable only by direct URL or crawl.
const STYLE_SLUGS = ["pendentifs", "boucles-oreilles", "bracelets"];
const STYLE_IMAGES = [
  "/jewelry/pendant-bee.jpg",
  "/jewelry/earrings-hoops.jpg",
  "/jewelry/bracelet-tennis-diamond.jpg",
];

export default function FineJewelryContent() {
  const tr = useTranslation();
  const p = tr.pages.fineJewelry;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDESHOW_IMAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section
        className="relative w-full min-h-screen flex items-end overflow-hidden"
        style={{ paddingTop: "var(--nav-height)" }}
      >
        <div className="absolute inset-0 bg-beto-black" aria-hidden="true">
          <AnimatePresence mode="sync">
            <motion.div
              key={SLIDESHOW_IMAGES[index].src}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={SLIDESHOW_IMAGES[index].src}
                alt={SLIDESHOW_IMAGES[index].alt}
                fill
                unoptimized
                priority
                className="object-cover"
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/85" />
        </div>

        <div className="relative z-10 container-beto pb-20 lg:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-2xl"
          >
            <p className="text-label text-beto-gold mb-6">{p.eyebrow}</p>
            <h1
              className="font-display text-white leading-[1.05] mb-6"
              style={{ fontSize: "clamp(2.75rem, 6vw, 5rem)", fontWeight: 300, letterSpacing: "-0.02em" }}
            >
              {p.title}
              <br />
              <span className="italic">{p.titleItalic}</span>
            </h1>
            <p className="text-base text-white/60 leading-relaxed mb-10 max-w-md font-sans">
              {p.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Magnetic>
                <Button href="/design-your-jewelry/custom-design" variant="gold" size="lg">
                  {p.startCustomPiece}
                </Button>
              </Magnetic>
              <Magnetic>
                <Button
                  href="/design-your-jewelry/consultation"
                  variant="secondary"
                  size="lg"
                  className="!text-white !border-white/30 hover:!border-white hover:!bg-white/5"
                >
                  {p.bookConsultation}
                </Button>
              </Magnetic>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-beto-offwhite">
        <div className="container-beto">
          <AnimatedSection className="max-w-xl mb-16 lg:mb-20">
            <p className="text-base text-beto-gray leading-relaxed">{p.heroBody}</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-12 mb-16 lg:mb-20">
            {p.valueProps.map((item, i) => (
              <AnimatedSection key={item.number} delay={i * 0.08}>
                <p className="text-label text-beto-gold/60 mb-3">{item.number}</p>
                <h3 className="font-display text-beto-black text-xl font-normal mb-3 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-beto-gray leading-relaxed">{item.body}</p>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mb-12 pt-16 border-t border-beto-gray-subtle/40">
            <p className="text-label text-beto-gold mb-3">{p.ourStyles}</p>
            <h2 className="font-display text-beto-black text-3xl lg:text-4xl font-light">
              {p.findDirection}
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-beto-gray-subtle/20 mb-16 lg:mb-20">
            {p.styles.map((style, i) => (
              <AnimatedSection key={style.name} delay={i * 0.06}>
                <Link href={`/fine-jewelry/${STYLE_SLUGS[i]}`} className="group bg-beto-white hover:bg-beto-offwhite transition-colors duration-300 flex flex-col">
                  <div className="w-full aspect-square relative overflow-hidden bg-beto-offwhite">
                    <Image
                      src={STYLE_IMAGES[i] ?? ""}
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

          <AnimatedSection delay={0.2} className="pt-12 border-t border-beto-gray-subtle/40 text-center">
            <Magnetic>
              <Button href="/design-your-jewelry/consultation" variant="primary" size="lg">
                {p.bookConsultation}
              </Button>
            </Magnetic>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
