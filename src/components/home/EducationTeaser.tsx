"use client";

import Link from "next/link";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/hooks/useTranslation";

export default function EducationTeaser() {
  const tr = useTranslation();

  return (
    <section className="py-24 lg:py-32 bg-beto-white">
      <div className="container-beto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <AnimatedSection className="lg:col-span-4">
            <p className="text-label text-beto-gold mb-4">{tr.educationTeaser.eyebrow}</p>
            <h2
              className="font-display text-beto-black mb-6"
              style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 300 }}
            >
              {tr.educationTeaser.headline}
              <br />
              <span className="italic">{tr.educationTeaser.headlineItalic}</span>
            </h2>
            <p className="text-sm text-beto-gray leading-relaxed mb-8">
              {tr.educationTeaser.sub}
            </p>
            <Link
              href="/education"
              className="inline-flex items-center gap-3 text-xs font-medium tracking-widest uppercase text-beto-gold hover:gap-5 transition-all duration-300"
            >
              {tr.educationTeaser.cta}
              <span>→</span>
            </Link>
          </AnimatedSection>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tr.educationTeaser.topics.map((topic, i) => (
              <AnimatedSection key={topic.href} delay={i * 0.07}>
                <Link href={topic.href} className="group block p-8 border border-beto-gray-subtle/40 hover:border-beto-gold/40 transition-colors duration-300 h-full">
                  <span className="inline-block text-label text-beto-gold mb-4">{topic.tag}</span>
                  <h3 className="font-display text-beto-black text-xl font-normal mb-3 group-hover:text-beto-gold transition-colors duration-200">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-beto-gray leading-relaxed">{topic.body}</p>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
