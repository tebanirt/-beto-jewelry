"use client";

import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/hooks/useTranslation";

export default function PrivacyContent() {
  const tr = useTranslation();
  const p = tr.pages.privacy;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        titleItalic={p.titleItalic}
        subtitle={p.subtitle}
      />

      <section className="py-20 lg:py-28 bg-beto-white">
        <div className="container-beto max-w-3xl mx-auto flex flex-col gap-10">
          {p.sections.map((s) => (
            <AnimatedSection key={s.heading}>
              <h2 className="font-display text-beto-black text-xl font-normal mb-3">{s.heading}</h2>
              <p className="text-sm text-beto-gray leading-relaxed">{s.body}</p>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </>
  );
}
