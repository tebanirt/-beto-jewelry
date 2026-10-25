"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import Magnetic from "@/components/ui/Magnetic";
import { useTranslation } from "@/hooks/useTranslation";

export default function Process() {
  const tr = useTranslation();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>(() =>
    new Array(tr.process.steps.length).fill(false)
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const items = Array.from(
      container.querySelectorAll<HTMLElement>("[data-step-index]")
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.stepIndex);
            setRevealed((prev) => {
              if (prev[idx]) return prev;
              const next = [...prev];
              next[idx] = true;
              return next;
            });
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -10% 0px" }
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [tr.process.steps.length]);

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

        <div ref={containerRef} className="max-w-3xl">
          {tr.process.steps.map((item, i) => {
            const isRevealed = revealed[i] ?? false;
            const nextRevealed = revealed[i + 1] ?? false;
            const isLast = i === tr.process.steps.length - 1;
            const isExpanded = expanded === i;

            return (
              <div key={item.step} data-step-index={i} className="flex gap-7">
                <div className="flex flex-col items-center w-7 flex-shrink-0">
                  <span
                    className="w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors duration-500"
                    style={{
                      borderColor: isRevealed ? "#C9A86A" : "rgba(255,255,255,0.25)",
                      backgroundColor: isRevealed ? "#C9A86A" : "#111111",
                    }}
                  />
                  {!isLast && (
                    <span
                      className="flex-grow w-px mt-1 min-h-[40px] transition-colors duration-700"
                      style={{
                        backgroundColor: nextRevealed
                          ? "#C9A86A"
                          : "rgba(255,255,255,0.14)",
                      }}
                    />
                  )}
                </div>

                <div className={isLast ? "flex-grow pb-2" : "flex-grow pb-12"}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : i)}
                    aria-expanded={isExpanded}
                    aria-controls={`process-step-detail-${i}`}
                    className="flex items-start gap-4 w-full text-left"
                  >
                    <span className="font-display text-xs text-white/25 pt-1">
                      {item.step}
                    </span>
                    <span className="flex-grow">
                      <span className="flex items-center gap-3 flex-wrap">
                        <span className="font-display text-white text-xl font-normal">
                          {item.title}
                        </span>
                        <span className="text-[10.5px] tracking-wider uppercase text-beto-gold border border-beto-gold/40 rounded-full px-3 py-1">
                          {item.duration}
                        </span>
                      </span>
                      <span className="block text-sm text-white/50 leading-relaxed mt-2.5 max-w-lg">
                        {item.body}
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-white/40 flex-shrink-0 mt-2 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        id={`process-step-detail-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pt-4 pl-9 text-sm text-white/40 leading-relaxed max-w-lg">
                          {item.detail}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        <AnimatedSection className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Magnetic>
            <Button href="/design-your-jewelry/custom-design" variant="gold" size="lg">
              {tr.process.cta1}
            </Button>
          </Magnetic>
          <Magnetic>
            <Button
              href="/design-your-jewelry/consultation"
              variant="ghost"
              size="lg"
              className="text-white border-white/30 hover:border-white hover:text-white hover:bg-white/5"
            >
              {tr.process.cta2}
            </Button>
          </Magnetic>
        </AnimatedSection>
      </div>
    </section>
  );
}
