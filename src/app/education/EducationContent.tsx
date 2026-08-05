"use client";

import Image from "next/image";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/hooks/useTranslation";

export default function EducationContent() {
  const tr = useTranslation();
  const p = tr.pages.education;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        titleItalic={p.titleItalic}
        subtitle={p.subtitle}
        centered
      />

      <section className="py-20 lg:py-28 bg-beto-white">
        <div className="container-beto max-w-3xl mx-auto flex flex-col gap-20">
          {p.topics.map((topic, i) => (
            <AnimatedSection key={topic.id} delay={i * 0.05}>
              <div id={topic.id}>
                <p className="text-label text-beto-gold mb-3">{topic.tag}</p>
                <h2 className="font-display text-beto-black text-3xl lg:text-4xl font-light mb-4">{topic.title}</h2>
                <p className="text-base text-beto-gray leading-relaxed mb-10 border-l-2 border-beto-gold pl-5">{topic.intro}</p>
                {topic.id === "diamonds" && (
                  <div
                    className="relative w-full aspect-[2592/1620] mb-10 -mt-2"
                    style={{
                      maskImage: "radial-gradient(ellipse 90% 90% at center, black 72%, transparent 100%)",
                      WebkitMaskImage: "radial-gradient(ellipse 90% 90% at center, black 72%, transparent 100%)",
                    }}
                  >
                    <Image
                      src="/education/four-cs.png"
                      alt={topic.title}
                      fill
                      unoptimized
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-8">
                  {topic.sections.map((s) => (
                    <div key={s.heading}>
                      <h3 className="font-display text-beto-black text-xl font-normal mb-2">{s.heading}</h3>
                      <p className="text-sm text-beto-gray leading-relaxed">{s.body}</p>
                    </div>
                  ))}
                </div>
                {topic.id === "lab-grown" && (
                  <div className="mt-10 pt-10 border-t border-beto-gray-subtle/30 flex flex-col items-center">
                    <p className="text-xs text-beto-gray-light tracking-widest uppercase mb-6">
                      {p.certifiedBy}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
                      <div className="relative h-10 w-40">
                        <Image
                          src="/education/gia-logo.png"
                          alt="GIA — Gemological Institute of America"
                          fill
                          unoptimized
                          className="object-contain"
                          sizes="160px"
                        />
                      </div>
                      <div className="relative h-10 w-28">
                        <Image
                          src="/education/igi-logo.png"
                          alt="IGI — International Gemological Institute"
                          fill
                          unoptimized
                          className="object-contain"
                          sizes="112px"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-8 pt-8 border-t border-beto-gray-subtle/40" />
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </>
  );
}
