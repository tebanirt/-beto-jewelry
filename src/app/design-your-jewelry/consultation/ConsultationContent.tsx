"use client";

import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/hooks/useTranslation";

export default function ConsultationContent() {
  const tr = useTranslation();
  const p = tr.pages.consultation;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        titleItalic={p.titleItalic}
        subtitle={p.subtitle}
      />

      <section className="py-20 lg:py-28 bg-beto-white">
        <div className="container-beto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <AnimatedSection>
              <p className="text-label text-beto-gold mb-6">{p.whatToExpect}</p>
              <div className="flex flex-col gap-8">
                {p.expectations.map((item) => (
                  <div key={item.title} className="flex gap-6">
                    <div className="w-px bg-beto-gold flex-shrink-0 mt-1" style={{ minHeight: "2rem" }} />
                    <div>
                      <h3 className="font-display text-beto-black text-lg font-normal mb-1">{item.title}</h3>
                      <p className="text-sm text-beto-gray leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="bg-beto-offwhite p-10">
                <p className="text-label text-beto-gold mb-6">{p.scheduleSession}</p>
                <div className="flex flex-col gap-4 mb-6">
                  <div>
                    <p className="text-xs font-medium text-beto-black mb-3 tracking-wide">{p.preferredFormat}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {p.formatOptions.map((opt) => (
                        <button key={opt} className="px-4 py-3 border border-beto-gray-subtle text-sm text-beto-gray hover:border-beto-gold hover:text-beto-gold transition-colors text-left">
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-beto-black mb-2 block tracking-wide">{p.fullName}</label>
                    <input type="text" placeholder={p.fullNamePlaceholder} className="w-full px-4 py-3 border border-beto-gray-subtle/60 bg-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-beto-black mb-2 block tracking-wide">{p.emailAddress}</label>
                    <input type="email" placeholder={p.emailPlaceholder} className="w-full px-4 py-3 border border-beto-gray-subtle/60 bg-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-beto-black mb-2 block tracking-wide">{p.phoneNumber}</label>
                    <input type="tel" placeholder={p.phonePlaceholder} className="w-full px-4 py-3 border border-beto-gray-subtle/60 bg-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-beto-black mb-2 block tracking-wide">{p.whatCreating}</label>
                    <select className="w-full px-4 py-3 border border-beto-gray-subtle/60 bg-white text-sm text-beto-black focus:outline-none focus:border-beto-gold transition-colors appearance-none">
                      <option value="">{p.selectProject}</option>
                      {p.projectTypes.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-beto-black mb-2 block tracking-wide">{p.tellUsMore}</label>
                    <textarea rows={4} placeholder={p.messagePlaceholder} className="w-full px-4 py-3 border border-beto-gray-subtle/60 bg-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors resize-none" />
                  </div>
                </div>

                <button className="w-full py-4 bg-beto-black text-white text-xs font-medium uppercase tracking-widest hover:bg-beto-gold transition-colors duration-300">
                  {p.submitButton}
                </button>

                <p className="text-xs text-beto-gray-light mt-4 text-center leading-relaxed">
                  {p.responseNote}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
