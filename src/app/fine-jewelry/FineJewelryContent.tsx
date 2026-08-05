"use client";

import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { useStore } from "@/store/useStore";

const JEWELRY_ITEMS = [
  { src: "/jewelry/earrings-hoops.jpg",         nameEn: "Diamond Hoops",          nameFr: "Créoles diamants" },
  { src: "/jewelry/earrings-pave-huggies.jpg",  nameEn: "Pavé Huggies",           nameFr: "Huggies pavé" },
  { src: "/jewelry/earrings-crawler.jpg",        nameEn: "Ear Crawler",            nameFr: "Grimpeurs d'oreille" },
  { src: "/jewelry/pendant-bee.jpg",             nameEn: "Bee Charm",              nameFr: "Charm abeille" },
  { src: "/jewelry/band-eternity-yellow.jpg",    nameEn: "Eternity Band",          nameFr: "Alliance éternité" },
  { src: "/jewelry/necklace-circle.jpg",         nameEn: "Circle Necklace",        nameFr: "Collier cercle" },
  { src: "/jewelry/pendant-initial-b.jpg",       nameEn: "Initial Pendant",        nameFr: "Pendentif initiale" },
  { src: "/jewelry/band-eternity-white.jpg",     nameEn: "Emerald Eternity Band",  nameFr: "Alliance émeraude" },
  { src: "/jewelry/band-mixed-cut.jpg",          nameEn: "Mixed Cut Band",         nameFr: "Alliance multi-taille" },
  { src: "/jewelry/ring-stacking.jpg",           nameEn: "Stacking Set",           nameFr: "Set superposable" },
];

export default function FineJewelryContent() {
  const tr = useTranslation();
  const p = tr.pages.fineJewelry;
  const language = useStore((s) => s.language);

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
          <div className="flex flex-wrap gap-3 mb-14">
            {p.categories.map((cat) => {
              const styleHrefMap: Record<string, string> = {
                "#pendants": "/fine-jewelry/pendentifs",
                "#earrings": "/fine-jewelry/boucles-oreilles",
                "#bracelets": "/fine-jewelry/bracelets",
              };
              const href = styleHrefMap[cat.href] ?? cat.href;
              return (
                <a
                  key={cat.href}
                  href={href}
                  className="px-5 py-2 text-xs font-medium tracking-wider uppercase border border-beto-gray-subtle/60 text-beto-gray hover:border-beto-gold hover:text-beto-gold transition-colors"
                >
                  {cat.name}
                </a>
              );
            })}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-beto-gray-subtle/20">
            {JEWELRY_ITEMS.map((item, i) => (
              <AnimatedSection key={item.src} delay={i * 0.04}>
                <div className="group bg-beto-white hover:bg-beto-offwhite transition-colors duration-300 cursor-pointer">
                  <div className="aspect-square relative overflow-hidden bg-beto-offwhite">
                    <Image
                      src={item.src}
                      alt={item.nameEn}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-medium text-beto-black group-hover:text-beto-gold transition-colors">
                      {language === "fr" ? item.nameFr : item.nameEn}
                    </p>
                    <p className="text-xs text-beto-gray-light mt-1">{p.fromPrice}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-14 text-center">
            <p className="text-sm text-beto-gray mb-6">{p.noSeeNote}</p>
            <Button href="/design-your-jewelry/custom-design" variant="primary" size="lg">
              {p.startCustomPiece}
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
