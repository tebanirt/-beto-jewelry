"use client";

import { MapPin } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/hooks/useTranslation";
import { buildCalendlyUrl } from "@/components/shared/CalendlyNextStep";

/**
 * The two private offices where in-person consultations happen (never the
 * atelier — see docs/business-ops-brief.md §6). Each address gets its own
 * booking button so the visitor picks the office closest to home.
 * Same-tab Calendly link, no target="_blank" (in-app browsers / ad-block).
 */
const OFFICES = [
  {
    key: "downtown",
    address: "1188, avenue Union",
    city: "Montréal (QC) H3B 0E5",
    maps: "https://www.google.com/maps/search/?api=1&query=1188+Avenue+Union+Montreal+QC+H3B+0E5",
  },
  {
    key: "saintLaurent",
    address: "9900, boul. Cavendish, bureau 200",
    city: "Saint-Laurent (QC) H4M 2V2",
    maps: "https://www.google.com/maps/search/?api=1&query=9900+Boul.+Cavendish+Ste+200+Saint-Laurent+QC+H4M+2V2",
  },
] as const;

export default function PrivateOffices({ className = "" }: { className?: string }) {
  const o = useTranslation().privateOffices;

  return (
    <section className={`py-20 lg:py-28 bg-beto-offwhite ${className}`}>
      <div className="container-beto">
        <AnimatedSection>
          <p className="text-label text-beto-gold mb-4">{o.eyebrow}</p>
          <h2 className="font-display text-3xl lg:text-4xl font-normal text-beto-black leading-tight mb-4">
            {o.title}
          </h2>
          <p className="text-sm text-beto-gray leading-relaxed max-w-2xl mb-12">{o.intro}</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {OFFICES.map((office, i) => {
            const copy = o[office.key];
            return (
              <AnimatedSection key={office.key} delay={0.1 * (i + 1)}>
                <div className="h-full flex flex-col bg-beto-white border border-beto-gray-subtle p-8 lg:p-10">
                  <p className="text-label text-beto-gold mb-3">{copy.label}</p>
                  <h3 className="font-display text-2xl font-normal text-beto-black mb-5">{copy.name}</h3>

                  <a
                    href={office.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 items-start text-beto-black hover:text-beto-gold transition-colors mb-4"
                  >
                    <MapPin size={16} className="text-beto-gold mt-1 flex-shrink-0" aria-hidden />
                    <span className="text-sm leading-relaxed">
                      {office.address}
                      <br />
                      {office.city}
                    </span>
                  </a>

                  <p className="text-sm text-beto-gray leading-relaxed mb-8 flex-1">{copy.idealFor}</p>

                  <a
                    href={buildCalendlyUrl()}
                    className="block text-center text-sm font-medium uppercase tracking-widest px-4 py-4 bg-beto-black text-white hover:bg-beto-gold hover:text-beto-black transition-colors duration-300"
                  >
                    {o.cta}
                  </a>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        <p className="text-xs text-beto-gray-light mt-8 text-center leading-relaxed">{o.note}</p>
      </div>
    </section>
  );
}
