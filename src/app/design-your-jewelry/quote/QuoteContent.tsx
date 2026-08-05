"use client";

import { useState } from "react";
import PageHero from "@/components/shared/PageHero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/hooks/useTranslation";

type Status = "idle" | "sending" | "success" | "error";

export default function QuoteContent() {
  const tr = useTranslation();
  const p = tr.pages.quote;
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const formData = new FormData(e.currentTarget);
    const fields = {
      "Nom complet": formData.get("name")?.toString() || "",
      "Courriel": formData.get("email")?.toString() || "",
      "Téléphone": formData.get("phone")?.toString() || "",
      "Type de projet": formData.get("projectType")?.toString() || "",
      "Budget": formData.get("budget")?.toString() || "",
      "Description": formData.get("description")?.toString() || "",
      email: formData.get("email")?.toString() || "",
    };

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "quote", fields }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
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
        <div className="container-beto max-w-2xl mx-auto">
          <AnimatedSection>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {[
                { key: "name", label: p.fullName, type: "text", placeholder: p.fullNamePlaceholder, required: true },
                { key: "email", label: p.emailAddress, type: "email", placeholder: p.emailPlaceholder, required: true },
                { key: "phone", label: p.phoneNumber, type: "tel", placeholder: p.phonePlaceholder, required: false },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{f.label}</label>
                  <input name={f.key} required={f.required} type={f.type} placeholder={f.placeholder} className="w-full px-5 py-4 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
                </div>
              ))}

              <div>
                <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{p.projectType}</label>
                <select name="projectType" required defaultValue="" className="w-full px-5 py-4 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black focus:outline-none focus:border-beto-gold transition-colors appearance-none">
                  <option value="" disabled>{p.projectTypePlaceholder}</option>
                  {p.projectTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{p.budget}</label>
                <select name="budget" required defaultValue="" className="w-full px-5 py-4 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black focus:outline-none focus:border-beto-gold transition-colors appearance-none">
                  <option value="" disabled>{p.budgetPlaceholder}</option>
                  {p.budgetOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{p.describeProject}</label>
                <textarea name="description" required rows={6} placeholder={p.describeProjectPlaceholder} className="w-full px-5 py-4 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors resize-none" />
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

              <p className="text-xs text-beto-gray-light text-center leading-relaxed">
                {p.responseNote}
              </p>
            </form>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
