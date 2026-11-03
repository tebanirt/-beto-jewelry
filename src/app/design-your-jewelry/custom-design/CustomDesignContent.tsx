"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { AlertCircle, Check, CheckCircle2, Clock, ExternalLink, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Magnetic from "@/components/ui/Magnetic";
import { useTranslation } from "@/hooks/useTranslation";
import { useStore } from "@/store/useStore";
import { trackMetaLead } from "@/lib/metaPixel";
import { trackFunnel } from "@/lib/funnel";
import {
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
  DEPOSIT_PAYMENT_URL,
  GOOGLE_REVIEW_URL,
} from "@/lib/constants";
import { submitLeadForm } from "@/lib/submitForm";
import {
  MAX_INSPIRATION_IMAGES,
  prepareImageAttachment,
  type LeadAttachment,
} from "@/lib/imageAttachments";
import {
  ENGAGEMENT_CARATS,
  lookupQuote,
  type EngagementCarat,
  type EngagementPriceTable,
  type MetalGrade,
  type PricedStone,
  type RingStyle,
} from "@/lib/engagementPricing";
import CalendlyNextStep, { buildCalendlyUrl } from "@/components/shared/CalendlyNextStep";

type Status = "idle" | "sending" | "success" | "error";
type StoneId = "natural" | "lab" | "gemstone" | "birthstone";
type GemId = (typeof GEM_TYPES)[number];
type MonthId = (typeof BIRTH_MONTHS)[number];
type LabColor = "white" | "colored";
type MetalColor = "yellow" | "white" | "rose" | "platinum";
type KaratChoice = "10k" | "14k" | "18k" | "unsure";
type LabShade = (typeof LAB_SHADES)[number];
// Cathedral versions are a style difference only: same price as the base style.
type StyleChoice =
  | RingStyle
  | "cathedral"
  | "cathedralHaloHalf"
  | "cathedralHaloThreeQuarter"
  | "unsure"
  | "other";
type CaratChoice = EngagementCarat | "unsure";
type ContactId = "email" | "phone" | "whatsapp" | "any";

// Lab-grown first: most chosen (The Knot 2026: 61 %) and the only stone with an instant price.
const STONES: StoneId[] = ["lab", "natural", "gemstone", "birthstone"];
// The only colored lab-grown diamond colors Rayane offers (3 nov. 2026).
const LAB_SHADES = ["pink", "yellow", "blue", "champagne", "green"] as const;
const LAB_SHADE_SWATCH: Record<LabShade, string> = {
  pink: "linear-gradient(135deg, #f7d3dd, #e79ab0)",
  yellow: "linear-gradient(135deg, #fbecb0, #f0c94a)",
  blue: "linear-gradient(135deg, #cfe2f8, #7fa9e0)",
  champagne: "linear-gradient(135deg, #f3e3c8, #d4b184)",
  green: "linear-gradient(135deg, #d4efd9, #8cc79a)",
};
const GEM_TYPES = ["sapphire", "ruby", "emerald", "morganite", "aquamarine", "tanzanite", "alexandrite", "spinel", "tourmaline", "other"] as const;
const BIRTH_MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;
const LAB_COLORS: LabColor[] = ["white", "colored"];
const METAL_COLORS: MetalColor[] = ["yellow", "white", "rose", "platinum"];
const METAL_SWATCH: Record<MetalColor, string> = {
  yellow: "linear-gradient(135deg, #f6e3a8, #c9a253)",
  white: "linear-gradient(135deg, #fafaf8, #c8c8c4)",
  rose: "linear-gradient(135deg, #f5d2c4, #c98c75)",
  platinum: "linear-gradient(135deg, #eef0f3, #a9b0b8)",
};
const KARATS: KaratChoice[] = ["14k", "18k", "unsure"];
// Grillz are also made in 10K (Rayane, 3 nov. 2026).
const KARATS_GRILLZ: KaratChoice[] = ["10k", "14k", "18k", "unsure"];
// Shown in pairs: each style next to its cathedral version.
const STYLE_CHOICES: StyleChoice[] = [
  "solitaire",
  "cathedral",
  "haloHalf",
  "cathedralHaloHalf",
  "haloThreeQuarter",
  "cathedralHaloThreeQuarter",
  "unsure",
  "other",
];
/** 3D renders of Rayane's CAD parts, in public/images/form-styles/{name}-{metal}.webp. */
const STYLE_IMAGES: Partial<Record<StyleChoice, string>> = {
  solitaire: "solitaire",
  cathedral: "cathedral",
  haloHalf: "hidden-halo-half",
  cathedralHaloHalf: "cathedral-hidden-halo-half",
  haloThreeQuarter: "hidden-halo-three-quarter",
  cathedralHaloThreeQuarter: "cathedral-hidden-halo-three-quarter",
};
/** Style used for the price ("other" has no instant price: Rayane quotes it). */
const PRICE_STYLE: Record<StyleChoice, RingStyle | "unsure" | null> = {
  solitaire: "solitaire",
  cathedral: "solitaire",
  haloHalf: "haloHalf",
  cathedralHaloHalf: "haloHalf",
  haloThreeQuarter: "haloThreeQuarter",
  cathedralHaloThreeQuarter: "haloThreeQuarter",
  unsure: "unsure",
  other: null,
};
const CONTACTS: ContactId[] = ["email", "phone", "whatsapp", "any"];
const CARAT_CHOICES: CaratChoice[] = [...ENGAGEMENT_CARATS, "unsure"];
const ENGAGEMENT_INDEX = 0;
// Language-neutral ids for the funnel data (same order as cd.projectTypes).
const PROJECT_IDS = ["engagement", "wedding_band", "necklace", "pendant", "earrings", "bracelet", "grillz", "other"];
const GRILLZ_INDEX = 6;
const CONTACT_STEP = 3;
const SUCCESS_STEP = 4;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DRAFT_KEY = "beto-custom-design-draft-v1";
const CONTACT_FORM_ID = "cd-contact-form";

type Draft = {
  projectIndex: number | null;
  stone: StoneId | null;
  labColor: LabColor | null;
  labShade: LabShade | null;
  gemType: GemId | null;
  birthMonths: MonthId[];
  shape: string;
  carat: CaratChoice | null;
  ringStyle: StyleChoice | null;
  ringStyleOther: string;
  metalColor: MetalColor | null;
  karat: KaratChoice | null;
  budget: string;
  timeline: string;
  notes: string;
  fullName: string;
  email: string;
  phone: string;
  contact: ContactId | null;
};

const EMPTY_DRAFT: Draft = {
  projectIndex: null,
  stone: null,
  labColor: null,
  labShade: null,
  gemType: null,
  birthMonths: [],
  shape: "",
  carat: null,
  ringStyle: null,
  ringStyleOther: "",
  metalColor: null,
  karat: null,
  budget: "",
  timeline: "",
  notes: "",
  fullName: "",
  email: "",
  phone: "",
  contact: null,
};

function oneOf<T>(value: unknown, allowed: readonly T[]): T | null {
  return allowed.includes(value as T) ? (value as T) : null;
}
const str = (value: unknown) => (typeof value === "string" ? value.slice(0, 2000) : "");

/** Restores a saved draft defensively: anything unexpected falls back to empty. */
function readDraft(projectCount: number): { draft: Draft; step: number } | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { draft?: Record<string, unknown>; step?: unknown };
    const d = saved.draft ?? {};
    const projectIndex =
      typeof d.projectIndex === "number" && d.projectIndex >= 0 && d.projectIndex < projectCount
        ? d.projectIndex
        : null;
    const draft: Draft = {
      projectIndex,
      stone: oneOf(d.stone, STONES),
      labColor: oneOf(d.labColor, LAB_COLORS),
      labShade: oneOf(d.labShade, LAB_SHADES),
      gemType: oneOf(d.gemType, GEM_TYPES),
      birthMonths: Array.isArray(d.birthMonths)
        ? BIRTH_MONTHS.filter((m) => (d.birthMonths as unknown[]).includes(m))
        : [],
      shape: str(d.shape),
      carat: oneOf(d.carat, CARAT_CHOICES),
      ringStyle: oneOf(d.ringStyle, STYLE_CHOICES),
      ringStyleOther: str(d.ringStyleOther),
      metalColor: oneOf(d.metalColor, METAL_COLORS),
      karat: oneOf(d.karat, KARATS_GRILLZ),
      budget: str(d.budget),
      timeline: str(d.timeline),
      notes: str(d.notes),
      fullName: str(d.fullName),
      email: str(d.email),
      phone: str(d.phone),
      contact: oneOf(d.contact, CONTACTS),
    };
    const step =
      typeof saved.step === "number" && saved.step >= 0 && saved.step <= CONTACT_STEP ? saved.step : 0;
    return { draft, step: draft.projectIndex === null ? 0 : step };
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // storage unavailable (private mode): nothing to clear
  }
}

