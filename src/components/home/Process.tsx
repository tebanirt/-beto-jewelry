"use client";

import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";

export default function Process() {
  const tr = useTranslation();

  return (
    <section className="py-24 lg:py-32 bg-beto-black">
      <div className="container-beto">
        <AnimatedSection className="mb-16 max-w-2xl">
          <p className="text-label text-beto-gold mb-4">{tr.process.eyebrow}</p>
          <h2
            className="font-display text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 300 }}
          >
            {tr.process.headline}
            <br />
            <span className="italic">{tr.process.headlineItalic}</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-white/10">
          {tr.process.steps.map((item, i) => (
            <AnimatedSection
              key={item.step}
              delay={i * 0.1}
              className={`p-10 border-b border-white/10 lg:border-b-0 ${
                i < tr.process.steps.length - 1 ? "lg:border-r border-white/10" : ""
              }`}
            >
              <div className="mb-8">
                <span className="font-display text-5xl text-white/10 font-light">{item.step}</span>
              </div>
              <div className="w-5 h-[1px] bg-beto-gold mb-6" />
              <h3 className="font-display text-white text-xl font-normal mb-3">{item.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{item.body}</p>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="mt-14 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Button href="/design-your-jewelry/custom-design" variant="gold" size="lg">
            {tr.process.cta1}
          </Button>
          <Button href="/design-your-jewelry/consultation" variant="ghost" size="lg" className="text-white border-white/30 hover:border-white hover:text-white hover:bg-white/5">
            {tr.process.cta2}
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
