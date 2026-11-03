"use client";

import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Magnetic from "@/components/ui/Magnetic";
import { useTranslation } from "@/hooks/useTranslation";
import { useStore } from "@/store/useStore";
import { trackMetaLead } from "@/lib/metaPixel";
import { submitLeadForm } from "@/lib/submitForm";
import {
  MAX_INSPIRATION_IMAGES,
  prepareImageAttachment,
  type LeadAttachment,
} from "@/lib/imageAttachments";
import {
  ENGAGEMENT_CARATS,
  getFromPrices,
  type EngagementCarat,
  type GoldKarat,
  type PricedStone,
} from "@/lib/engagementPricing";
import CalendlyNextStep from "@/components/shared/CalendlyNextStep";

type Status = "idle" | "sending" | "success" | "error";
type StoneId = "natural" | "lab" | "gemstone" | "none";
type LabColor = "white" | "colored";
type MetalColor = "yellow" | "white" | "rose";
type KaratChoice = GoldKarat | "unsure";
type CaratChoice = EngagementCarat | "unsure";
type ContactId = "email" | "phone" | "whatsapp" | "any";

const STONES: StoneId[] = ["natural", "lab", "gemstone", "none"];
const LAB_COLORS: LabColor[] = ["white", "colored"];
const METAL_COLORS: MetalColor[] = ["yellow", "white", "rose"];
const KARATS: KaratChoice[] = ["14k", "18k", "unsure"];
const CONTACTS: ContactId[] = ["email", "phone", "whatsapp", "any"];
const ENGAGEMENT_INDEX = 0;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type InspirationImage = LeadAttachment & { id: string; previewUrl: string };

const stepMotion = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.35 },
};

function Chip({
  selected,
  onClick,
  children,
  compact = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "border transition-all duration-200",
        compact
          ? "px-4 py-2.5 text-xs font-medium tracking-wide whitespace-nowrap"
          : "px-4 py-4 text-sm text-left",
        selected
          ? "border-beto-gold bg-beto-gold/10 text-beto-black"
          : "border-beto-gray-subtle bg-beto-white text-beto-gray hover:border-beto-gold/60"
      )}
    >
      {children}
    </button>
  );
}

function FieldLabel({ children, optional }: { children: ReactNode; optional?: string }) {
  return (
    <p className="text-xs font-medium text-beto-black tracking-wide mb-4">
      {children} {optional && <span className="text-beto-gray-light font-normal">{optional}</span>}
    </p>
  );
}

