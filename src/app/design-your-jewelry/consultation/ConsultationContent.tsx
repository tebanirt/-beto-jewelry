"use client";

import { useState } from "react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { trackMetaLead } from "@/lib/metaPixel";
import { submitLeadForm } from "@/lib/submitForm";
import CalendlyNextStep from "@/components/shared/CalendlyNextStep";
import PrivateOffices from "@/components/shared/PrivateOffices";

const CALENDLY_URL = "https://calendly.com/betojewlz";

type Status = "idle" | "sending" | "success" | "error";
type Tab = "booking" | "message";

export default function ConsultationContent() {
  const tr = useTranslation();
  const p = tr.pages.consultation;
  const [status, setStatus] = useState<Status>("idle");
  const [format, setFormat] = useState("");
  const [tab, setTab] = useState<Tab>("booking");
  const [lead, setLead] = useState({ name: "", email: "" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; // React nulls e.currentTarget after an await — grab it now
    setStatus("sending");
    const formData = new FormData(form);
    const fields = {
      "Format préféré": format,
      "Nom complet": formData.get("fullName")?.toString() || "",
      "Courriel": formData.get("email")?.toString() || "",
      "Téléphone": formData.get("phone")?.toString() || "",
      "Type de projet": formData.get("projectType")?.toString() || "",
      "Détails": formData.get("message")?.toString() || "",
      email: formData.get("email")?.toString() || "",
    };

    const ok = await submitLeadForm("consultation", fields);
    if (ok) {
      setLead({ name: fields["Nom complet"], email: fields.email });
      setStatus("success");
      trackMetaLead("consultation");
      form.reset();
      setFormat("");
    } else {
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

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <button
                    type="button"
                    onClick={() => setTab("booking")}
                    aria-pressed={tab === "booking"}
                    className={cn(
                      "px-4 py-3 border text-sm transition-colors",
                      tab === "booking"
                        ? "border-beto-gold text-beto-gold bg-beto-gold/5"
                        : "border-beto-gray-subtle text-beto-gray hover:border-beto-gold hover:text-beto-gold"
                    )}
                  >
                    {p.bookingTab}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("message")}
                    aria-pressed={tab === "message"}
                    className={cn(
                      "px-4 py-3 border text-sm transition-colors",
                      tab === "message"
                        ? "border-beto-gold text-beto-gold bg-beto-gold/5"
                        : "border-beto-gray-subtle text-beto-gray hover:border-beto-gold hover:text-beto-gold"
                    )}
                  >
                    {p.messageTab}
                  </button>
                </div>

                <div className={tab === "booking" ? "" : "hidden"}>
                  <p className="text-xs text-beto-gray leading-relaxed mb-4">{p.bookingNote}</p>

                  {/*
                    Direct Calendly link, no embed. Calendly's own
                    widget.js has a live, confirmed bug (throws on load,
                    independent of anything this site sends it) on every
                    device tested tonight — not something fixable from our
                    side, so the embed was removed rather than ask a
                    visitor to wait on something broken. No
                    target="_blank": a left-click on a new-tab link can be
                    silently swallowed by ad-block/privacy extensions,
                    confirmed live tonight.
                  */}
                  <a
                    href={CALENDLY_URL}
                    className="block text-center text-sm font-medium uppercase tracking-widest px-4 py-4 bg-beto-gold text-beto-black hover:bg-beto-gold-dark transition-colors duration-300"
                  >
                    {p.bookNowCta}
                  </a>
                </div>

                {tab === "message" && status === "success" && (
                  <CalendlyNextStep name={lead.name} email={lead.email} autoRedirect />
                )}

                {tab === "message" && status !== "success" && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
                  <div>
                    <p className="text-xs font-medium text-beto-black mb-3 tracking-wide">{p.preferredFormat}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {p.formatOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormat(opt)}
                          className={cn(
                            "px-4 py-3 border text-sm transition-colors text-left",
                            format === opt
                              ? "border-beto-gold text-beto-gold bg-beto-gold/5"
                              : "border-beto-gray-subtle text-beto-gray hover:border-beto-gold hover:text-beto-gold"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-beto-black mb-2 block tracking-wide">{p.fullName}</label>
                    <input name="fullName" required type="text" placeholder={p.fullNamePlaceholder} className="w-full px-4 py-3 border border-beto-gray-subtle/60 bg-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-beto-black mb-2 block tracking-wide">{p.emailAddress}</label>
                    <input name="email" required type="email" placeholder={p.emailPlaceholder} className="w-full px-4 py-3 border border-beto-gray-subtle/60 bg-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-beto-black mb-2 block tracking-wide">{p.phoneNumber}</label>
                    <input name="phone" type="tel" placeholder={p.phonePlaceholder} className="w-full px-4 py-3 border border-beto-gray-subtle/60 bg-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-beto-black mb-2 block tracking-wide">{p.whatCreating}</label>
                    <select name="projectType" required defaultValue="" className="w-full px-4 py-3 border border-beto-gray-subtle/60 bg-white text-sm text-beto-black focus:outline-none focus:border-beto-gold transition-colors appearance-none">
                      <option value="" disabled>{p.selectProject}</option>
                      {p.projectTypes.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-beto-black mb-2 block tracking-wide">{p.tellUsMore}</label>
                    <textarea name="message" rows={4} placeholder={p.messagePlaceholder} className="w-full px-4 py-3 border border-beto-gray-subtle/60 bg-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors resize-none" />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full py-4 bg-beto-black text-white text-xs font-medium uppercase tracking-widest hover:bg-beto-gold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "sending" ? p.sending : p.submitButton}
                  </button>

                  {status === "error" && (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">{p.errorMessage}</p>
                  )}
                </form>
                )}

                {tab === "message" && status !== "success" && (
                  <p className="text-xs text-beto-gray-light mt-4 text-center leading-relaxed">
                    {p.responseNote}
                  </p>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <PrivateOffices />
    </>
  );
}
