"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { trackMetaLead, trackMetaSchedule } from "@/lib/metaPixel";
import { submitLeadForm } from "@/lib/submitForm";

const CALENDLY_URL = "https://calendly.com/betojewlz";

type Status = "idle" | "sending" | "success" | "error";
type Tab = "booking" | "message";

export default function ConsultationContent() {
  const tr = useTranslation();
  const p = tr.pages.consultation;
  const [status, setStatus] = useState<Status>("idle");
  const [format, setFormat] = useState("");
  const [tab, setTab] = useState<Tab>("booking");
  const scheduledRef = useRef(false);

  const [prepProjectType, setPrepProjectType] = useState("");
  const [prepStage, setPrepStage] = useState("");
  const [prepFormat, setPrepFormat] = useState("");
  const [prepNotes, setPrepNotes] = useState("");
  const prepSummary = [prepProjectType, prepStage, prepFormat].filter(Boolean);

  // Some embedded/in-app browsers (Gmail, Instagram, Facebook) sandbox
  // third-party iframes and the Calendly widget never renders, leaving
  // visitors stuck on "Loading the calendar...". After a few seconds we
  // promote the fallback link into a real button with a hint, so visitors
  // aren't left guessing whether the small text link below is their way out.
  const [widgetSlow, setWidgetSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setWidgetSlow(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleCalendlyMessage(e: MessageEvent) {
      if (
        e.origin === "https://calendly.com" &&
        e.data?.event === "calendly.event_scheduled" &&
        !scheduledRef.current
      ) {
        scheduledRef.current = true;
        trackMetaSchedule("consultation-booking");
      }
    }
    window.addEventListener("message", handleCalendlyMessage);
    return () => window.removeEventListener("message", handleCalendlyMessage);
  }, []);

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

                {/*
                  Calendly's widget.js scans the DOM for .calendly-inline-widget
                  only once, when it first loads — it never re-scans for a div
                  that disappears and reappears. Conditionally unmounting this
                  on tab switch (the old `{tab === "booking" && <div>...}`
                  pattern) meant the widget never came back after the visitor
                  switched to the message tab and back: an empty box forever.
                  It now stays mounted permanently and is only hidden with CSS.
                */}
                <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
                <div className={tab === "booking" ? "" : "hidden"}>
                  <div className="mb-6 pb-6 border-b border-beto-gray-subtle/40">
                    <p className="text-xs font-medium text-beto-black mb-4 tracking-wide">{p.prepare.label}</p>

                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-[11px] text-beto-gray-light uppercase tracking-wider mb-2">{p.prepare.q1Label}</p>
                        <div className="flex flex-wrap gap-2">
                          {p.prepare.q1Options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setPrepProjectType(prepProjectType === opt ? "" : opt)}
                              aria-pressed={prepProjectType === opt}
                              className={cn(
                                "px-3.5 py-2 text-xs border rounded-full transition-colors",
                                prepProjectType === opt
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
                        <p className="text-[11px] text-beto-gray-light uppercase tracking-wider mb-2">{p.prepare.q2Label}</p>
                        <div className="flex flex-wrap gap-2">
                          {p.prepare.q2Options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setPrepStage(prepStage === opt ? "" : opt)}
                              aria-pressed={prepStage === opt}
                              className={cn(
                                "px-3.5 py-2 text-xs border rounded-full transition-colors",
                                prepStage === opt
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
                        <p className="text-[11px] text-beto-gray-light uppercase tracking-wider mb-2">{p.prepare.q3Label}</p>
                        <div className="flex flex-wrap gap-2">
                          {p.prepare.q3Options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setPrepFormat(prepFormat === opt ? "" : opt)}
                              aria-pressed={prepFormat === opt}
                              className={cn(
                                "px-3.5 py-2 text-xs border rounded-full transition-colors",
                                prepFormat === opt
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
                        <label htmlFor="prep-notes" className="text-[11px] text-beto-gray-light uppercase tracking-wider mb-2 block">
                          {p.prepare.notesLabel}
                        </label>
                        <textarea
                          id="prep-notes"
                          rows={3}
                          value={prepNotes}
                          onChange={(e) => setPrepNotes(e.target.value)}
                          placeholder={p.prepare.notesPlaceholder}
                          className="w-full px-4 py-3 border border-beto-gray-subtle/60 bg-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors resize-none"
                        />
                      </div>
                    </div>

                    {prepSummary.length > 0 && (
                      <p className="mt-4 text-xs text-beto-gold">
                        {p.prepare.summaryPrefix} {prepSummary.join(" · ")}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-beto-gray leading-relaxed mb-4">{p.bookingNote}</p>
                  <div
                    className="calendly-inline-widget relative"
                    data-url={`${CALENDLY_URL}?primary_color=c9a86a&hide_gdpr_banner=1`}
                    style={{ minWidth: "280px", height: "700px" }}
                  >
                    <p className="absolute inset-0 flex items-center justify-center text-xs text-beto-gray-light">
                      {p.loadingCalendar}
                    </p>
                  </div>
                  <div className="mt-3">
                    {widgetSlow && (
                      <p className="text-xs text-beto-gold font-medium text-center mb-2">
                        {p.calendarFallbackHint}
                      </p>
                    )}
                    <a
                      href={CALENDLY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "block text-center transition-colors",
                        widgetSlow
                          ? "text-sm border border-beto-gold text-beto-gold font-medium px-4 py-3 bg-beto-gold/5 hover:bg-beto-gold/10"
                          : "text-xs text-beto-gold hover:underline"
                      )}
                    >
                      {p.calendarFallback}
                    </a>
                  </div>
                </div>

                {tab === "message" && (
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

                  {status === "success" && (
                    <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3">{p.successMessage}</p>
                  )}
                  {status === "error" && (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">{p.errorMessage}</p>
                  )}
                </form>
                )}

                {tab === "message" && (
                  <p className="text-xs text-beto-gray-light mt-4 text-center leading-relaxed">
                    {p.responseNote}
                  </p>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