type InspirationImage = LeadAttachment & { id: string; previewUrl: string };

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-beto-black";
const pressable =
  "cursor-pointer select-none touch-manipulation [-webkit-tap-highlight-color:transparent] active:scale-[0.98] motion-reduce:active:scale-100";
const inputClass =
  "w-full min-h-[52px] px-5 py-3.5 border bg-beto-white text-base sm:text-sm text-beto-black placeholder:text-beto-gray-light transition-[border-color,box-shadow] duration-200 focus:outline-none";
const inputIdle =
  "border-beto-gray-subtle focus:border-beto-black focus:shadow-[inset_0_0_0_1px_var(--color-beto-black)]";

function Chip({
  selected,
  onClick,
  children,
  compact = false,
  tile = false,
  icon,
  swatch,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  compact?: boolean;
  /** Square tile with an icon above the label (stone shapes). */
  tile?: boolean;
  icon?: ReactNode;
  /** CSS background for a small color dot before the label (metals, colors). */
  swatch?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative border transition-[border-color,background-color,box-shadow,color,transform] duration-200 ease-out",
        pressable,
        focusRing,
        tile
          ? "min-h-[76px] w-full px-1.5 py-2.5 flex flex-col items-center justify-center gap-1.5 text-[11px] sm:text-xs font-medium text-center leading-tight"
          : compact
            ? "min-h-11 px-4 py-2 text-xs font-medium tracking-wide whitespace-nowrap inline-flex items-center gap-2"
            : cn("min-h-14 w-full pl-4 pr-10 py-3.5 text-sm text-left", swatch && "flex items-center gap-3"),
        selected
          ? "border-beto-gold bg-beto-gold/10 text-beto-black shadow-[inset_0_0_0_1px_var(--color-beto-gold)]"
          : "border-beto-gray-subtle bg-beto-white text-beto-gray hover:border-beto-gold/60 hover:text-beto-black"
      )}
    >
      {icon && (
        <span aria-hidden className={cn("transition-colors duration-200", selected ? "text-beto-black" : "text-beto-gray")}>
          {icon}
        </span>
      )}
      {swatch && (
        <span
          aria-hidden
          className="h-4 w-4 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]"
          style={{ background: swatch }}
        />
      )}
      {swatch || icon ? <span className="min-w-0">{children}</span> : children}
      {!compact && !tile && (
        <span
          aria-hidden
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-beto-black text-white transition-[opacity,transform] duration-200 ease-out",
            selected ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
        >
          <Check size={12} strokeWidth={2.5} />
        </span>
      )}
    </button>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-xs text-red-700 mt-3 leading-relaxed">
      <AlertCircle size={14} className="shrink-0 mt-px" aria-hidden />
      {message}
    </p>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-4 text-label text-beto-black mb-6 mt-2 after:h-px after:flex-1 after:bg-beto-gray-subtle after:content-['']">
      {children}
    </h3>
  );
}

/** Outline of each stone shape, in the same order as cd.shapes. */
const shapeSvg = (children: ReactNode) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
    {children}
  </svg>
);
const SHAPE_ICONS: ReactNode[] = [
  // Round
  shapeSvg(<><circle cx="12" cy="12" r="8.5" /><polygon points="12,6.5 16,8.5 17.5,12 16,15.5 12,17.5 8,15.5 6.5,12 8,8.5" /></>),
  // Oval
  shapeSvg(<><ellipse cx="12" cy="12" rx="6" ry="9" /><ellipse cx="12" cy="12" rx="3.2" ry="5.2" /></>),
  // Cushion
  shapeSvg(<><rect x="3.8" y="3.8" width="16.4" height="16.4" rx="5" /><rect x="7.6" y="7.6" width="8.8" height="8.8" rx="2.5" /></>),
  // Emerald
  shapeSvg(<><polygon points="8.5,3 15.5,3 18.5,6 18.5,18 15.5,21 8.5,21 5.5,18 5.5,6" /><polygon points="9.8,6.5 14.2,6.5 15.5,7.8 15.5,16.2 14.2,17.5 9.8,17.5 8.5,16.2 8.5,7.8" /></>),
  // Radiant
  shapeSvg(<><polygon points="7.5,4 16.5,4 19,6.5 19,17.5 16.5,20 7.5,20 5,17.5 5,6.5" /><path d="M5 6.5 19 17.5M19 6.5 5 17.5" /></>),
  // Pear
  shapeSvg(<><path d="M12 2.8C15.8 7.4 18.5 11 18.5 14.6a6.5 6.5 0 0 1-13 0C5.5 11 8.2 7.4 12 2.8Z" /><path d="M12 8.2c2 2.6 3.2 4.6 3.2 6.6a3.2 3.2 0 0 1-6.4 0c0-2 1.2-4 3.2-6.6Z" /></>),
  // Marquise
  shapeSvg(<><path d="M12 2.2C16.8 6.6 16.8 17.4 12 21.8 7.2 17.4 7.2 6.6 12 2.2Z" /><path d="M12 6.8c2.2 2.4 2.2 8 0 10.4-2.2-2.4-2.2-8 0-10.4Z" /></>),
  // Princess
  shapeSvg(<><rect x="4.5" y="4.5" width="15" height="15" /><path d="M4.5 4.5 19.5 19.5M19.5 4.5 4.5 19.5" /></>),
  // Asscher
  shapeSvg(<><polygon points="8,4 16,4 20,8 20,16 16,20 8,20 4,16 4,8" /><polygon points="9.6,7.6 14.4,7.6 16.4,9.6 16.4,14.4 14.4,16.4 9.6,16.4 7.6,14.4 7.6,9.6" /></>),
  // Heart
  shapeSvg(<><path d="M12 20.2C5.6 15.6 3.2 12 3.2 8.9A4.4 4.4 0 0 1 12 7.1a4.4 4.4 0 0 1 8.8 1.8c0 3.1-2.4 6.7-8.8 11.3Z" /></>),
];

