"use client";

import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/hooks/useTranslation";

const pathStyles = [
  { style: "bg-beto-gold text-beto-black", ctaStyle: "bg-beto-black text-beto-white hover:bg-beto-black/80", highlight: true },
  { style: "bg-beto-offwhite text-beto-black", ctaStyle: "bg-beto-black text-beto-white hover:bg-beto-gold hover:border-beto-gold", highlight: false },
  { style: "bg-beto-offwhite text-beto-black", ctaStyle: "bg-beto-black text-beto-white hover:bg-beto-gold hover:border-beto-gold", highlight: false },
];

export default function DesignJourney() {
  const tr = useTranslation();

  return (
    <section className="py-24 lg:py-32 bg-beto-offwhite">
      <div className="container-beto">
        <AnimatedSection className="mb-16 max-w-xl">
          <p className="text-label text-beto-gold mb-4">{tr.designJourney.eyebrow}</p>
          <h2
            className="font-display text-beto-black"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 300 }}
          >
            {tr.designJourney.headline}
            <br />
            <span className="italic">{tr.designJourney.headlineItalic}</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {tr.designJourney.paths.map((path, i) => {
            const s = pathStyles[i];
            return (
              <AnimatedSection key={path.href} delay={i * 0.1}>
                <div className={`h-full flex flex-col p-10 ${s.style} ${s.highlight ? "shadow-[0_20px_60px_rgba(201,168,106,0.2)]" : ""}`}>
                  <p className={`text-label mb-6 ${s.highlight ? "text-beto-black/60" : "text-beto-gold"}`}>
                    {path.label}
                  </p>
                  <h3
                    className="font-display mb-4 leading-tight"
                    style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)", fontWeight: 300 }}
                  >
                    {path.title}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-10 flex-1 ${s.highlight ? "text-beto-black/70" : "text-beto-gray"}`}>
                    {path.body}
                  </p>
                  <Link
                    href={path.href}
                    className={`inline-flex items-center justify-center px-6 py-3.5 text-xs font-medium uppercase tracking-widest transition-all duration-300 border ${s.ctaStyle} border-beto-black`}
                  >
                    {path.cta}
                  </Link>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