export default function CustomDesignContent() {
  const tr = useTranslation();
  const cd = tr.pages.customDesign;
  const language = useStore((s) => s.language);

  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");

  const [projectIndex, setProjectIndex] = useState<number | null>(null);
  const [stone, setStone] = useState<StoneId | null>(null);
  const [labColor, setLabColor] = useState<LabColor | null>(null);
  const [labColorDetail, setLabColorDetail] = useState("");
  const [shape, setShape] = useState("");
  const [carat, setCarat] = useState<CaratChoice | null>(null);
  const [metalColor, setMetalColor] = useState<MetalColor | null>(null);
  const [karat, setKarat] = useState<KaratChoice | null>(null);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [notes, setNotes] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contact, setContact] = useState<ContactId | null>(null);

  const [images, setImages] = useState<InspirationImage[]>([]);
  const [preparing, setPreparing] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  const formTopRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<InspirationImage[]>([]);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Free the preview URLs when the visitor leaves the page.
  useEffect(() => () => imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl)), []);

  const isEngagement = projectIndex === ENGAGEMENT_INDEX;
  const isDiamond = stone === "natural" || stone === "lab";
  const askCarat = isEngagement && isDiamond;

  const pricedStone: PricedStone | null =
    stone === "natural" ? "natural" : stone === "lab" ? (labColor === "colored" ? "labColored" : labColor === "white" ? "lab" : null) : null;
  const fromPrices =
    isEngagement && images.length === 0
      ? getFromPrices(pricedStone, typeof carat === "number" ? carat : null, karat ?? "")
      : null;
  const showPrice = fromPrices !== null;
  // Engagement ring without an instant price: Rayane replies with one within the hour.
  const hourPromise = isEngagement && !showPrice;

  const budgetOptions: readonly string[] =
    isEngagement && stone === "natural" ? cd.budgetsNatural : isEngagement && stone === "lab" ? cd.budgetsLab : cd.budgets;

  const money = (n: number) =>
    new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(n);
  const priceText = fromPrices
    ? fromPrices.map((p) => `${money(p.price)} ${cd.estimateIn.replace("{k}", cd.metalKarats[p.karat])}`).join(" · ")
    : "";

  // ── Labels used in the recap and in Rayane's email ──
  const projectLabel = projectIndex !== null ? cd.projectTypes[projectIndex] : "";
  const stoneLabel = stone
    ? stone === "lab" && labColor === "colored"
      ? `${cd.labColorOptions.colored}${labColorDetail.trim() ? ` (${labColorDetail.trim()})` : ""}`
      : stone === "lab" && labColor === "white"
        ? `${cd.stoneOptions.lab}, ${cd.labColorOptions.white.toLowerCase()}`
        : cd.stoneOptions[stone]
    : "";
  const caratText = (c: EngagementCarat) => `${language === "fr" ? String(c).replace(".", ",") : c} ct`;
  const caratLabel = carat === null ? "" : carat === "unsure" ? cd.caratUnsure : caratText(carat);
  const metalLabel = [
    metalColor ? cd.metalColors[metalColor] : "",
    karat ? (karat === "unsure" ? cd.karatToConfirm : cd.metalKarats[karat]) : "",
  ]
    .filter(Boolean)
    .join(karat === "unsure" ? ", " : " ");

  function chooseStone(next: StoneId) {
    setStone(next);
    if (next !== "lab") {
      setLabColor(null);
      setLabColorDetail("");
    }
    if (!(isEngagement && (next === "natural" || next === "lab"))) setCarat(null);
    // Budget ranges differ by stone for engagement rings.
    setBudget("");
  }

  function chooseProject(index: number) {
    setProjectIndex(index);
    if (index !== ENGAGEMENT_INDEX) setCarat(null);
    setBudget("");
  }

  async function addFiles(files: FileList | File[]) {
    setUploadMessage("");
    const list = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    const room = MAX_INSPIRATION_IMAGES - imagesRef.current.length - preparing;
    if (room <= 0) {
      setUploadMessage(cd.uploadLimit);
      return;
    }
    const accepted = list.slice(0, room);
    if (list.length > room) setUploadMessage(cd.uploadLimit);
    setPreparing((n) => n + accepted.length);
    for (const file of accepted) {
      try {
        const prepared = await prepareImageAttachment(file);
        setImages((prev) => [
          ...prev,
          { ...prepared, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, previewUrl: URL.createObjectURL(file) },
        ]);
      } catch {
        setUploadMessage(cd.uploadError);
      } finally {
        setPreparing((n) => n - 1);
      }
    }
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
    setUploadMessage("");
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) void addFiles(e.dataTransfer.files);
  }

  const phoneNeeded = contact === "phone" || contact === "whatsapp";

  const isStepValid = () => {
    if (step === 0) return projectIndex !== null && preparing === 0;
    if (step === 1) {
      if (!stone || !metalColor || !karat || !budget) return false;
      if (stone === "lab" && !labColor) return false;
      if (askCarat && carat === null) return false;
      return true;
    }
    if (step === 3) {
      return !!fullName.trim() && EMAIL_RE.test(email.trim()) && (!phoneNeeded || phone.trim().length >= 7);
    }
    return true;
  };

  function goTo(next: number) {
    setStep(next);
    const top = formTopRef.current?.getBoundingClientRect().top;
    if (top !== undefined && top < 0) formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit() {
    if (!isStepValid()) return;
    setStatus("sending");
    const shownPrice = showPrice ? `${cd.estimateFrom} ${priceText}` : "";
    const fields: Record<string, string> = {
      "Type de projet": projectLabel,
      "Pierre": stoneLabel,
      "Forme": shape,
      "Carat (pierre centrale)": caratLabel,
      "Métal": metalLabel,
      "Budget": budget,
      "Échéancier": timeline,
      "Notes": notes,
      "Images d'inspiration": images.length > 0 ? `${images.length} en pièce jointe` : "",
      "Prix affiché au client": shownPrice,
      "Réponse promise au client": hourPromise
        ? "Prix en moins d'une heure"
        : isEngagement
          ? ""
          : "Soumission d'ici 1 à 2 jours ouvrables",
      "Nom complet": fullName.trim(),
      "Courriel": email.trim(),
      "Téléphone": phone.trim(),
      "Méthode de contact préférée": contact ? cd.contacts[contact] : "",
      "Langue": language === "fr" ? "Français" : "Anglais",
      email: email.trim(),
    };

    const ok = await submitLeadForm("custom-design", fields, {
      attachments: images.map(({ filename, contentType, content }) => ({ filename, contentType, content })),
      priority: hourPromise ? "1h" : undefined,
    });
    if (ok) {
      setStatus("success");
      setStep(4);
      trackMetaLead("custom-design");
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setStatus("error");
    }
  }

  const sl = cd.summaryLabels;
  const recap = [
    { label: sl.projectType, value: projectLabel },
    { label: sl.stone, value: stoneLabel },
    { label: sl.shape, value: shape || sl.notSpecified },
    ...(askCarat ? [{ label: sl.carat, value: caratLabel }] : []),
    { label: sl.metal, value: metalLabel },
    { label: sl.budget, value: budget },
    { label: sl.timeline, value: timeline || sl.notSpecified },
    ...(images.length > 0 ? [{ label: sl.images, value: String(images.length) }] : []),
  ];

  const successText = showPrice
    ? cd.successPrice.replace("{price}", `${cd.estimateFrom.toLowerCase()} ${priceText}`)
    : hourPromise
      ? cd.successHour
      : cd.successOther;

  return (
    <div className="min-h-screen bg-beto-offwhite" style={{ paddingTop: "var(--nav-height)" }}>
      {/* Header */}
      <div className="bg-beto-black py-12 px-6 text-center">
        <p className="text-label text-beto-gold mb-3">{cd.eyebrow}</p>
        <h1 className="font-display text-white text-4xl lg:text-5xl font-light">{cd.title}</h1>
        <p className="text-white/50 text-sm mt-3 max-w-md mx-auto leading-relaxed">{cd.subtitle}</p>
      </div>

      {/* Progress */}
      <div className="bg-beto-white border-b border-beto-gray-subtle/40">
        <div className="container-beto py-5">
          <ol className="flex items-center justify-between max-w-2xl mx-auto" aria-label={cd.title}>
            {cd.steps.map((s, i) => (
              <li key={s} className="flex items-center gap-2" aria-current={i === step ? "step" : undefined}>
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 shrink-0",
                    i < step
                      ? "bg-beto-gold text-beto-black"
                      : i === step
                        ? "bg-beto-black text-white"
                        : "bg-beto-gray-subtle text-beto-gray-light"
                  )}
                >
                  {i < step ? <Check size={12} aria-hidden /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden md:block",
                    i === step ? "text-beto-black" : "text-beto-gray-light"
                  )}
                >
                  {s}
                </span>
                {i < cd.steps.length - 1 && (
                  <div
                    className={cn(
                      "h-px flex-1 min-w-[12px] sm:min-w-[32px] transition-all duration-500",
                      i < step ? "bg-beto-gold" : "bg-beto-gray-subtle"
                    )}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Form */}
      <div ref={formTopRef} className="container-beto py-16 max-w-3xl mx-auto" style={{ scrollMarginTop: "var(--nav-height)" }}>
        <AnimatePresence mode="wait">
          {/* STEP 0: Project type + inspiration */}
          {step === 0 && (
            <motion.div key="step0" {...stepMotion}>
              <h2 className="font-display text-beto-black text-3xl font-light mb-2">{cd.step0Title}</h2>
              <p className="text-sm text-beto-gray mb-10">{cd.step0Desc}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                {cd.projectTypes.map((type, i) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => chooseProject(i)}
                    aria-pressed={projectIndex === i}
                    className={cn(
                      "px-4 py-5 border text-sm font-medium text-left transition-all duration-200",
                      projectIndex === i
                        ? "border-beto-gold bg-beto-gold/10 text-beto-black"
                        : "border-beto-gray-subtle bg-beto-white text-beto-gray hover:border-beto-gold/60"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="text-xs text-beto-gray-light mb-12 leading-relaxed">{cd.priceOnlyEngagement}</p>

              <div className="mb-10">
                <p className="text-xs font-medium text-beto-black tracking-wide mb-3">
                  {cd.uploadLabel} <span className="text-beto-gray-light font-normal">{cd.uploadOpt}</span>
                </p>
                <label
                  htmlFor="inspiration-images"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={cn(
                    "block border-2 border-dashed p-10 text-center transition-colors bg-beto-white cursor-pointer focus-within:border-beto-gold",
                    dragging ? "border-beto-gold" : "border-beto-gray-subtle/60 hover:border-beto-gold/40"
                  )}
                >
                  <Upload size={20} className="text-beto-gray-light mx-auto mb-3" aria-hidden />
                  <span className="block text-sm text-beto-gray mb-1">{cd.uploadDrop}</span>
                  <span className="block text-xs text-beto-gray-light">{cd.uploadHint}</span>
                  <input
                    id="inspiration-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files?.length) void addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>

                {(images.length > 0 || preparing > 0) && (
                  <ul className="flex flex-wrap gap-3 mt-4">
                    {images.map((img) => (
                      <li key={img.id} className="relative w-24 h-24 border border-beto-gray-subtle/60 bg-beto-white">
                        {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                        <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          aria-label={cd.uploadRemove}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-beto-black text-white flex items-center justify-center hover:bg-beto-gold hover:text-beto-black transition-colors"
                        >
                          <X size={12} aria-hidden />
                        </button>
                      </li>
                    ))}
                    {preparing > 0 && (
                      <li className="w-24 h-24 border border-dashed border-beto-gray-subtle flex items-center justify-center px-2 text-center text-[11px] text-beto-gray-light">
                        {cd.uploadPreparing}
                      </li>
                    )}
                  </ul>
                )}
                <div aria-live="polite">
                  {uploadMessage && <p className="text-xs text-red-700 mt-3">{uploadMessage}</p>}
                  {isEngagement && images.length > 0 && (
                    <p className="flex items-center gap-2 text-xs text-beto-black mt-3">
                      <Clock size={14} className="text-beto-gold shrink-0" aria-hidden />
                      {cd.uploadHourNote}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-10">
                <label htmlFor="design-notes" className="text-xs font-medium text-beto-black tracking-wide mb-2 block">
                  {cd.additionalNotes} <span className="text-beto-gray-light font-normal">{cd.notesOpt}</span>
                </label>
                <textarea
                  id="design-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={cd.notesPlaceholder}
                  className="w-full px-5 py-4 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors resize-none"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 1: Design details */}
          {step === 1 && (
            <motion.div key="step1" {...stepMotion}>
              <h2 className="font-display text-beto-black text-3xl font-light mb-2">{cd.step1Title}</h2>
              <p className="text-sm text-beto-gray mb-10">{cd.step1Desc}</p>

              <div className="mb-10">
                <FieldLabel>{cd.stoneLabel}</FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  {STONES.map((id) => (
                    <Chip key={id} selected={stone === id} onClick={() => chooseStone(id)}>
                      {cd.stoneOptions[id]}
                    </Chip>
                  ))}
                </div>

                {stone === "lab" && (
                  <div className="mt-6 pl-4 border-l-2 border-beto-gold/40">
                    <FieldLabel>{cd.labColorLabel}</FieldLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {LAB_COLORS.map((id) => (
                        <Chip key={id} selected={labColor === id} onClick={() => setLabColor(id)}>
                          {cd.labColorOptions[id]}
                        </Chip>
                      ))}
                    </div>
                    {labColor === "colored" && (
                      <div className="mt-4">
                        <label htmlFor="lab-color-detail" className="text-xs font-medium text-beto-black tracking-wide mb-2 block">
                          {cd.labColorDetailLabel} <span className="text-beto-gray-light font-normal">{cd.notesOpt}</span>
                        </label>
                        <input
                          id="lab-color-detail"
                          type="text"
                          value={labColorDetail}
                          onChange={(e) => setLabColorDetail(e.target.value)}
                          placeholder={cd.labColorDetailPlaceholder}
                          className="w-full px-5 py-3.5 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {stone && (isEngagement || stone !== "none") && (
                <div className="mb-10">
                  <FieldLabel optional={cd.shapeOpt}>{cd.shapeLabel}</FieldLabel>
                  <div className="flex flex-wrap gap-3">
                    {cd.shapes.map((s) => (
                      <Chip key={s} compact selected={shape === s} onClick={() => setShape(shape === s ? "" : s)}>
                        {s}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {askCarat && (
                <div className="mb-10">
                  <FieldLabel>{cd.caratLabel}</FieldLabel>
                  <div className="flex flex-wrap gap-3">
                    {ENGAGEMENT_CARATS.map((c) => (
                      <Chip key={c} compact selected={carat === c} onClick={() => setCarat(c)}>
                        {caratText(c)}
                      </Chip>
                    ))}
                    <Chip compact selected={carat === "unsure"} onClick={() => setCarat("unsure")}>
                      {cd.caratUnsure}
                    </Chip>
                  </div>
                </div>
              )}

              <div className="mb-10">
                <FieldLabel>{cd.metalColorLabel}</FieldLabel>
                <div className="grid grid-cols-3 gap-3">
                  {METAL_COLORS.map((id) => (
                    <Chip key={id} selected={metalColor === id} onClick={() => setMetalColor(id)}>
                      {cd.metalColors[id]}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <FieldLabel>{cd.metalKaratLabel}</FieldLabel>
                <div className="flex flex-wrap gap-3">
                  {KARATS.map((id) => (
                    <Chip key={id} compact selected={karat === id} onClick={() => setKarat(id)}>
                      {cd.metalKarats[id]}
                    </Chip>
                  ))}
                </div>
                <p className="text-xs text-beto-gray-light mt-3 leading-relaxed">{cd.metalKaratHint}</p>
              </div>

              <div className="mb-10">
                <FieldLabel>{cd.budgetLabel}</FieldLabel>
                <div className="flex flex-wrap gap-3">
                  {budgetOptions.map((b) => (
                    <Chip key={b} compact selected={budget === b} onClick={() => setBudget(b)}>
                      {b}
                    </Chip>
                  ))}
                </div>
                {isEngagement && stone === "natural" && (
                  <p className="text-xs text-beto-gray-light mt-3 leading-relaxed">{cd.naturalBudgetNote}</p>
                )}
              </div>

              <div className="mb-10">
                <FieldLabel optional={cd.timelineOpt}>{cd.timelineLabel}</FieldLabel>
                <div className="flex flex-wrap gap-3">
                  {cd.timelines.map((t) => (
                    <Chip key={t} compact selected={timeline === t} onClick={() => setTimeline(timeline === t ? "" : t)}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Estimate (before contact details) */}
          {step === 2 && (
            <motion.div key="step2" {...stepMotion}>
              <h2 className="font-display text-beto-black text-3xl font-light mb-2">{cd.step2Title}</h2>
              <p className="text-sm text-beto-gray mb-10">{cd.step2Desc}</p>

              {showPrice ? (
                <div className="bg-beto-black text-white p-8 sm:p-10 mb-8">
                  <p className="text-label text-beto-gold mb-4">{cd.estimateLabel}</p>
                  <div className="flex flex-col gap-2 mb-6">
                    {(fromPrices ?? []).map((p) => (
                      <div key={p.karat} className="font-display text-3xl sm:text-4xl font-light lining-nums">
                        <span className="text-white/60 text-base font-sans mr-2">{cd.estimateFrom}</span>
                        {money(p.price)}
                        <span className="text-white/60 text-base font-sans ml-2">
                          {cd.estimateIn.replace("{k}", cd.metalKarats[p.karat])}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed mb-3">{cd.estimateDisclaimer}</p>
                  <p className="text-xs text-beto-gold leading-relaxed">{cd.estimateIncludes}</p>
                </div>
              ) : hourPromise ? (
                <div className="bg-beto-black text-white p-8 sm:p-10 mb-8">
                  <Clock size={22} className="text-beto-gold mb-4" aria-hidden />
                  <h3 className="font-display text-2xl sm:text-3xl font-light mb-3">{cd.estimateHourTitle}</h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-4">
                    {images.length > 0 ? cd.estimateHourImage : cd.estimateHourGeneric}
                  </p>
                  <p className="text-xs text-beto-gold leading-relaxed">{cd.estimateIncludes}</p>
                </div>
              ) : (
                <div className="bg-beto-black text-white p-8 sm:p-10 mb-8">
                  <h3 className="font-display text-2xl sm:text-3xl font-light mb-3">{cd.estimateOtherTitle}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{cd.estimateOtherBody}</p>
                </div>
              )}

              <div className="bg-beto-white border border-beto-gray-subtle/40 divide-y divide-beto-gray-subtle/30 mb-8">
                {recap.map((row) => (
                  <div key={row.label} className="flex justify-between items-center gap-6 px-6 py-4">
                    <span className="text-xs font-medium tracking-wide text-beto-gray-light">{row.label}</span>
                    <span className="text-sm text-beto-black font-medium text-right">{row.value || "—"}</span>
                  </div>
                ))}
              </div>

              <div className="border border-beto-gray-subtle/40 bg-beto-white p-6 sm:p-8">
                <p className="text-label text-beto-gold mb-4">{cd.nextStepsTitle}</p>
                <ol className="flex flex-col gap-3">
                  {cd.nextSteps.map((s, i) => (
                    <li key={s} className="flex gap-3 text-sm text-beto-gray leading-relaxed">
                      <span className="text-beto-gold font-medium shrink-0">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Contact details + submit */}
          {step === 3 && (
            <motion.div key="step3" {...stepMotion}>
              <h2 className="font-display text-beto-black text-3xl font-light mb-2">{cd.step3Title}</h2>
              <p className="text-sm text-beto-gray mb-10">{cd.step3Desc}</p>
              <div className="flex flex-col gap-5">
                {[
                  { id: "fullName", label: cd.fullName, type: "text", value: fullName, set: setFullName, placeholder: cd.fullNamePlaceholder, autoComplete: "name" },
                  { id: "email", label: cd.emailAddress, type: "email", value: email, set: setEmail, placeholder: cd.emailPlaceholder, autoComplete: "email" },
                  { id: "phone", label: cd.phoneNumber, type: "tel", value: phone, set: setPhone, placeholder: cd.phonePlaceholder, autoComplete: "tel" },
                ].map((field) => (
                  <div key={field.id}>
                    <label htmlFor={`cd-${field.id}`} className="text-xs font-medium text-beto-black tracking-wide mb-2 block">
                      {field.label}
                    </label>
                    <input
                      id={`cd-${field.id}`}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      value={field.value}
                      onChange={(e) => field.set(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-5 py-4 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors"
                    />
                    {field.id === "phone" && phoneNeeded && (
                      <p className="text-xs text-beto-gray-light mt-2">{cd.phoneRequired}</p>
                    )}
                  </div>
                ))}

                <div>
                  <p className="text-xs font-medium text-beto-black tracking-wide mb-3">{cd.contactMethodLabel}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CONTACTS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setContact(id)}
                        aria-pressed={contact === id}
                        className={cn(
                          "px-4 py-3 border text-sm transition-all duration-200",
                          contact === id
                            ? "border-beto-gold bg-beto-gold/10 text-beto-black"
                            : "border-beto-gray-subtle bg-beto-white text-beto-gray hover:border-beto-gold/60"
                        )}
                      >
                        {cd.contacts[id]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Magnetic className="block w-full" strength={0.15}>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={status === "sending" || !isStepValid()}
                    className="w-full py-5 bg-beto-gold text-beto-black text-xs font-medium uppercase tracking-[0.2em] hover:bg-beto-gold-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "sending" ? cd.sending : cd.secureButton}
                  </button>
                </Magnetic>
                <p className="text-xs text-beto-gray-light mt-4 text-center">{cd.secureNote}</p>
                {status === "error" && (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mt-4 text-center">
                    {cd.errorMessage}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Booking right away */}
          {step === 4 && status === "success" && (
            <motion.div key="step4" {...stepMotion} className="flex flex-col gap-4">
              <p className="text-sm text-green-800 bg-green-50 border border-green-200 px-4 py-4 text-center">
                {successText}
              </p>
              <CalendlyNextStep
                name={fullName}
                email={email}
                fallback={hourPromise ? cd.successFallbackHour : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-beto-gray-subtle/40">
            <button
              type="button"
              onClick={() => goTo(Math.max(0, step - 1))}
              className={cn(
                "text-xs font-medium tracking-widest uppercase text-beto-gray hover:text-beto-black transition-colors",
                step === 0 && "invisible"
              )}
            >
              {cd.backButton}
            </button>

            {step < 3 && (
              <button
                type="button"
                onClick={() => goTo(step + 1)}
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