function ChoiceGroup({
  id,
  legend,
  optional,
  error,
  children,
}: {
  id: string;
  legend: ReactNode;
  optional?: string;
  error?: string;
  children: ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <fieldset id={`field-${id}`} aria-describedby={error ? errorId : undefined} className="mb-10 min-w-0">
      <legend className="text-xs font-medium text-beto-black tracking-wide mb-4">
        {legend} {optional && <span className="text-beto-gray/80 font-normal">{optional}</span>}
      </legend>
      {children}
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}

/** Progressive disclosure: sub-choices fade in instead of popping into place. */
function Reveal({ show, id, children }: { show: boolean; id: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE_OUT } }}
          exit={{ opacity: 0, transition: { duration: 0.12, ease: EASE_IN } }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function CustomDesignContent({ priceTable }: { priceTable: EngagementPriceTable | null }) {
  const tr = useTranslation();
  const cd = tr.pages.customDesign;
  const language = useStore((s) => s.language);
  const reduceMotion = useReducedMotion();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [crmRef, setCrmRef] = useState("");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [restored, setRestored] = useState(false);
  const [attempted, setAttempted] = useState<Record<number, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [images, setImages] = useState<InspirationImage[]>([]);
  const [preparing, setPreparing] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  const formTopRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<InspirationImage[]>([]);
  const pendingFocus = useRef(false);

  const d = draft;
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((prev) => ({ ...prev, [key]: value }));
  /** Same as set(), for answer chips: also records the choice (ids only, never free text). */
  const pick = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    trackFunnel("choice", step, { field: String(key), value: String(value ?? "") });
    set(key, value);
  };

  // Draft kept for the session: a reload, or a trip back from Instagram's
  // in-app browser, doesn't wipe the visitor's choices. Images aren't kept.
  useEffect(() => {
    const saved = readDraft(cd.projectTypes.length);
    if (saved) {
      // Restoring persisted browser state once, after mount (avoids a hydration mismatch).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(saved.draft);
      setStep(saved.step);
    }
    setRestored(true);
    trackFunnel("view", saved?.step ?? 0, { restored: !!saved });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restored || status === "success") return;
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, step }));
    } catch {
      // storage unavailable: the form still works, just without the draft
    }
  }, [draft, step, restored, status]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Free the preview URLs when the visitor leaves the page.
  useEffect(() => () => imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl)), []);

  // Each new step's heading takes focus, so keyboard and screen-reader users
  // start at the top of the step, not on a button that no longer exists.
  const headingRef = useCallback((el: HTMLHeadingElement | null) => {
    if (el && pendingFocus.current) {
      pendingFocus.current = false;
      el.focus({ preventScroll: true });
    }
  }, []);

  // ── Funnel: which step people reach, and where they leave ──
  const stepRef = useRef(step);
  const statusRef = useRef(status);
  const stepStartedAt = useRef(0);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    if (!restored) return;
    stepRef.current = step;
    stepStartedAt.current = Date.now();
    trackFunnel("step_view", step);
  }, [step, restored]);
  useEffect(() => {
    let sentForThisHide = false;
    const onHide = () => {
      if (document.visibilityState === "visible") {
        sentForThisHide = false;
        return;
      }
      if (sentForThisHide || statusRef.current === "success") return;
      sentForThisHide = true;
      trackFunnel("leave", stepRef.current, { secs: Math.round((Date.now() - stepStartedAt.current) / 1000) });
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, []);
  const trackChoice = (field: string, value: string | number) =>
    trackFunnel("choice", stepRef.current, { field, value: String(value) });

  const isEngagement = d.projectIndex === ENGAGEMENT_INDEX;
  const isDiamond = d.stone === "natural" || d.stone === "lab";
  const askCarat = isEngagement && isDiamond;

  // Instant price: lab-grown engagement rings only, without an inspiration image
  // (a specific inspiration is priced by Rayane himself).
  const pricedStone: PricedStone | null =
    d.stone === "lab" && d.labColor ? (d.labColor === "colored" ? "labColored" : "lab") : null;
  // Platinum has no karat; 10K is for grillz only and never priced.
  const metalGrade: MetalGrade | "unsure" | null =
    d.metalColor === "platinum" ? "platinum" : d.karat === "10k" ? null : d.karat;
  const quote =
    isEngagement && images.length === 0
      ? lookupQuote(
          priceTable,
          pricedStone,
          typeof d.carat === "number" ? d.carat : null,
          d.ringStyle ? PRICE_STYLE[d.ringStyle] : null,
          metalGrade
        )
      : null;
  const showPrice = quote !== null;
  // Otherwise: lab-grown engagement ring → price within the hour (9 h–21 h);
  // natural or other stone, and every other piece → quote within 24 h.
  const responseMode: "price" | "hour" | "day" = showPrice
    ? "price"
    : isEngagement && d.stone === "lab"
      ? "hour"
      : "day";
  const hourPromise = responseMode === "hour";
  // The budget question is useless when the visitor gets an instant price
  // (lab-grown engagement ring, a listed style, no inspiration image).
  const budgetNeeded = !(
    isEngagement && d.stone === "lab" && !!priceTable && d.ringStyle !== "other" && d.carat !== "unsure" && images.length === 0
  );

  useEffect(() => {
    if (step !== 2) return;
    trackFunnel("price_shown", 2, {
      mode: responseMode,
      price: quote?.prices[0]?.price ?? 0,
      from: !!quote?.startingFrom,
      project: d.projectIndex !== null ? PROJECT_IDS[d.projectIndex] ?? "" : "",
      stone: pricedStone ?? d.stone ?? "",
      carat: String(d.carat ?? ""),
      style: d.ringStyle ?? "",
      karat: metalGrade ?? "",
    });
    // Only when the estimate step is shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const budgetOptions: readonly string[] =
    isEngagement && d.stone === "natural"
      ? cd.budgetsNatural
      : isEngagement && d.stone === "lab"
        ? cd.budgetsLab
        : cd.budgets;

  const money = (n: number) =>
    new Intl.NumberFormat(language === "fr" ? "fr-CA" : "en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(n);
  const priceText = quote
    ? quote.prices.map((p) => `${money(p.price)} ${cd.estimateIn.replace("{k}", cd.gradeLabels[p.karat])}`).join(" · ")
    : "";
  // Live price while choosing (step 2 of 5), like a ring builder's running total.
  const showLivePrice = step === 1 && isEngagement && d.stone === "lab";
  const livePriceText =
    images.length > 0
      ? cd.livePriceImage
      : d.ringStyle === "other"
        ? cd.livePriceOther
      : quote
        ? quote.prices.length > 1 || quote.startingFrom
          ? `${cd.estimateFrom} ${money(Math.min(...quote.prices.map((p) => p.price)))}`
          : `${money(quote.prices[0].price)} ${cd.estimateIn.replace("{k}", cd.gradeLabels[quote.prices[0].karat])}`
        : cd.livePriceHint;
  const caratText = (c: EngagementCarat) => `${language === "fr" ? String(c).replace(".", ",") : c} ct`;

  // Labels used in the recap and in Rayane's email.
  const projectLabel = d.projectIndex !== null ? cd.projectTypes[d.projectIndex] : "";
  const stoneLabel = d.stone
    ? d.stone === "lab" && d.labColor === "colored"
      ? `${cd.labColorOptions.colored}${d.labShade ? ` (${cd.labShades[d.labShade].toLowerCase()})` : ""}`
      : d.stone === "lab" && d.labColor === "white"
        ? `${cd.stoneOptions.lab}, ${cd.labColorOptions.white.toLowerCase()}`
        : d.stone === "gemstone" && d.gemType
          ? `${cd.stoneOptions.gemstone} : ${cd.gemTypes[d.gemType]}`
          : d.stone === "birthstone" && d.birthMonths.length > 0
            ? `${cd.stoneOptions.birthstone} : ${d.birthMonths
                .map((m) => `${cd.birthMonths[m].month} (${cd.birthMonths[m].stone.toLowerCase()})`)
                .join(", ")}`
            : cd.stoneOptions[d.stone]
    : "";

  function toggleMonth(m: MonthId) {
    trackFunnel("choice", stepRef.current, { field: "birthMonths", value: m });
    setDraft((prev) => ({
      ...prev,
      birthMonths: prev.birthMonths.includes(m)
        ? prev.birthMonths.filter((x) => x !== m)
        : BIRTH_MONTHS.filter((x) => x === m || prev.birthMonths.includes(x)),
    }));
  }
  const caratLabel = d.carat === null ? "" : d.carat === "unsure" ? cd.caratUnsure : caratText(d.carat);
  const styleLabel = !d.ringStyle
    ? ""
    : d.ringStyle === "other"
      ? `${cd.ringStyles.other.label}${d.ringStyleOther.trim() ? ` : ${d.ringStyleOther.trim()}` : ""}`
      : cd.ringStyles[d.ringStyle].label;
  const metalLabel = [
    d.metalColor ? cd.metalColors[d.metalColor] : "",
    d.metalColor !== "platinum" && d.karat ? (d.karat === "unsure" ? cd.karatToConfirm : cd.metalKarats[d.karat]) : "",
  ]
    .filter(Boolean)
    .join(d.karat === "unsure" ? ", " : " ");

  function chooseProject(index: number) {
    trackChoice("project", PROJECT_IDS[index] ?? String(index));
    setDraft((prev) => ({
      ...prev,
      projectIndex: index,
      carat: index === ENGAGEMENT_INDEX ? prev.carat : null,
      ringStyle: index === ENGAGEMENT_INDEX ? prev.ringStyle : null,
      karat: prev.karat === "10k" && index !== GRILLZ_INDEX ? null : prev.karat,
      budget: prev.projectIndex === index ? prev.budget : "",
    }));
    // One tap is enough on the first step: move on once the choice is visible.
    if (step === 0) window.setTimeout(() => goTo(1), reduceMotion ? 0 : 280);
  }

  function chooseStone(next: StoneId) {
    trackChoice("stone", next);
    setDraft((prev) => ({
      ...prev,
      stone: next,
      // White preselected: 83 % of center stones are colorless (The Knot 2026).
      labColor: next === "lab" ? (prev.labColor ?? "white") : null,
      labShade: next === "lab" ? prev.labShade : null,
      gemType: next === "gemstone" ? prev.gemType : null,
      birthMonths: next === "birthstone" ? prev.birthMonths : [],
      carat: isEngagement && (next === "natural" || next === "lab") ? prev.carat : null,
      // Budget ranges differ by stone for engagement rings.
      budget: prev.stone === next ? prev.budget : "",
    }));
  }

  function chooseMetal(next: MetalColor) {
    trackChoice("metalColor", next);
    // Platinum has no karat; a 10K choice is cleared when leaving grillz elsewhere.
    setDraft((prev) => ({ ...prev, metalColor: next, karat: next === "platinum" ? null : prev.karat }));
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
        trackFunnel("image_added", stepRef.current, { type: prepared.contentType });
      } catch {
        setUploadMessage(cd.uploadError);
        trackFunnel("image_error", stepRef.current, { type: file.type || "unknown" });
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

  const phoneNeeded = d.contact === "phone" || d.contact === "whatsapp";

  /** Missing answers for a step, in on-screen order: [field id, message]. */
  function stepErrors(s: number): [string, string][] {
    const errors: [string, string][] = [];
    if (s === 0 && d.projectIndex === null) errors.push(["project", cd.errorChoose]);
    if (s === 1) {
      if (!d.stone) errors.push(["stone", cd.errorChoose]);
      else if (d.stone === "lab" && !d.labColor) errors.push(["labColor", cd.errorChoose]);
      else if (d.stone === "lab" && d.labColor === "colored" && !d.labShade) errors.push(["labShade", cd.errorChoose]);
      else if (d.stone === "gemstone" && !d.gemType) errors.push(["gemType", cd.errorChoose]);
      else if (d.stone === "birthstone" && d.birthMonths.length === 0) errors.push(["birthMonths", cd.errorChoose]);
      if (askCarat && d.carat === null) errors.push(["carat", cd.errorChoose]);
      if (isEngagement && d.stone && !d.ringStyle) errors.push(["ringStyle", cd.errorChoose]);
      else if (isEngagement && d.ringStyle === "other" && !d.ringStyleOther.trim())
        errors.push(["ringStyleOther", cd.errorStyleOther]);
      if (!d.metalColor) errors.push(["metalColor", cd.errorChoose]);
      if (!d.karat && d.metalColor !== "platinum") errors.push(["karat", cd.errorChoose]);
      if (budgetNeeded && !d.budget) errors.push(["budget", cd.errorChoose]);
    }
    if (s === CONTACT_STEP) {
      if (!d.fullName.trim()) errors.push(["fullName", cd.errorName]);
      if (!EMAIL_RE.test(d.email.trim())) errors.push(["email", cd.errorEmail]);
      if (phoneNeeded && d.phone.replace(/\D/g, "").length < 10) errors.push(["phone", cd.errorPhone]);
    }
    return errors;
  }

  const currentErrors = stepErrors(step);
  // Errors show after a Continue attempt, or after leaving a filled contact
  // field: never while the visitor is still typing.
  const errorFor = (key: string) => {
    const hit = currentErrors.find(([k]) => k === key);
    if (!hit) return undefined;
    return attempted[step] || touched[key] ? hit[1] : undefined;
  };

  function scrollToFormTop() {
    const top = formTopRef.current?.getBoundingClientRect().top;
    if (top !== undefined && top < 0) {
      formTopRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  }

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    pendingFocus.current = true;
    setStep(next);
    scrollToFormTop();
  }

  function focusFirstError(errors: [string, string][]) {
    const first = errors[0]?.[0];
    if (!first) return;
    const field = document.getElementById(`field-${first}`);
    const control = field?.matches("input, textarea")
      ? field
      : field?.querySelector<HTMLElement>("button, input, textarea");
    control?.focus({ preventScroll: true });
    field?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  function handleContinue() {
    const errors = stepErrors(step);
    if (errors.length > 0) {
      setAttempted((a) => ({ ...a, [step]: true }));
      trackFunnel("blocked", step, { fields: errors.map(([k]) => k).join(",") });
      focusFirstError(errors);
      return;
    }
    goTo(step + 1);
  }

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (status === "sending") return;
    const errors = stepErrors(CONTACT_STEP);
    if (errors.length > 0) {
      setAttempted((a) => ({ ...a, [CONTACT_STEP]: true }));
      trackFunnel("blocked", CONTACT_STEP, { fields: errors.map(([k]) => k).join(",") });
      focusFirstError(errors);
      return;
    }
    trackFunnel("submit", CONTACT_STEP, { mode: responseMode, images: images.length });
    setStatus("sending");
    const shownPrice = showPrice ? `${quote?.startingFrom ? `${cd.estimateFrom} ` : ""}${priceText}` : "";
    const fields: Record<string, string> = {
      "Type de projet": projectLabel,
      "Pierre": stoneLabel,
      "Forme": d.shape,
      "Carat (pierre centrale)": caratLabel,
      "Style de monture": isEngagement && d.ringStyle ? styleLabel : "",
      "Métal": metalLabel,
      "Budget": budgetNeeded ? d.budget : "",
      "Échéancier": d.timeline,
      "Notes": d.notes,
      "Images d'inspiration": images.length > 0 ? `${images.length} en pièce jointe` : "",
      "Prix affiché au client": shownPrice,
      "Réponse promise au client":
        responseMode === "hour"
          ? "Prix en moins d'une heure (9 h à 21 h)"
          : responseMode === "day"
            ? "Soumission en 24 h maximum"
            : "",
      "Nom complet": d.fullName.trim(),
      "Courriel": d.email.trim(),
      "Téléphone": d.phone.trim(),
      "Méthode de contact préférée": d.contact ? cd.contacts[d.contact] : "",
      "Langue": language === "fr" ? "Français" : "Anglais",
      email: d.email.trim(),
    };

    const ok = await submitLeadForm("custom-design", fields, {
      attachments: images.map(({ filename, contentType, content }) => ({ filename, contentType, content })),
      priority: responseMode === "hour" ? "1h" : responseMode === "day" ? "24h" : undefined,
      onRef: setCrmRef,
    });
    if (ok) {
      clearDraft();
      setStatus("success");
      trackMetaLead("custom-design");
      trackFunnel("submit_ok", CONTACT_STEP, { mode: responseMode });
      goTo(SUCCESS_STEP);
    } else {
      setStatus("error");
      trackFunnel("submit_error", CONTACT_STEP);
    }
  }

  const sl = cd.summaryLabels;
  const recap = [
    { label: sl.projectType, value: projectLabel },
    { label: sl.stone, value: stoneLabel },
    { label: sl.shape, value: d.shape || sl.notSpecified },
    ...(askCarat ? [{ label: sl.carat, value: caratLabel }] : []),
    ...(isEngagement && d.ringStyle ? [{ label: sl.style, value: styleLabel }] : []),
    { label: sl.metal, value: metalLabel },
    ...(budgetNeeded ? [{ label: sl.budget, value: d.budget }] : []),
    { label: sl.timeline, value: d.timeline || sl.notSpecified },
    ...(images.length > 0 ? [{ label: sl.images, value: String(images.length) }] : []),
  ];

  const successText = showPrice
    ? cd.successPrice.replace("{price}", `${quote?.startingFrom ? `${cd.estimateFrom.toLowerCase()} ` : ""}${priceText}`)
    : hourPromise
      ? cd.successHour
      : cd.successDay;

  // Forward slides in from the right, Back from the left; exit is quicker than
  // enter. Reduced motion: a short crossfade only.
  const stepVariants: Variants = {
    enter: (dir: number) => ({ opacity: 0, x: reduceMotion ? 0 : 28 * dir }),
    center: { opacity: 1, x: 0, transition: { duration: reduceMotion ? 0.15 : 0.38, ease: EASE_OUT } },
    exit: (dir: number) => ({
      opacity: 0,
      x: reduceMotion ? 0 : -20 * dir,
      transition: { duration: reduceMotion ? 0.1 : 0.2, ease: EASE_IN },
    }),
  };

  const totalSteps = cd.steps.length;
  // Step 3 is an estimate for engagement rings, a summary + deposit for other pieces.
  const stepLabels = cd.steps.map((s, i) => (i === 2 && d.projectIndex !== null && !isEngagement ? cd.stepSummary : s));
  const progress = step / (totalSteps - 1);
  const stepHeading = "font-display text-beto-black text-3xl font-light mb-2 text-balance outline-none";

  // Stripe Payment Link: email prefilled, and the CRM id so the payment is
  // matched to this client automatically (client_reference_id).
  const depositHref = (() => {
    if (!DEPOSIT_PAYMENT_URL) return "";
    const params = new URLSearchParams();
    if (d.email.trim()) params.set("prefilled_email", d.email.trim());
    if (crmRef) params.set("client_reference_id", crmRef);
    const qs = params.toString();
    return qs ? `${DEPOSIT_PAYMENT_URL}${DEPOSIT_PAYMENT_URL.includes("?") ? "&" : "?"}${qs}` : DEPOSIT_PAYMENT_URL;
  })();
  // A real Google review (from the site's testimonials), shown next to the estimate.
  const review = tr.testimonials.items[1] ?? tr.testimonials.items[0];
  const [helpBefore, helpAfter] = cd.helpLine.split("{phone}");
  const helpLine = (
    <p className="text-xs text-beto-gray/80 mt-10 leading-relaxed">
      {helpBefore}
      <a href={`tel:${BUSINESS_PHONE_TEL}`} className={cn("text-beto-black underline underline-offset-2 whitespace-nowrap", focusRing)}>
        {BUSINESS_PHONE_DISPLAY}
      </a>
      {helpAfter}
    </p>
  );
  const trustRow = (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-beto-gray">
      {cd.trustItems.map((t) => (
        <li key={t} className="inline-flex items-center gap-1.5">
          <Check size={12} className="text-beto-gold-dark shrink-0" aria-hidden />
          {t}
        </li>
      ))}
      <li>
        <a
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("inline-flex items-center gap-1 underline underline-offset-2 hover:text-beto-black", focusRing)}
        >
          {cd.reviewsLink}
          <ExternalLink size={11} aria-hidden />
        </a>
      </li>
    </ul>
  );

  const textFields = [
    { id: "fullName", label: cd.fullName, type: "text", placeholder: cd.fullNamePlaceholder, autoComplete: "name", required: true, inputMode: "text" },
    { id: "email", label: cd.emailAddress, type: "email", placeholder: cd.emailPlaceholder, autoComplete: "email", required: true, inputMode: "email" },
    { id: "phone", label: cd.phoneNumber, type: "tel", placeholder: cd.phonePlaceholder, autoComplete: "tel", required: phoneNeeded, inputMode: "tel" },
  ] as const;

  return (
    <div className="min-h-screen bg-beto-offwhite" style={{ paddingTop: "var(--nav-height)" }}>
      {/* Header */}
      <div className="bg-beto-black py-7 sm:py-12 px-6 text-center">
        <p className="text-label text-beto-gold mb-2 sm:mb-3">{cd.eyebrow}</p>
        <h1 className="font-display text-white text-3xl sm:text-4xl lg:text-5xl font-light text-balance">{cd.title}</h1>
        <p className="hidden sm:block text-white/70 text-sm mt-3 max-w-md mx-auto leading-relaxed">{cd.subtitle}</p>
      </div>

      {/* Progress */}
      <div className="bg-beto-white border-b border-beto-gray-subtle/40">
        <div className="container-beto py-5">
          <ol className="flex items-center justify-between max-w-2xl mx-auto" aria-label={cd.title}>
            {stepLabels.map((s, i) => (
              <li key={i} className="flex items-center gap-2" aria-current={i === step ? "step" : undefined}>
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-[background-color,color,transform] duration-300 shrink-0",
                    i < step
                      ? "bg-beto-gold text-beto-black"
                      : i === step
                        ? "bg-beto-black text-white scale-110"
                        : "bg-beto-gray-subtle text-beto-gray"
                  )}
                >
                  {i < step ? <Check size={12} aria-hidden /> : i + 1}
                  {i < step && <span className="sr-only">{i + 1}</span>}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden md:block transition-colors duration-300",
                    i === step ? "text-beto-black" : "text-beto-gray/80"
                  )}
                >
                  {s}
                </span>
                {i < totalSteps - 1 && (
                  <div className="h-px flex-1 min-w-[12px] sm:min-w-[32px] bg-beto-gray-subtle overflow-hidden" aria-hidden>
                    <div
                      className="h-full bg-beto-gold origin-left transition-transform duration-500 ease-out"
                      style={{ transform: `scaleX(${i < step ? 1 : 0})` }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ol>
          <p className="md:hidden text-center text-xs text-beto-gray mt-3" aria-live="polite">
            {cd.stepOf.replace("{n}", String(step + 1)).replace("{total}", String(totalSteps))} · {stepLabels[step]}
          </p>
        </div>
        <div className="h-0.5 bg-beto-gray-subtle/60" aria-hidden>
          <div
            className="h-full bg-beto-gold origin-left transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </div>

      {/* Form */}
      <div
        ref={formTopRef}
        className="container-beto pt-14 pb-10 md:py-16 max-w-3xl mx-auto"
        style={{ scrollMarginTop: "var(--nav-height)" }}
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={`step-${step}`}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {/* STEP 0: Project type + inspiration */}
            {step === 0 && (
              <>
                <h2 ref={headingRef} tabIndex={-1} className={stepHeading}>{cd.step0Title}</h2>
                <p className="text-sm text-beto-gray mb-3">{cd.step0Desc}</p>
                <p className="inline-flex items-center gap-2 text-xs text-beto-gray mb-10">
                  <Clock size={13} className="text-beto-gold-dark" aria-hidden />
                  {cd.timeHint}
                </p>

                <fieldset
                  id="field-project"
                  aria-describedby={errorFor("project") ? "project-error project-help" : "project-help"}
                  className="mb-12 min-w-0"
                >
                  <legend className="sr-only">{cd.step0Title}</legend>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {cd.projectTypes.map((type, i) => {
                      const selected = d.projectIndex === i;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => chooseProject(i)}
                          aria-pressed={selected}
                          className={cn(
                            "relative flex flex-col border text-left transition-[border-color,box-shadow] duration-200 ease-out",
                            pressable,
                            focusRing,
                            selected
                              ? "border-beto-gold shadow-[inset_0_0_0_1px_var(--color-beto-gold)]"
                              : "border-beto-gray-subtle hover:border-beto-gold/60"
                          )}
                        >
                          <Image
                            src={`/images/form-projects/${PROJECT_IDS[i] ?? "other"}.webp`}
                            alt=""
                            width={320}
                            height={320}
                            sizes="(max-width: 640px) 45vw, 200px"
                            priority={i < 2}
                            className="w-full h-auto aspect-[4/3] object-cover bg-beto-white"
                          />
                          <span
                            className={cn(
                              "flex-1 px-3 py-3 text-sm font-medium leading-snug text-beto-black transition-colors duration-200",
                              selected ? "bg-beto-gold/10" : "bg-beto-white"
                            )}
                          >
                            {type}
                          </span>
                          <span
                            aria-hidden
                            className={cn(
                              "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-beto-black text-white transition-[opacity,transform] duration-200 ease-out",
                              selected ? "opacity-100 scale-100" : "opacity-0 scale-75"
                            )}
                          >
                            <Check size={13} strokeWidth={2.5} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <FieldError id="project-error" message={errorFor("project")} />
                  <p id="project-help" className="text-xs text-beto-gray/80 mt-4 leading-relaxed">
                    {cd.priceOnlyEngagement}
                  </p>
                </fieldset>

              </>
            )}

            {/* STEP 1: Design details, in three short sections */}
            {step === 1 && (
              <>
                <h2 ref={headingRef} tabIndex={-1} className={stepHeading}>{cd.step1Title}</h2>
                <p className="text-sm text-beto-gray mb-10">{cd.step1Desc}</p>

                <SectionTitle>{cd.sectionStone}</SectionTitle>

                <ChoiceGroup id="stone" legend={cd.stoneLabel} error={errorFor("stone")}>
                  <div className="grid grid-cols-2 gap-3">
                    {STONES.map((id) => (
                      <Chip key={id} selected={d.stone === id} onClick={() => chooseStone(id)}>
                        {isEngagement ? (
                          <>
                            <span className="block font-medium text-beto-black">{cd.stoneOptions[id]}</span>
                            <span className={cn("block text-xs mt-1 leading-snug", id === "lab" && priceTable ? "text-beto-gold-dark" : "text-beto-gray")}>
                              {id === "lab" ? (priceTable ? cd.stoneHints.lab : cd.stoneHints.labNoPrice) : cd.stoneHints[id]}
                            </span>
                          </>
                        ) : (
                          cd.stoneOptions[id]
                        )}
                      </Chip>
                    ))}
                  </div>
                </ChoiceGroup>

                <Reveal show={d.stone === "lab"} id="lab-color">
                  <div className="-mt-4 mb-10 pl-4 border-l-2 border-beto-gold/50">
                    <ChoiceGroup id="labColor" legend={cd.labColorLabel} error={errorFor("labColor")}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {LAB_COLORS.map((id) => (
                          <Chip key={id} selected={d.labColor === id} onClick={() => pick("labColor", id)}>
                            {cd.labColorOptions[id]}
                          </Chip>
                        ))}
                      </div>
                    </ChoiceGroup>
                    <Reveal show={d.labColor === "colored"} id="lab-shade">
                      <ChoiceGroup id="labShade" legend={cd.labShadeLabel} error={errorFor("labShade")}>
                        <div className="flex flex-wrap gap-2.5">
                          {LAB_SHADES.map((id) => (
                            <Chip key={id} compact swatch={LAB_SHADE_SWATCH[id]} selected={d.labShade === id} onClick={() => pick("labShade", id)}>
                              {cd.labShades[id]}
                            </Chip>
                          ))}
                        </div>
                      </ChoiceGroup>
                    </Reveal>
                  </div>
                </Reveal>

                <Reveal show={d.stone === "gemstone"} id="gem-type">
                  <div className="-mt-4 mb-10 pl-4 border-l-2 border-beto-gold/50">
                    <ChoiceGroup id="gemType" legend={cd.gemTypeLabel} error={errorFor("gemType")}>
                      <div className="flex flex-wrap gap-2.5">
                        {GEM_TYPES.map((id) => (
                          <Chip key={id} compact selected={d.gemType === id} onClick={() => pick("gemType", id)}>
                            {cd.gemTypes[id]}
                          </Chip>
                        ))}
                      </div>
                    </ChoiceGroup>
                  </div>
                </Reveal>

                <Reveal show={d.stone === "birthstone"} id="birth-months">
                  <div className="-mt-4 mb-10 pl-4 border-l-2 border-beto-gold/50">
                    <ChoiceGroup id="birthMonths" legend={cd.birthMonthsLabel} error={errorFor("birthMonths")}>
                      <p className="text-xs text-beto-gray/80 -mt-2 mb-4 leading-relaxed">{cd.birthMonthsHint}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {BIRTH_MONTHS.map((m) => (
                          <Chip key={m} selected={d.birthMonths.includes(m)} onClick={() => toggleMonth(m)}>
                            <span className="block font-medium text-beto-black">{cd.birthMonths[m].month}</span>
                            <span className="block text-xs text-beto-gray mt-0.5 leading-snug">{cd.birthMonths[m].stone}</span>
                          </Chip>
                        ))}
                      </div>
                    </ChoiceGroup>
                  </div>
                </Reveal>

                <Reveal show={!!d.stone} id="shape">
                  <ChoiceGroup id="shape" legend={cd.shapeLabel} optional={cd.shapeOpt}>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                      {cd.shapes.map((s, i) => (
                        <Chip key={s} tile icon={SHAPE_ICONS[i]} selected={d.shape === s} onClick={() => pick("shape", d.shape === s ? "" : s)}>
                          {s}
                        </Chip>
                      ))}
                    </div>
                  </ChoiceGroup>
                </Reveal>

                <Reveal show={askCarat} id="carat">
                  <ChoiceGroup id="carat" legend={cd.caratLabel} error={errorFor("carat")}>
                    <div className="flex flex-wrap gap-2.5">
                      {ENGAGEMENT_CARATS.map((c) => (
                        <Chip key={c} compact selected={d.carat === c} onClick={() => pick("carat", c)}>
                          {caratText(c)}
                        </Chip>
                      ))}
                      <Chip compact selected={d.carat === "unsure"} onClick={() => pick("carat", "unsure")}>
                        {cd.caratUnsure}
                      </Chip>
                    </div>
                  </ChoiceGroup>
                </Reveal>

                <SectionTitle>{cd.sectionSetting}</SectionTitle>

                <ChoiceGroup id="metalColor" legend={cd.metalColorLabel} error={errorFor("metalColor")}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {METAL_COLORS.map((id) => (
                      <Chip key={id} swatch={METAL_SWATCH[id]} selected={d.metalColor === id} onClick={() => chooseMetal(id)}>
                        {cd.metalColors[id]}
                      </Chip>
                    ))}
                  </div>
                </ChoiceGroup>

                <Reveal show={isEngagement && !!d.stone} id="ring-style">
                  <ChoiceGroup id="ringStyle" legend={cd.ringStyleLabel} error={errorFor("ringStyle")}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {STYLE_CHOICES.filter((id) => STYLE_IMAGES[id]).map((id) => {
                        const selected = d.ringStyle === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => pick("ringStyle", id)}
                            aria-pressed={selected}
                            className={cn(
                              "group relative flex flex-col border text-left transition-[border-color,box-shadow] duration-200 ease-out",
                              pressable,
                              focusRing,
                              selected
                                ? "border-beto-gold shadow-[inset_0_0_0_1px_var(--color-beto-gold)]"
                                : "border-beto-gray-subtle hover:border-beto-gold/60"
                            )}
                          >
                            <Image
                              src={`/images/form-styles/${STYLE_IMAGES[id]}-${d.metalColor ?? "yellow"}.webp`}
                              alt=""
                              width={360}
                              height={360}
                              sizes="(max-width: 640px) 45vw, 220px"
                              className="w-full h-auto aspect-square bg-[#f7f7f7]"
                            />
                            {id === "solitaire" && (
                              <span className="absolute left-2 top-2 bg-beto-white/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-beto-black">
                                {cd.styleTagPopular}
                              </span>
                            )}
                            <span
                              className={cn(
                                "flex-1 px-3 py-2.5 text-xs sm:text-[13px] font-medium leading-snug transition-colors duration-200",
                                selected ? "bg-beto-gold/10 text-beto-black" : "bg-beto-white text-beto-black"
                              )}
                            >
                              {cd.ringStyles[id].label}
                            </span>
                            <span
                              aria-hidden
                              className={cn(
                                "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-beto-black text-white transition-[opacity,transform] duration-200 ease-out",
                                selected ? "opacity-100 scale-100" : "opacity-0 scale-75"
                              )}
                            >
                              <Check size={13} strokeWidth={2.5} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-beto-gray/80 mt-3 leading-relaxed">{cd.styleImagesNote}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                      {STYLE_CHOICES.filter((id) => !STYLE_IMAGES[id]).map((id) => (
                        <Chip key={id} selected={d.ringStyle === id} onClick={() => pick("ringStyle", id)}>
                          <span className="block font-medium text-beto-black">{cd.ringStyles[id].label}</span>
                          <span className="block text-xs text-beto-gray mt-1 leading-snug">{cd.ringStyles[id].desc}</span>
                        </Chip>
                      ))}
                    </div>
                    <Reveal show={d.ringStyle === "other"} id="ring-style-other">
                      <div className="mt-4">
                        <label htmlFor="field-ringStyleOther" className="text-xs font-medium text-beto-black tracking-wide mb-2 block">
                          {cd.ringStyleOtherLabel}
                          <span aria-hidden className="text-beto-gold-dark ml-0.5">*</span>
                        </label>
                        <textarea
                          id="field-ringStyleOther"
                          rows={3}
                          required
                          aria-invalid={errorFor("ringStyleOther") ? true : undefined}
                          aria-describedby={errorFor("ringStyleOther") ? "ringStyleOther-error" : undefined}
                          value={d.ringStyleOther}
                          onChange={(e) => set("ringStyleOther", e.target.value)}
                          placeholder={cd.ringStyleOtherPlaceholder}
                          className={cn(
                            inputClass,
                            "resize-none",
                            errorFor("ringStyleOther") ? "border-red-600 shadow-[inset_0_0_0_1px_#dc2626]" : inputIdle
                          )}
                        />
                        <FieldError id="ringStyleOther-error" message={errorFor("ringStyleOther")} />
                      </div>
                    </Reveal>
                  </ChoiceGroup>
                </Reveal>

                <Reveal show={d.metalColor !== "platinum"} id="karat">
                  <ChoiceGroup id="karat" legend={cd.metalKaratLabel} error={errorFor("karat")}>
                    <div className="flex flex-wrap gap-2.5">
                      {(d.projectIndex === GRILLZ_INDEX ? KARATS_GRILLZ : KARATS).map((id) => (
                        <Chip key={id} compact selected={d.karat === id} onClick={() => pick("karat", id)}>
                          {cd.metalKarats[id]}
                        </Chip>
                      ))}
                    </div>
                    <p className="text-xs text-beto-gray/80 mt-3 leading-relaxed">{cd.metalKaratHint}</p>
                  </ChoiceGroup>
                </Reveal>

                <SectionTitle>{budgetNeeded ? cd.sectionBudget : cd.sectionTimeline}</SectionTitle>

                {budgetNeeded && (
                <ChoiceGroup id="budget" legend={cd.budgetLabel} error={errorFor("budget")}>
                  <div className="flex flex-wrap gap-2.5">
                    {budgetOptions.map((b) => (
                      <Chip key={b} compact selected={d.budget === b} onClick={() => pick("budget", b)}>
                        {b}
                      </Chip>
                    ))}
                  </div>
                  {isEngagement && d.stone === "natural" && (
                    <p className="text-xs text-beto-gray/80 mt-3 leading-relaxed">{cd.naturalBudgetNote}</p>
                  )}
                </ChoiceGroup>
                )}

                <ChoiceGroup id="timeline" legend={cd.timelineLabel} optional={cd.timelineOpt}>
                  <div className="flex flex-wrap gap-2.5">
                    {cd.timelines.map((t) => (
                      <Chip key={t} compact selected={d.timeline === t} onClick={() => pick("timeline", d.timeline === t ? "" : t)}>
                        {t}
                      </Chip>
                    ))}
                  </div>
                </ChoiceGroup>

                <SectionTitle>{cd.sectionInspiration}</SectionTitle>
                {isEngagement && images.length === 0 && d.stone === "lab" && (
                  <p className="text-xs text-beto-gray -mt-2 mb-5 leading-relaxed">{cd.uploadHourNote}</p>
                )}
                <div className="mb-10">
                  <p className="text-xs font-medium text-beto-black tracking-wide mb-3">
                    {cd.uploadLabel} <span className="text-beto-gray/80 font-normal">{cd.uploadOpt}</span>
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
                      "block border-2 border-dashed p-8 sm:p-10 text-center bg-beto-white cursor-pointer transition-[border-color,background-color] duration-200",
                      "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-beto-black",
                      dragging ? "border-beto-gold bg-beto-gold/5" : "border-beto-gray-subtle hover:border-beto-gold/60"
                    )}
                  >
                    <Upload size={20} className="text-beto-gray mx-auto mb-3" aria-hidden />
                    <span className="block text-sm text-beto-black mb-1">{cd.uploadDrop}</span>
                    <span className="block text-xs text-beto-gray/80">{cd.uploadHint}</span>
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
                    <ul className="flex flex-wrap gap-4 mt-5">
                      <AnimatePresence initial={false}>
                        {images.map((img) => (
                          <motion.li
                            key={img.id}
                            layout={!reduceMotion}
                            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.92 }}
                            animate={{ opacity: 1, scale: 1, transition: { duration: 0.25, ease: EASE_OUT } }}
                            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.92, transition: { duration: 0.15, ease: EASE_IN } }}
                            className="relative w-24 h-24 border border-beto-gray-subtle bg-beto-white"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                            <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(img.id)}
                              aria-label={cd.uploadRemove}
                              className={cn(
                                "absolute -top-3 -right-3 w-8 h-8 rounded-full bg-beto-black text-white flex items-center justify-center hover:bg-beto-gold hover:text-beto-black transition-colors duration-200",
                                "after:absolute after:-inset-1.5 after:content-['']",
                                pressable,
                                focusRing
                              )}
                            >
                              <X size={14} aria-hidden />
                            </button>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                      {preparing > 0 && (
                        <li className="w-24 h-24 border border-dashed border-beto-gray-subtle flex flex-col items-center justify-center gap-2 px-2 text-center text-[11px] text-beto-gray">
                          <Loader2 size={16} className="motion-safe:animate-spin" aria-hidden />
                          {cd.uploadPreparing}
                        </li>
                      )}
                    </ul>
                  )}
                  <div aria-live="polite">
                    <FieldError id="upload-error" message={uploadMessage || undefined} />
                    {isEngagement && images.length > 0 && (
                      <p className="flex items-start gap-2 text-xs text-beto-black mt-4 leading-relaxed">
                        <Clock size={14} className="text-beto-gold-dark shrink-0 mt-px" aria-hidden />
                        {cd.uploadHourNote}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="design-notes" className="text-xs font-medium text-beto-black tracking-wide mb-2 block">
                    {cd.additionalNotes} <span className="text-beto-gray/80 font-normal">{cd.notesOpt}</span>
                  </label>
                  <textarea
                    id="design-notes"
                    rows={4}
                    value={d.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder={cd.notesPlaceholder}
                    className={cn(inputClass, inputIdle, "resize-none")}
                  />
                </div>
                {helpLine}
              </>
            )}

            {/* STEP 2: estimate for engagement rings; summary + deposit for other pieces */}
            {step === 2 && (
              <>
                <h2 ref={headingRef} tabIndex={-1} className={stepHeading}>
                  {isEngagement ? cd.step2Title : cd.summaryTitle}
                </h2>
                <p className="text-sm text-beto-gray mb-10">{isEngagement ? cd.step2Desc : cd.summaryDesc}</p>

                {!isEngagement ? (
                  <div className="bg-beto-black text-white p-8 sm:p-10 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                      <div>
                        <p className="text-label text-beto-gold mb-2">{cd.depositLabel}</p>
                        <div className="font-display text-3xl font-light lining-nums">{cd.depositAmount}</div>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xs text-white/70">{cd.depositNoPaymentNow}</p>
                        <p className="text-xs text-beto-gold mt-1">{cd.depositCredited}</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/75 leading-relaxed">{cd.depositDesc}</p>
                  </div>
                ) : quote ? (
                  <div className="bg-beto-black text-white p-8 sm:p-10 mb-8">
                    <p className="text-label text-beto-gold mb-4">
                      {quote.startingFrom ? cd.estimateLabel : cd.estimateLabelExact}
                    </p>
                    <div className="flex flex-col gap-2 mb-6">
                      {quote.prices.map((p, i) => (
                        <motion.div
                          key={p.karat}
                          initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
                          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT, delay: 0.15 + i * 0.08 } }}
                          className="font-display text-3xl sm:text-4xl font-light lining-nums"
                        >
                          {quote.startingFrom && (
                            <span className="text-white/70 text-base font-sans mr-2">{cd.estimateFrom}</span>
                          )}
                          {money(p.price)}
                          <span className="text-white/70 text-base font-sans ml-2">
                            {cd.estimateIn.replace("{k}", cd.gradeLabels[p.karat])}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                    {quote.startingFrom && (
                      <p className="text-xs text-white/70 leading-relaxed mb-3">{cd.estimateSolitaireNote}</p>
                    )}
                    <p className="text-xs text-white/70 leading-relaxed mb-3">{cd.estimateDisclaimer}</p>
                    <p className="text-xs text-beto-gold leading-relaxed">{cd.estimateIncludes}</p>
                  </div>
                ) : hourPromise ? (
                  <div className="bg-beto-black text-white p-8 sm:p-10 mb-8">
                    <Clock size={22} className="text-beto-gold mb-4" aria-hidden />
                    <h3 className="font-display text-2xl sm:text-3xl font-light mb-3 text-balance">{cd.estimateHourTitle}</h3>
                    <p className="text-sm text-white/75 leading-relaxed mb-4">
                      {images.length > 0 ? cd.estimateHourImage : cd.estimateHourGeneric}
                    </p>
                    <p className="text-xs text-beto-gold leading-relaxed">{cd.estimateIncludes}</p>
                  </div>
                ) : (
                  <div className="bg-beto-black text-white p-8 sm:p-10 mb-8">
                    <Clock size={22} className="text-beto-gold mb-4" aria-hidden />
                    <h3 className="font-display text-2xl sm:text-3xl font-light mb-3 text-balance">{cd.estimateDayTitle}</h3>
                    <p className="text-sm text-white/75 leading-relaxed mb-4">
                      {d.stone === "natural" ? cd.estimateNaturalBody : cd.estimateDayBody}
                    </p>
                    <p className="text-xs text-beto-gold leading-relaxed">{cd.estimateIncludes}</p>
                  </div>
                )}

                <dl className="bg-beto-white border border-beto-gray-subtle/60 divide-y divide-beto-gray-subtle/50 mb-8">
                  {recap.map((row) => (
                    <div key={row.label} className="flex justify-between items-center gap-6 px-6 py-4">
                      <dt className="text-xs font-medium tracking-wide text-beto-gray/80">{row.label}</dt>
                      <dd className="text-sm text-beto-black font-medium text-right">{row.value || "—"}</dd>
                    </div>
                  ))}
                </dl>

                <div className="border border-beto-gray-subtle/60 bg-beto-white p-6 sm:p-8">
                  <h3 className="text-label text-beto-black mb-4">{cd.nextStepsTitle}</h3>
                  <ol className="flex flex-col gap-3">
                    {(DEPOSIT_PAYMENT_URL ? cd.nextStepsDepositFirst : cd.nextSteps).map((s, i) => (
                      <li key={s} className="flex gap-3 text-sm text-beto-gray leading-relaxed">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-beto-gold text-[11px] font-medium text-beto-black">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
                {review && (
                  <figure className="mt-8 border-l-2 border-beto-gold pl-5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-beto-gray mb-2">
                      <span className="text-beto-gold-dark mr-2" aria-label="5 sur 5">★★★★★</span>
                      {cd.reviewEyebrow}
                    </p>
                    <blockquote className="font-display text-xl text-beto-black leading-snug text-pretty">
                      « {review.quote} »
                    </blockquote>
                    <figcaption className="text-xs text-beto-gray mt-2">{review.author}</figcaption>
                  </figure>
                )}
                <div className="mt-8">{trustRow}</div>
                {helpLine}
              </>
            )}

            {/* STEP 3: Contact details (Enter submits) */}
            {step === CONTACT_STEP && (
              <form id={CONTACT_FORM_ID} noValidate onSubmit={handleSubmit}>
                <h2 ref={headingRef} tabIndex={-1} className={stepHeading}>{cd.step3Title}</h2>
                <p className="text-sm text-beto-gray mb-2">{cd.step3Desc}</p>
                <p className="text-xs text-beto-gray mb-2">{cd.privacyNote}</p>
                <p className="text-xs text-beto-gray/80 mb-10">
                  <span aria-hidden className="text-beto-gold-dark">*</span> {cd.required}
                </p>
                <div className="flex flex-col gap-6">
                  {textFields.map((field) => {
                    const error = errorFor(field.id);
                    const value = d[field.id];
                    return (
                      <div key={field.id}>
                        <label htmlFor={`field-${field.id}`} className="text-xs font-medium text-beto-black tracking-wide mb-2 block">
                          {field.label}
                          {field.required ? (
                            <span aria-hidden className="text-beto-gold-dark ml-0.5">*</span>
                          ) : (
                            <span className="text-beto-gray/80 font-normal"> {cd.notesOpt}</span>
                          )}
                        </label>
                        <input
                          id={`field-${field.id}`}
                          type={field.type}
                          inputMode={field.inputMode}
                          autoComplete={field.autoComplete}
                          enterKeyHint={field.id === "phone" ? "send" : "next"}
                          required={field.required}
                          aria-invalid={error ? true : undefined}
                          aria-describedby={error ? `${field.id}-error` : undefined}
                          value={value}
                          onChange={(e) => set(field.id, e.target.value)}
                          onBlur={() => {
                            if (value.trim()) setTouched((t) => ({ ...t, [field.id]: true }));
                          }}
                          placeholder={field.placeholder}
                          className={cn(
                            inputClass,
                            error ? "border-red-600 shadow-[inset_0_0_0_1px_#dc2626]" : inputIdle
                          )}
                        />
                        <FieldError id={`${field.id}-error`} message={error} />
                      </div>
                    );
                  })}

                  <fieldset className="min-w-0">
                    <legend className="text-xs font-medium text-beto-black tracking-wide mb-3">{cd.contactMethodLabel}</legend>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {CONTACTS.map((id) => (
                        <Chip key={id} compact selected={d.contact === id} onClick={() => pick("contact", id)}>
                          {cd.contacts[id]}
                        </Chip>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div className="mt-10">{trustRow}</div>
                <p className="text-xs text-beto-gray/80 mt-6">{DEPOSIT_PAYMENT_URL ? cd.secureNoteDeposit : cd.secureNote}</p>
                <div aria-live="assertive">
                  {status === "error" && (
                    <div role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 px-4 py-3 mt-4 text-center leading-relaxed">
                      <p>{cd.errorMessage}</p>
                      <a
                        href="mailto:betojewlz@gmail.com"
                        className={cn("inline-block mt-1 underline underline-offset-2 font-medium", focusRing)}
                      >
                        {cd.errorEmailCta}
                      </a>
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* STEP 4: Booking right away */}
            {step === SUCCESS_STEP && status === "success" && (
              <div className="flex flex-col gap-4">
                <h2 ref={headingRef} tabIndex={-1} className="sr-only">
                  {cd.steps[SUCCESS_STEP]}
                </h2>
                <p
                  role="status"
                  className="flex items-start gap-2.5 text-sm text-green-800 bg-green-50 border border-green-200 px-5 py-4 leading-relaxed"
                >
                  <CheckCircle2 size={18} className="shrink-0 mt-px" aria-hidden />
                  {successText}
                </p>
                {DEPOSIT_PAYMENT_URL ? (
                  <>
                    <div className="bg-beto-black text-white p-8 sm:p-10 text-left">
                      <p className="text-label text-beto-gold mb-4">{cd.depositCtaEyebrow}</p>
                      <h3 className="font-display text-2xl sm:text-3xl font-normal leading-tight mb-4 text-balance">
                        {d.fullName.trim() ? `${d.fullName.trim().split(/\s+/)[0]}, ${cd.depositCtaTitle.toLowerCase()}` : cd.depositCtaTitle}
                      </h3>
                      <p className="text-sm text-white/75 leading-relaxed mb-8">{cd.depositCtaBody}</p>
                      <a
                        href={depositHref}
                        onClick={() => trackFunnel("cta_click", SUCCESS_STEP, { target: "deposit" })}
                        className={cn(
                          "block text-center text-sm font-medium uppercase tracking-widest px-4 py-4 bg-beto-gold text-beto-black hover:bg-beto-gold-dark transition-colors duration-300",
                          pressable,
                          focusRing
                        )}
                      >
                        {cd.depositCtaButton}
                      </a>
                      <p className="text-xs text-white/60 mt-4 text-center leading-relaxed">{cd.depositCtaNote}</p>
                    </div>
                    <div className="border border-beto-gray-subtle/60 bg-beto-white p-6 sm:p-8">
                      <h3 className="font-display text-xl font-light text-beto-black mb-1 text-balance">{cd.exploreTitle}</h3>
                      <p className="text-sm text-beto-gray leading-relaxed mb-5">{cd.exploreBody}</p>
                      <a
                        href={buildCalendlyUrl(d.fullName, d.email)}
                        onClick={() => trackFunnel("cta_click", SUCCESS_STEP, { target: "calendly" })}
                        className={cn(
                          "inline-flex min-h-12 items-center justify-center px-8 border border-beto-black text-xs font-medium uppercase tracking-widest text-beto-black hover:bg-beto-black hover:text-white transition-colors duration-300",
                          pressable,
                          focusRing
                        )}
                      >
                        {cd.exploreCta}
                      </a>
                      {!showPrice && (
                        <p className="text-xs text-beto-gray/80 mt-5 leading-relaxed">
                          {hourPromise ? cd.successFallbackHour : cd.successFallbackDay}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <CalendlyNextStep
                    name={d.fullName}
                    email={d.email}
                    fallback={showPrice ? undefined : hourPromise ? cd.successFallbackHour : cd.successFallbackDay}
                    onCtaClick={() => trackFunnel("cta_click", SUCCESS_STEP, { target: "calendly" })}
                  />
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation: sticky in the thumb zone on mobile, inline on desktop */}
        {step < SUCCESS_STEP && (
          <div className="sticky bottom-0 z-20 -mx-6 px-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] mt-10 bg-beto-offwhite/95 backdrop-blur-sm border-t border-beto-gray-subtle md:static md:mx-0 md:px-0 md:pt-8 md:pb-0 md:bg-transparent md:backdrop-blur-none">
            {showLivePrice && (
              <p className="flex items-baseline justify-between gap-3 text-xs text-beto-gray mb-2.5" aria-live="polite">
                <span className="shrink-0 whitespace-nowrap">{cd.livePriceLabel}</span>
                <span className={cn("text-right lining-nums", quote && images.length === 0 && "text-sm font-medium text-beto-black")}>
                  {livePriceText}
                </span>
              </p>
            )}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => goTo(Math.max(0, step - 1))}
                className={cn(
                  "min-h-11 min-w-11 px-1 text-xs font-medium tracking-widest uppercase text-beto-gray hover:text-beto-black transition-colors duration-200 shrink-0",
                  pressable,
                  focusRing,
                  step === 0 && "invisible"
                )}
              >
                {step === CONTACT_STEP ? (
                  <>
                    <span className="sm:hidden" aria-hidden>
                      ←
                    </span>
                    <span className="max-sm:sr-only">{cd.backButton}</span>
                  </>
                ) : (
                  cd.backButton
                )}
              </button>

              {step < CONTACT_STEP ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={preparing > 0}
                  className={cn(
                    "min-h-12 px-8 bg-beto-black text-white text-xs font-medium uppercase tracking-widest hover:bg-beto-gold hover:text-beto-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
                    pressable,
                    focusRing
                  )}
                >
                  {preparing > 0 ? cd.uploadPreparing : cd.continueButton}
                </button>
              ) : (
                <Magnetic className="flex-1 md:flex-none" strength={0.15}>
                  <button
                    type="submit"
                    form={CONTACT_FORM_ID}
                    disabled={status === "sending"}
                    aria-busy={status === "sending"}
                    className={cn(
                      "w-full min-h-12 px-3 md:px-10 bg-beto-gold text-beto-black text-[11px] sm:text-xs font-medium uppercase tracking-[0.06em] sm:tracking-[0.2em] leading-snug hover:bg-beto-gold-light transition-colors duration-300 disabled:opacity-60 disabled:cursor-wait inline-flex items-center justify-center gap-2",
                      pressable,
                      focusRing
                    )}
                  >
                    {status === "sending" && <Loader2 size={14} className="motion-safe:animate-spin" aria-hidden />}
                    {status === "sending" ? cd.sending : cd.secureButton}
                  </button>
                </Magnetic>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
