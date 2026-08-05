"use client";

import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/hooks/useTranslation";

export default function QuoteContent() {
  const tr = useTranslation();
  const p = tr.pages.quote;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        titleItalic={p.titleItalic}
        subtitle={p.subtitle}
      />

      <section className="py-20 lg:py-28 bg-beto-white">
        <div className="container-beto max-w-2xl mx-auto">
          <AnimatedSection>
            <div className="flex flex-col gap-5">
              {[
                { key: "name", label: p.fullName, type: "text", placeholder: p.fullNamePlaceholder },
                { key: "email", label: p.emailAddress, type: "email", placeholder: p.emailPlaceholder },
                { key: "phone", label: p.phoneNumber, type: "tel", placeholder: p.phonePlaceholder },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} className="w-full px-5 py-4 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
                </div>
              ))}

              <div>
                <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{p.projectType}</label>
                <select className="w-full px-5 py-4 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black focus:outline-none focus:border-beto-gold transition-colors appearance-none">
                  <option value="">{p.projectTypePlaceholder}</option>
                  {p.projectTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{p.budget}</label>
                <select className="w-full px-5 py-4 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black focus:outline-none focus:border-beto-gold transition-colors appearance-none">
                  <option value="">{p.budgetPlaceholder}</option>
                  {p.budgetOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{p.describeProject}</label>
                <textarea rows={6} placeholder={p.describeProjectPlaceholder} className="w-full px-5 py-4 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors resize-none" />
              </div>

              <button className="w-full py-4 bg-beto-black text-white text-xs font-medium uppercase tracking-widest hover:bg-beto-gold transition-colors duration-300">
                {p.submitButton}
              </button>

              <p className="text-xs text-beto-gray-light text-center leading-relaxed">
                {p.responseNote}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
