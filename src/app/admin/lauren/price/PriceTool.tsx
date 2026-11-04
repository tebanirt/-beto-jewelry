"use client";

import { useState } from "react";
import {
  ENGAGEMENT_CARATS,
  lookupQuote,
  type EngagementCarat,
  type EngagementPriceTable,
  type MetalGrade,
  type PricedStone,
  type RingStyle,
} from "@/lib/engagementPricing";
import { MARKETPLACE_DEPOSIT, money } from "@/lib/workspace";
import { CopyText, ghostBtn, input } from "../ui";

/** Rayane's business line (brief §1) — "Ask Rayane" opens a prefilled text. */
const RAYANE_SMS = "+14388745759";

const STONES: { value: PricedStone; en: string; fr: string }[] = [
  { value: "lab", en: "Lab-grown diamond (white)", fr: "diamant de laboratoire" },
  { value: "labColored", en: "Lab-grown coloured diamond", fr: "diamant de laboratoire de couleur" },
];
const STYLES: { value: RingStyle; label: string; en: string; fr: string; hint: string }[] = [
  { value: "solitaire", label: "Solitaire", en: "solitaire", fr: "solitaire", hint: "Also the price for a cathedral solitaire." },
  {
    value: "haloHalf",
    label: "Hidden halo + half eternity",
    en: "with a hidden halo and half-eternity band",
    fr: "avec halo caché et jonc demi-éternité",
    hint: "Cathedral version: same price.",
  },
  {
    value: "haloThreeQuarter",
    label: "Hidden halo + ¾ eternity",
    en: "with a hidden halo and three-quarter eternity band",
    fr: "avec halo caché et jonc trois-quarts éternité",
    hint: "Cathedral version: same price.",
  },
];
const METALS: { value: MetalGrade; label: string; en: string; fr: string }[] = [
  { value: "14k", label: "14K gold", en: "14K gold", fr: "or 14K" },
  { value: "18k", label: "18K gold", en: "18K gold", fr: "or 18K" },
  { value: "platinum", label: "Platinum", en: "platinum", fr: "platine" },
];

function Chips<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <fieldset className="mb-5">
      <legend className="text-label text-beto-gold mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`px-3 py-2.5 border text-sm transition-colors ${
              value === o.value ? "bg-beto-black text-white border-beto-black" : "bg-beto-white border-beto-gray-subtle text-beto-gray hover:border-beto-gold"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function PriceTool({ table }: { table: EngagementPriceTable | null }) {
  const [stone, setStone] = useState<PricedStone>("lab");
  const [carat, setCarat] = useState<EngagementCarat | null>(null);
  const [style, setStyle] = useState<RingStyle>("solitaire");
  const [metal, setMetal] = useState<MetalGrade>("14k");
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [askText, setAskText] = useState("");

  if (!table) {
    return (
      <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 p-4">
        The price grid is not available right now. Ask Rayane for this price, and let Rayane know the price tool is down.
      </p>
    );
  }

  const quote = lookupQuote(table, stone, carat, style, metal);
  const price = quote?.prices[0]?.price ?? null;
  const s = STONES.find((x) => x.value === stone)!;
  const st = STYLES.find((x) => x.value === style)!;
  const m = METALS.find((x) => x.value === metal)!;

  const message =
    price === null || carat === null
      ? ""
      : lang === "en"
        ? `For a ${carat} ct ${s.en} ${st.en}, in ${m.en}, the price is ${money(price)} (before tax). The stone is E colour, VVS2 clarity, with an IGI certificate. It includes one free resizing after you receive it, and cleaning and polishing for life. We start with a 3D design in about 48 hours, and the ring is ready about ${metal === "platinum" ? "3" : "2"} weeks after you approve it. The $${MARKETPLACE_DEPOSIT} deposit goes 100% toward your ring.`
        : `Pour un ${s.fr} de ${String(carat).replace(".", ",")} ct, ${st.fr === "solitaire" ? "en solitaire" : st.fr}, en ${m.fr}, le prix est de ${money(price)} (avant taxes). La pierre est de couleur E, pureté VVS2, avec certificat IGI. Ça inclut une mise à grandeur gratuite après réception, et le nettoyage et polissage à vie. On commence par un design 3D en environ 48 heures, et la bague est prête environ ${metal === "platinum" ? "3" : "2"} semaines après votre approbation. Le dépôt de ${MARKETPLACE_DEPOSIT} $ est crédité à 100 % sur votre bague.`;

  const askBody = `Price question from Lauren: ${askText || "(describe the ring)"}`;

  return (
    <div>
      <Chips label="Stone" options={STONES.map((x) => ({ value: x.value, label: x.en }))} value={stone} onChange={setStone} />
      <Chips label="Carat" options={ENGAGEMENT_CARATS.map((c) => ({ value: c, label: `${c} ct` }))} value={carat} onChange={setCarat} />
      <Chips label="Style" options={STYLES.map((x) => ({ value: x.value, label: x.label }))} value={style} onChange={setStyle} />
      <p className="text-xs text-beto-gray-light -mt-3 mb-5">{st.hint} The grid has no shape option: for an unusual shape, check with Rayane.</p>
      <Chips label="Metal" options={METALS.map((x) => ({ value: x.value, label: x.label }))} value={metal} onChange={setMetal} />

      <div className="bg-beto-white border border-beto-gray-subtle p-5 mb-6" aria-live="polite">
        {carat === null ? (
          <p className="text-sm text-beto-gray-light">Pick a carat to see the price.</p>
        ) : price === null ? (
          <p className="text-sm text-beto-black">No grid price for this combination — ask Rayane (below).</p>
        ) : (
          <>
            <p className="text-label text-beto-gold">Price before tax</p>
            <p className="text-3xl font-medium text-beto-black mt-1">{money(price)}</p>
            <p className="text-sm text-beto-gray mt-1">
              Deposit {money(MARKETPLACE_DEPOSIT)} · balance {money(price - MARKETPLACE_DEPOSIT)} at pickup
            </p>
            <div className="flex border border-beto-gray-subtle w-fit mt-4" role="group" aria-label="Message language">
              {(["en", "fr"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={lang === l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 text-xs uppercase ${lang === l ? "bg-beto-black text-white" : "text-beto-gray"}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="text-sm text-beto-gray mt-3 whitespace-pre-line bg-beto-offwhite p-3">{message}</p>
            <div className="mt-3">
              <CopyText text={message} label="Copy message for the client" />
            </div>
          </>
        )}
      </div>

      <div className="bg-beto-white border border-beto-gray-subtle p-5">
        <h2 className="text-label text-beto-gold mb-2">Not in the grid? Ask Rayane</h2>
        <p className="text-xs text-beto-gray-light mb-3">
          Natural diamonds, other gems, bands, earrings, bigger than 6 ct, a special design, or a discount request: never guess, ask Rayane.
        </p>
        <textarea
          className={input}
          rows={3}
          value={askText}
          onChange={(e) => setAskText(e.target.value)}
          placeholder="e.g. Natural 1.5 ct oval, 18k yellow, thin band, client budget 4000"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <a className={ghostBtn} href={`sms:${RAYANE_SMS}?&body=${encodeURIComponent(askBody)}`}>
            Text Rayane
          </a>
          <CopyText text={askBody} label="Copy question" />
        </div>
      </div>
    </div>
  );
}
