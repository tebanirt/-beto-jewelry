"use client";

import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";

export default function CustomJewelryContent() {
  const tr = useTranslation();
  const p = tr.pages.customJewelry;

  return (
    <>
      <div className="relative">
        <PageHero
          eyebrow={p.eyebrow}
          title={p.title}
          titleItalic={p.titleItalic}
          subtitle={p.subtitle}
        />
        <div className="hidden lg:block absolute top-0 right-0 w-1/2 h-full">
          <div className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-[980/1024]">
            <Image
              src="/custom-jewelry/cad-to-reality-white.png"
              alt={p.cadToRealityCaption}
              fill
              unoptimized
              className="object-contain"
              sizes="500px"
            />
          </div>
        </div>
      </div>

      <section className="bg-beto-white py-20 lg:py-28">
        <div className="container-beto">
          <AnimatedSection className="mb-14">
            <p className="text-label text-beto-gold mb-3">{p.processLabel}</p>
            <h2 className="font-display text-beto-black text-3xl lg:text-4xl font-light">
              {p.processHeadline}
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {p.steps.map((step, i) => (
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

          <AnimatedSection className="mt-16 pt-12 border-t border-beto-gray-subtle/40 flex flex-col sm:flex-row gap-4">
            <Button href="/design-your-jewelry/custom-design" variant="primary" size="lg">
              {p.startDesign}
            </Button>
            <Button href="/design-your-jewelry/consultation" variant="secondary" size="lg">
              {p.bookConsultation}
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
