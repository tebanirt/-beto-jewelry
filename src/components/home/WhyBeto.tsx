"use client";

import AnimatedSection from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/hooks/useTranslation";

export default function WhyBeto() {
  const tr = useTranslation();

  return (
    <section className="py-24 lg:py-32 bg-beto-offwhite">
      <div className="container-beto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Left: Heading */}
          <AnimatedSection className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
            <p className="text-label text-beto-gold mb-4">{tr.why.eyebrow}</p>
            <h2
              className="font-display text-beto-black mb-6"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 300 }}
            >
              {tr.why.headline}
              <br />
              <span className="italic">{tr.why.headlineItalic}</span>
            </h2>
            <div className="w-10 h-[1px] bg-beto-gold mb-6" />
            <p className="text-sm text-beto-gray leading-relaxed">{tr.why.sub}</p>
          </AnimatedSection>

          {/* Right: Grid of differentiators */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {tr.why.items.map((item, i) => (
              <AnimatedSection key={item.number} delay={i * 0.06}>
                <div className="group">
                  <p className="text-label text-beto-gold/60 mb-3">{item.number}</p>
                  <h3 className="font-display text-beto-black text-xl font-normal mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-beto-gray leading-relaxed">{item.body}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
