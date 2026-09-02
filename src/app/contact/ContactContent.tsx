"use client";

import { useState } from "react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { trackMetaLead } from "@/lib/metaPixel";

type Status = "idle" | "sending" | "success" | "error";

function IconInstagram({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function ContactContent() {
  const tr = useTranslation();
  const p = tr.pages.contact;
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const formData = new FormData(e.currentTarget);
    const fields = {
      "Prénom": formData.get("firstName")?.toString() || "",
      "Nom": formData.get("lastName")?.toString() || "",
      "Courriel": formData.get("email")?.toString() || "",
      "Sujet": formData.get("subject")?.toString() || "",
      "Message": formData.get("message")?.toString() || "",
      email: formData.get("email")?.toString() || "",
    };

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "contact", fields }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      trackMetaLead("contact");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

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
              <p className="text-label text-beto-gold mb-8">{p.reachDirectly}</p>
              <div className="flex flex-col gap-8">
                <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 bg-beto-offwhite flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-beto-gold" />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-beto-gray-light mb-1">{p.emailLabel}</p>
                    <a href="mailto:betojewlz@gmail.com" className="text-beto-black hover:text-beto-gold transition-colors">
                      betojewlz@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 bg-beto-offwhite flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-beto-gold" />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-beto-gray-light mb-1">{p.phoneLabel}</p>
                    <a href="tel:+14388745759" className="text-beto-black hover:text-beto-gold transition-colors">
                      +1 (438) 874-5759
                    </a>
                  </div>
                </div>

                <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 bg-beto-offwhite flex items-center justify-center flex-shrink-0">
                    <IconInstagram size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-beto-gray-light mb-1">{p.instagramLabel}</p>
                    <a href="https://instagram.com/betojewelry" target="_blank" rel="noopener noreferrer" className="text-beto-black hover:text-beto-gold transition-colors">
                      @betojewelry
                    </a>
                  </div>
                </div>

                <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 bg-beto-offwhite flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-beto-gold" />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-beto-gray-light mb-1">{p.locationLabel}</p>
                    <p className="text-beto-black">{p.locationValue}</p>
                    <p className="text-xs text-beto-gray-light mt-0.5">{p.locationNote}</p>
                  </div>
                </div>

                <div className="flex gap-5 items-start">
                  <div className="w-10 h-10 bg-beto-offwhite flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-beto-gold" />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-beto-gray-light mb-1">{p.responseTimeLabel}</p>
                    <p className="text-beto-black">{p.responseTimeValue}</p>
                    <p className="text-xs text-beto-gray-light mt-0.5">{p.responseTimeNote}</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="bg-beto-offwhite p-10">
                <p className="text-label text-beto-gold mb-6">{p.sendMessage}</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{p.firstName}</label>
                      <input name="firstName" required type="text" placeholder={p.firstNamePlaceholder} className="w-full px-4 py-3.5 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{p.lastName}</label>
                      <input name="lastName" required type="text" placeholder={p.lastNamePlaceholder} className="w-full px-4 py-3.5 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{p.email}</label>
                    <input name="email" required type="email" placeholder={p.emailPlaceholder} className="w-full px-4 py-3.5 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{p.subject}</label>
                    <select name="subject" required defaultValue="" className="w-full px-4 py-3.5 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black focus:outline-none focus:border-beto-gold transition-colors appearance-none">
                      <option value="" disabled>{p.subjectPlaceholder}</option>
                      {p.subjectOptions.map((opt) => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{p.message}</label>
                    <textarea name="message" required rows={5} placeholder={p.messagePlaceholder} className="w-full px-4 py-3.5 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors resize-none" />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full py-4 bg-beto-black text-white text-xs font-medium uppercase tracking-widest hover:bg-beto-gold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "sending" ? p.sending : p.submitButton}
                  </button>

                  {status === "success" && (
                    <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3">{p.successMessage}</p>
                  )}
                  {status === "error" && (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">{p.errorMessage}</p>
                  )}
                </form>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
