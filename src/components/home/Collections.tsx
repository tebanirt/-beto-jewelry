"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/hooks/useTranslation";

export default function Collections() {
  const tr = useTranslation();

  return (
    <section id="collections" className="py-24 lg:py-32 bg-beto-white">
      <div className="container-beto">
        {/* Header */}
        <AnimatedSection className="mb-16 max-w-xl">
          <p className="text-label text-beto-gold mb-4">{tr.collections.eyebrow}</p>
          <h2 className="font-display text-beto-black" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 300 }}>
            {tr.collections.headline}
            <br />
            <span className="italic">{tr.collections.headlineItalic}</span>
          </h2>
        </AnimatedSection>

        {/* Collection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-beto-gray-subtle/30">
          {tr.collections.items.map((item, i) => (
            <AnimatedSection key={item.href} delay={i * 0.08}>
              <Link
                href={item.href}
                className="group relative block bg-beto-white p-10 lg:p-14 hover:bg-beto-offwhite transition-colors duration-300 overflow-hidden"
              >
                {/* Background number */}
                <span
                  className="absolute top-6 right-8 font-display text-8xl font-light text-beto-gray-subtle/40 leading-none select-none transition-transform duration-500 group-hover:translate-x-2"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Content */}
                <div className="relative">
                  <p className="text-label text-beto-gold mb-3">{item.subtitle}</p>
                  <h3
                    className="font-display text-beto-black mb-4 group-hover:text-beto-black transition-colors"
                    style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 300 }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-beto-gray leading-relaxed max-w-sm mb-8">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium tracking-widest uppercase text-beto-gold">
                      {tr.collections.explore}
                    </span>
                    <motion.span
                      className="inline-block text-beto-gold"
                      initial={{ x: 0 }}
                      whileHover={{ x: 6 }}
                    >
                      →
                    </motion.span>
                  </div>
                </div>

                {/* Bottom gold line reveal */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-beto-gold w-0 group-hover:w-full transition-all duration-500" />
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
