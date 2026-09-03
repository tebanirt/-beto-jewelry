"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-beto-gray-subtle/40">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 text-left gap-6"
      >
        <span className="font-display text-beto-black text-lg font-normal leading-snug">{question}</span>
        <span className="flex-shrink-0 text-beto-gold">
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm text-beto-gray leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQContent() {
  const tr = useTranslation();
  const p = tr.pages.faq;

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
        <div className="container-beto max-w-3xl mx-auto">
          <div className="flex flex-col gap-14">
            {p.sections.map((section, i) => (
              <AnimatedSection key={section.category} delay={i * 0.06}>
                <p className="text-label text-beto-gold mb-6">{section.category}</p>
                <div>
                  {section.items.map((item) => (
                    <FAQItem key={item.q} question={item.q} answer={item.a} />
                  ))}
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-16 pt-12 border-t border-beto-gray-subtle/40 text-center">
            <p className="font-display text-beto-black text-2xl font-light mb-3">{p.stillHaveQuestions}</p>
            <p className="text-sm text-beto-gray mb-8">{p.stillHaveQuestionsBody}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button href="/contact" variant="primary">{p.contactUs}</Button>
              <Button href="/design-your-jewelry/consultation" variant="secondary">{p.bookConsultation}</Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
