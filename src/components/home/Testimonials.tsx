"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const tr = useTranslation();
  const items = tr.testimonials.items;

  const navigate = (dir: 1 | -1) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + items.length) % items.length);
  };

  return (
    <section className="py-24 lg:py-32 bg-beto-white overflow-hidden">
      <div className="container-beto">
        <AnimatedSection className="mb-16">
          <p className="text-label text-beto-gold mb-4">{tr.testimonials.eyebrow}</p>
          <h2
            className="font-display text-beto-black"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 300 }}
          >
            {tr.testimonials.headline}
            <br />
            <span className="italic">{tr.testimonials.headlineItalic}</span>
          </h2>
        </AnimatedSection>

        <div className="relative max-w-3xl">
          <div className="flex items-center gap-1 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-beto-gold text-sm">★</span>
            ))}
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -40 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            >
              <blockquote
                className="font-display text-beto-black mb-8 leading-relaxed"
                style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", fontWeight: 300 }}
              >
                &ldquo;{items[index].quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-8 h-[1px] bg-beto-gold" />
                <div>
                  <p className="text-sm font-medium text-beto-black">{items[index].author}</p>
                  <p className="text-xs text-beto-gray-light mt-0.5">{items[index].detail}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-4 mt-10">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 border border-beto-gray-subtle flex items-center justify-center text-beto-gray hover:border-beto-gold hover:text-beto-gold transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => navigate(1)}
              className="w-10 h-10 border border-beto-gray-subtle flex items-center justify-center text-beto-gray hover:border-beto-gold hover:text-beto-gold transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={16} />
            </button>

            <div className="flex items-center gap-2 ml-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
                  className={`h-[2px] transition-all duration-300 ${
                    i === index ? "bg-beto-gold w-6" : "bg-beto-gray-subtle w-2"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
