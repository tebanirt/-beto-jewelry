"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { trackMetaLead } from "@/lib/metaPixel";

type Status = "idle" | "sending" | "success" | "error";

export default function CustomDesignContent() {
  const tr = useTranslation();
  const cd = tr.pages.customDesign;

  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState({
    projectType: "",
    stone: "",
    shape: "",
    metal: "",
    budget: "",
    timeline: "",
    notes: "",
    fullName: "",
    email: "",
    phone: "",
    contactMethod: "",
    images: [] as File[],
  });

  const update = (key: string, val: string) => setData((d) => ({ ...d, [key]: val }));

  async function handleSubmit() {
    setStatus("sending");
    const fields = {
      "Type de projet": data.projectType,
      "Pierre": data.stone,
      "Forme": data.shape,
      "Métal": data.metal,
      "Budget": data.budget,
      "Échéancier": data.timeline,
      "Notes": data.notes,
      "Nom complet": data.fullName,
      "Courriel": data.email,
      "Téléphone": data.phone,
      "Méthode de contact préférée": data.contactMethod,
      email: data.email,
    };

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "custom-design", fields }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      trackMetaLead("custom-design");
    } catch {
      setStatus("error");
    }
  }

  const noPreference = cd.stoneTypes[cd.stoneTypes.length - 1];
  const engagementRing = cd.projectTypes[0];

  const isStepValid = () => {
    if (step === 0) return !!data.projectType;
    if (step === 1) return !!data.stone && !!data.metal && !!data.budget;
    if (step === 2) return !!data.fullName && !!data.email;
    return true;
  };

  const sl = cd.summaryLabels;

  return (
    <div className="min-h-screen bg-beto-offwhite" style={{ paddingTop: "var(--nav-height)" }}>
      {/* Header */}
      <div className="bg-beto-black py-12 px-6 text-center">
        <p className="text-label text-beto-gold mb-3">{cd.eyebrow}</p>
        <h1 className="font-display text-white text-4xl lg:text-5xl font-light">
          {cd.title}
        </h1>
        <p className="text-white/50 text-sm mt-3 max-w-md mx-auto leading-relaxed">
          {cd.subtitle}
        </p>
      </div>

      {/* Progress */}
      <div className="bg-beto-white border-b border-beto-gray-subtle/40">
        <div className="container-beto py-5">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {cd.steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                  i < step ? "bg-beto-gold text-beto-black"
                    : i === step ? "bg-beto-black text-white"
                      : "bg-beto-gray-subtle text-beto-gray-light"
                )}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className={cn(
                  "text-xs font-medium hidden sm:block",
                  i === step ? "text-beto-black" : "text-beto-gray-light"
                )}>{s}</span>
                {i < cd.steps.length - 1 && (
                  <div className={cn("h-px flex-1 min-w-[20px] sm:min-w-[40px] transition-all duration-500", i < step ? "bg-beto-gold" : "bg-beto-gray-subtle")} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container-beto py-16 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {/* STEP 0: Project Type */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
              <h2 className="font-display text-beto-black text-3xl font-light mb-2">{cd.step0Title}</h2>
              <p className="text-sm text-beto-gray mb-10">{cd.step0Desc}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
                {cd.projectTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => update("projectType", type)}
                    className={cn(
                      "px-4 py-5 border text-sm font-medium text-left transition-all duration-200",
                      data.projectType === type
                        ? "border-beto-gold bg-beto-gold/10 text-beto-black"
                        : "border-beto-gray-subtle bg-beto-white text-beto-gray hover:border-beto-gold/60"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="mb-10">
                <p className="text-xs font-medium text-beto-black tracking-wide mb-3">
                  {cd.uploadLabel} <span className="text-beto-gray-light font-normal">{cd.uploadOpt}</span>
                </p>
                <div className="border-2 border-dashed border-beto-gray-subtle/60 p-10 text-center hover:border-beto-gold/40 transition-colors bg-beto-white cursor-pointer">
                  <Upload size={20} className="text-beto-gray-light mx-auto mb-3" />
                  <p className="text-sm text-beto-gray mb-1">{cd.uploadDrop}</p>
                  <p className="text-xs text-beto-gray-light">{cd.uploadHint}</p>
                </div>
              </div>

              <div className="mb-10">
                <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">
                  {cd.additionalNotes} <span className="text-beto-gray-light font-normal">{cd.notesOpt}</span>
                </label>
                <textarea
                  rows={4}
                  value={data.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder={cd.notesPlaceholder}
                  className="w-full px-5 py-4 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors resize-none"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 1: Design Details */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
              <h2 className="font-display text-beto-black text-3xl font-light mb-2">{cd.step1Title}</h2>
              <p className="text-sm text-beto-gray mb-10">{cd.step1Desc}</p>

              <div className="mb-10">
                <p className="text-xs font-medium text-beto-black tracking-wide mb-4">{cd.stoneLabel}</p>
                <div className="grid grid-cols-2 gap-3">
                  {cd.stoneTypes.map((s) => (
                    <button key={s} onClick={() => update("stone", s)} className={cn("px-4 py-4 border text-sm text-left transition-all duration-200", data.stone === s ? "border-beto-gold bg-beto-gold/10 text-beto-black" : "border-beto-gray-subtle bg-beto-white text-beto-gray hover:border-beto-gold/60")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {(data.projectType === engagementRing || data.stone !== noPreference) && data.stone && (
                <div className="mb-10">
                  <p className="text-xs font-medium text-beto-black tracking-wide mb-4">{cd.shapeLabel} <span className="text-beto-gray-light font-normal">{cd.shapeOpt}</span></p>
                  <div className="flex flex-wrap gap-3">
                    {cd.shapes.map((s) => (
                      <button key={s} onClick={() => update("shape", s)} className={cn("px-4 py-2.5 border text-xs font-medium tracking-wide transition-all duration-200", data.shape === s ? "border-beto-gold bg-beto-gold/10 text-beto-black" : "border-beto-gray-subtle bg-beto-white text-beto-gray hover:border-beto-gold/60")}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-10">
                <p className="text-xs font-medium text-beto-black tracking-wide mb-4">{cd.metalLabel}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {cd.metals.map((m) => (
                    <button key={m} onClick={() => update("metal", m)} className={cn("px-4 py-4 border text-sm text-left transition-all duration-200", data.metal === m ? "border-beto-gold bg-beto-gold/10 text-beto-black" : "border-beto-gray-subtle bg-beto-white text-beto-gray hover:border-beto-gold/60")}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <p className="text-xs font-medium text-beto-black tracking-wide mb-4">{cd.budgetLabel}</p>
                <div className="flex flex-wrap gap-3">
                  {cd.budgets.map((b) => (
                    <button key={b} onClick={() => update("budget", b)} className={cn("px-4 py-2.5 border text-xs font-medium tracking-wide transition-all duration-200", data.budget === b ? "border-beto-gold bg-beto-gold/10 text-beto-black" : "border-beto-gray-subtle bg-beto-white text-beto-gray hover:border-beto-gold/60")}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <p className="text-xs font-medium text-beto-black tracking-wide mb-4">{cd.timelineLabel}</p>
                <div className="flex flex-wrap gap-3">
                  {cd.timelines.map((t) => (
                    <button key={t} onClick={() => update("timeline", t)} className={cn("px-4 py-2.5 border text-xs font-medium tracking-wide transition-all duration-200", data.timeline === t ? "border-beto-gold bg-beto-gold/10 text-beto-black" : "border-beto-gray-subtle bg-beto-white text-beto-gray hover:border-beto-gold/60")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Contact Info */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
              <h2 className="font-display text-beto-black text-3xl font-light mb-2">{cd.step2Title}</h2>
              <p className="text-sm text-beto-gray mb-10">{cd.step2Desc}</p>
              <div className="flex flex-col gap-5">
                {[
                  { key: "fullName", label: cd.fullName, type: "text", placeholder: cd.fullNamePlaceholder },
                  { key: "email", label: cd.emailAddress, type: "email", placeholder: cd.emailPlaceholder },
                  { key: "phone", label: cd.phoneNumber, type: "tel", placeholder: cd.phonePlaceholder },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">{field.label}</label>
                    <input
                      type={field.type}
                      value={(data as unknown as Record<string, string>)[field.key]}
                      onChange={(e) => update(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-5 py-4 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors"
                    />
                  </div>
                ))}

                <div>
                  <p className="text-xs font-medium text-beto-black tracking-wide mb-3">{cd.contactMethodLabel}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {cd.contacts.map((c) => (
                      <button key={c} onClick={() => update("contactMethod", c)} className={cn("px-4 py-3 border text-sm transition-all duration-200", data.contactMethod === c ? "border-beto-gold bg-beto-gold/10 text-beto-black" : "border-beto-gray-subtle bg-beto-white text-beto-gray hover:border-beto-gold/60")}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Summary */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
              <h2 className="font-display text-beto-black text-3xl font-light mb-2">{cd.step3Title}</h2>
              <p className="text-sm text-beto-gray mb-10">{cd.step3Desc}</p>

              <div className="bg-beto-white border border-beto-gray-subtle/40 divide-y divide-beto-gray-subtle/30 mb-10">
                {[
                  { label: sl.projectType, value: data.projectType },
                  { label: sl.stone, value: data.stone },
                  { label: sl.shape, value: data.shape || sl.notSpecified },
                  { label: sl.metal, value: data.metal },
                  { label: sl.budget, value: data.budget },
                  { label: sl.timeline, value: data.timeline },
                  { label: sl.name, value: data.fullName },
                  { label: sl.email, value: data.email },
                  { label: sl.phone, value: data.phone || sl.notProvided },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center px-6 py-4">
                    <span className="text-xs font-medium tracking-wide text-beto-gray-light">{row.label}</span>
                    <span className="text-sm text-beto-black font-medium">{row.value || "—"}</span>
                  </div>
                ))}
              </div>

              <div className="bg-beto-black text-white p-8 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-label text-beto-gold mb-1">{cd.depositLabel}</p>
                    <p className="font-display text-white text-2xl font-light">{cd.depositAmount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/50 leading-relaxed">{cd.depositNonRefundable}</p>
                    <p className="text-xs text-beto-gold mt-1">{cd.depositCredited}</p>
                  </div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{cd.depositDesc}</p>
              </div>

              {status === "success" ? (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-4 text-center">{cd.successMessage}</p>
              ) : (
                <>
                  <button
                    onClick={handleSubmit}
                    disabled={status === "sending"}
                    className="w-full py-5 bg-beto-gold text-beto-black text-xs font-medium uppercase tracking-[0.2em] hover:bg-beto-gold-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "sending" ? cd.sending : cd.secureButton}
                  </button>
                  <p className="text-xs text-beto-gray-light mt-4 text-center">
                    {cd.secureNote}
                  </p>
                  {status === "error" && (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mt-4 text-center">{cd.errorMessage}</p>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {status !== "success" && (
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-beto-gray-subtle/40">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={cn("text-xs font-medium tracking-widest uppercase text-beto-gray hover:text-beto-black transition-colors", step === 0 && "invisible")}
            >
              {cd.backButton}
            </button>

            {step < cd.steps.length - 1 && (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!isStepValid()}
                className="px-8 py-3.5 bg-beto-black text-white text-xs font-medium uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-beto-gold transition-colors duration-300"
              >
                {cd.continueButton}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
