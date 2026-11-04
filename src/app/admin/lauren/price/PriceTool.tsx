"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MARKETPLACE_DEPOSIT, money } from "@/lib/workspace";
import { CopyText, api, ghostBtn, input, primaryBtn } from "../ui";

/** Rayane's business line (brief §1) — "Ask Rayane" opens a prefilled text. */
const RAYANE_SMS = "+14388745759";

type Stone = "lab" | "labColored";
type Metal = "14k" | "18k" | "platinum";
type Result = { price: number; floor: number; cost: number; breakdown: { label: string; amount: number }[] };
export type RecentQuote = {
  id: string;
  created_at: string;
  carat: number;
  metal: Metal;
  stone: Stone;
  options: { hiddenHalo?: boolean; semiEternity?: boolean };
  offered_price: number;
  floor_price: number;
  outcome: string;
  client: { full_name: string | null } | null;
};

const STONES: { value: Stone; label: string; en: string; fr: string }[] = [
  { value: "lab", label: "Lab diamond (white)", en: "lab-grown diamond", fr: "diamant de laboratoire" },
  { value: "labColored", label: "Lab diamond (colour)", en: "coloured lab-grown diamond", fr: "diamant de laboratoire de couleur" },
];
const METALS: { value: Metal; label: string; en: string; fr: string }[] = [
  { value: "14k", label: "14K gold", en: "14K gold", fr: "or 14K" },
  { value: "18k", label: "18K gold", en: "18K gold", fr: "or 18K" },
  { value: "platinum", label: "Platinum", en: "platinum", fr: "platine" },
];
const QUICK_CARATS = [1, 1.5, 2, 2.5, 3, 4];
const OUTCOMES: { value: string; label: string }[] = [
  { value: "accepted", label: "Said yes" },
  { value: "too_expensive", label: "Too expensive" },
  { value: "no_answer", label: "No answer" },
];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`px-3 py-2.5 border text-sm ${on ? "bg-beto-black text-white border-beto-black" : "bg-beto-white border-beto-gray-subtle text-beto-gray hover:border-beto-gold"}`}
    >
      {children}
    </button>
  );
}

export default function PriceTool({ clients, recent }: { clients: { id: string; name: string }[]; recent: RecentQuote[] }) {
  const router = useRouter();
  const [stone, setStone] = useState<Stone>("lab");
  const [carat, setCarat] = useState("");
  const [metal, setMetal] = useState<Metal>("14k");
  const [hiddenHalo, setHiddenHalo] = useState(false);
  const [semiEternity, setSemiEternity] = useState(false);
  const [calc, setCalc] = useState<{ key: string; result: Result | null; error: string | null } | null>(null);
  const [offeredDraft, setOfferedDraft] = useState<{ key: string; value: string } | null>(null);
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [clientId, setClientId] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedState, setSaved] = useState<{ key: string; id: string; copied: boolean } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [askText, setAskText] = useState("");
  const [showCost, setShowCost] = useState(false);
  const reqId = useRef(0);

  const ct = Number(carat.replace(",", "."));
  const options = { hiddenHalo, semiEternity };
  const validCarat = !!carat && Number.isFinite(ct) && ct > 0;
  // Everything shown below belongs to one combination; changing any choice resets it.
  const key = JSON.stringify([stone, ct, metal, hiddenHalo, semiEternity]);

  // Recalculate on every change (debounced); the server holds the costs.
  useEffect(() => {
    if (!validCarat) return;
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      const res = await api<Result>("/api/admin/workspace/quote", "POST", { stone, carat: ct, metal, options: { hiddenHalo, semiEternity } });
      if (id !== reqId.current) return;
      setCalc(res.ok ? { key, result: res.data, error: null } : { key, result: null, error: res.data.error || "Could not calculate. Try again." });
    }, 350);
    return () => clearTimeout(t);
  }, [key, validCarat, stone, ct, metal, hiddenHalo, semiEternity]);

  const current = validCarat && calc?.key === key ? calc : null;
  const result = current?.result ?? null;
  const calcError = current?.error ?? null;
  const offered = offeredDraft?.key === key ? offeredDraft.value : result ? String(result.price) : "";
  const setOffered = (value: string) => setOfferedDraft({ key, value });
  const saved = savedState?.key === key ? savedState : null;

  const offeredNum = Math.round(Number(offered));
  const belowFloor = result !== null && Number.isFinite(offeredNum) && offeredNum < result.floor;
  const s = STONES.find((x) => x.value === stone)!;
  const m = METALS.find((x) => x.value === metal)!;
  const weeks = metal === "platinum" ? 3 : 2;

  const styleEn = [hiddenHalo && "a hidden halo", semiEternity && "a semi-eternity band"].filter(Boolean).join(" and ");
  const styleFr = [hiddenHalo && "un halo caché", semiEternity && "un jonc semi-éternité"].filter(Boolean).join(" et ");
  const caratFr = String(ct).replace(".", ",");
  const message =
    !result || !offeredNum
      ? ""
      : lang === "en"
        ? `For a ${ct} ct ${s.en} ring in ${m.en}${styleEn ? `, with ${styleEn}` : ""}, the price is ${money(offeredNum)} (before tax). The stone is E colour, VVS2 clarity, with an IGI certificate. It includes one free resizing after you receive it, and cleaning and polishing for life. We start with a 3D design in about 48 hours, and the ring is ready about ${weeks} weeks after you approve it. The $${MARKETPLACE_DEPOSIT} deposit goes 100% toward your ring.`
        : `Pour une bague avec un ${s.fr} de ${caratFr} ct en ${m.fr}${styleFr ? `, avec ${styleFr}` : ""}, le prix est de ${money(offeredNum, "fr")} (avant taxes). La pierre est de couleur E, pureté VVS2, avec certificat IGI. Ça inclut une mise à grandeur gratuite après réception, et le nettoyage et polissage à vie. On commence par un design 3D en environ 48 heures, et la bague est prête environ ${weeks} semaines après votre approbation. Le dépôt de ${MARKETPLACE_DEPOSIT} $ est crédité à 100 % sur votre bague.`;

  async function giveQuote() {
    if (!result) return;
    setSaving(true);
    setSaveError(null);
    const res = await api<{ quoteId?: string }>("/api/admin/workspace/quote", "POST", {
      stone,
      carat: ct,
      metal,
      options,
      log: { offeredPrice: offeredNum, lang, clientId },
    });
    setSaving(false);
    if (!res.ok || !res.data.quoteId) {
      setSaveError(res.data.error || "Not saved. Try again.");
      return;
    }
    let copied = true;
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      copied = false;
    }
    setSaved({ key, id: res.data.quoteId, copied });
    router.refresh();
  }

  const details = `${ct || "?"} ct ${s.en}, ${m.en}${styleEn ? `, ${styleEn}` : ""}`;
  const pdfAsk = `PDF quote for Lauren's client${clientId ? ` (${clients.find((c) => c.id === clientId)?.name})` : ""}: ${details} — ${money(offeredNum || result?.price)} before tax, ${lang === "fr" ? "in French" : "in English"}.`;
  const askBody = `Price question from Lauren: ${askText || "(describe the ring)"}`;

  return (
    <div className="space-y-6">
      <section className="bg-beto-white border border-beto-gray-subtle p-5 space-y-5">
        <fieldset>
          <legend className="text-label text-beto-gold mb-2">Stone</legend>
          <div className="flex flex-wrap gap-2">
            {STONES.map((x) => (
              <Chip key={x.value} on={stone === x.value} onClick={() => setStone(x.value)}>
                {x.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="carat" className="text-label text-beto-gold block mb-2">
            Carat (centre stone)
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              id="carat"
              inputMode="decimal"
              placeholder="e.g. 1.8"
              value={carat}
              onChange={(e) => setCarat(e.target.value)}
              className={`${input} !w-28`}
            />
            {QUICK_CARATS.map((c) => (
              <Chip key={c} on={ct === c} onClick={() => setCarat(String(c))}>
                {c}
              </Chip>
            ))}
          </div>
        </div>

        <fieldset>
          <legend className="text-label text-beto-gold mb-2">Metal</legend>
          <div className="flex flex-wrap gap-2">
            {METALS.map((x) => (
              <Chip key={x.value} on={metal === x.value} onClick={() => setMetal(x.value)}>
                {x.label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-label text-beto-gold mb-2">Extras</legend>
          <div className="space-y-2 text-sm text-beto-gray">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={hiddenHalo} onChange={(e) => setHiddenHalo(e.target.checked)} /> Hidden halo
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={semiEternity} onChange={(e) => setSemiEternity(e.target.checked)} /> Semi-eternity band (diamonds on half the band)
            </label>
          </div>
          <p className="text-xs text-beto-gray-light mt-2">
            Any shape (round, oval, emerald…) and solitaire or cathedral: same price. Full halo, three stones, full eternity or anything else: ask Rayane.
          </p>
        </fieldset>
      </section>

      <section className="bg-beto-white border border-beto-gray-subtle p-5" aria-live="polite">
        {!carat ? (
          <p className="text-sm text-beto-gray-light">Type a carat to see the price.</p>
        ) : !validCarat ? (
          <p role="alert" className="text-sm text-red-700">Type the carat as a number, e.g. 1.5</p>
        ) : calcError ? (
          <p role="alert" className="text-sm text-red-700">{calcError}</p>
        ) : !result ? (
          <p className="text-sm text-beto-gray-light">Calculating…</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-beto-gold bg-beto-gold/10 p-3">
                <p className="text-[11px] uppercase tracking-wide text-beto-gray-light">Price to give</p>
                <p className="text-2xl font-medium text-beto-black">{money(result.price)}</p>
              </div>
              <div className="border border-beto-gray-subtle p-3">
                <p className="text-[11px] uppercase tracking-wide text-beto-gray-light">Lowest you can go</p>
                <p className="text-2xl font-medium text-beto-black">{money(result.floor)}</p>
              </div>
            </div>
            <p className="text-xs text-beto-gray-light">
              Before tax. You can offer anything between the two. Deposit {money(MARKETPLACE_DEPOSIT)}.{" "}
              <button type="button" className="underline" onClick={() => setShowCost((v) => !v)}>
                {showCost ? "Hide cost" : "See cost"}
              </button>
            </p>
            {showCost && (
              <ul className="text-xs text-beto-gray border-t border-beto-gray-subtle pt-2 space-y-1">
                {result.breakdown.map((b) => (
                  <li key={b.label} className="flex justify-between gap-2">
                    <span>{b.label}</span>
                    <span>{money(b.amount)}</span>
                  </li>
                ))}
                <li className="flex justify-between gap-2 font-medium text-beto-black">
                  <span>Total cost</span>
                  <span>{money(result.cost)}</span>
                </li>
              </ul>
            )}

            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-beto-gray-light">
                Price you&apos;re offering ($)
                <input className={input} inputMode="numeric" value={offered} onChange={(e) => setOffered(e.target.value)} />
              </label>
              <label className="text-xs text-beto-gray-light">
                For which client? (optional)
                <select className={input} value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  <option value="">—</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {belowFloor && <p role="alert" className="text-sm text-red-700">Below the minimum ({money(result.floor)}). Ask Rayane before going lower.</p>}

            <div className="flex items-center gap-3">
              <span className="text-xs text-beto-gray-light">Client speaks</span>
              <div className="flex border border-beto-gray-subtle" role="group" aria-label="Client language">
                {(["en", "fr"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={lang === l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1.5 text-xs ${lang === l ? "bg-beto-black text-white" : "text-beto-gray"}`}
                  >
                    {l === "en" ? "English" : "Français"}
                  </button>
                ))}
              </div>
            </div>
            {message && <p className="text-sm text-beto-gray whitespace-pre-line bg-beto-offwhite p-3">{message}</p>}

            {!saved ? (
              <button type="button" disabled={saving || belowFloor || !offeredNum} onClick={giveQuote} className={`${primaryBtn} w-full`}>
                {saving ? "Saving…" : "Copy message & save this price"}
              </button>
            ) : (
              <div className="border border-beto-gold bg-beto-gold/10 p-3 space-y-2 text-sm">
                <p>
                  Saved. {saved.copied ? "The message is copied: paste it in Messenger." : "Copy the message below and paste it in Messenger."}
                </p>
                {!saved.copied && <CopyText text={message} label="Copy message" />}
                <p className="text-xs text-beto-gray-light">When the client answers, tap their answer under “Recent prices” below.</p>
              </div>
            )}
            {saveError && <p role="alert" className="text-sm text-red-700">{saveError}</p>}

            <div className="border-t border-beto-gray-subtle pt-3">
              <p className="text-xs text-beto-gray-light mb-2">Client wants a PDF quote? Rayane makes it and checks it first.</p>
              <div className="flex flex-wrap gap-2">
                <a className={ghostBtn} href={`sms:${RAYANE_SMS}?&body=${encodeURIComponent(pdfAsk)}`}>
                  Ask Rayane for the PDF
                </a>
                <CopyText text={pdfAsk} label="Copy request" />
              </div>
            </div>
          </div>
        )}
      </section>

      <RecentQuotes recent={recent} />

      <section className="bg-beto-white border border-beto-gray-subtle p-5">
        <h2 className="text-label text-beto-gold mb-2">Something else? Ask Rayane</h2>
        <p className="text-xs text-beto-gray-light mb-3">
          Natural diamonds, gemstones, wedding bands, earrings, bracelets, men&apos;s rings, a special design: Rayane quotes those. Never guess.
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
      </section>
    </div>
  );
}

function RecentQuotes({ recent }: { recent: RecentQuote[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (recent.length === 0) return null;

  async function answer(id: string, outcome: string) {
    setBusy(id);
    setError(null);
    const res = await api("/api/admin/workspace/quote", "PATCH", { id, outcome });
    setBusy(null);
    if (!res.ok) setError(res.data.error || "Not saved. Try again.");
    else router.refresh();
  }

  return (
    <section>
      <h2 className="text-label text-beto-gold mb-2">Recent prices</h2>
      <ul className="bg-beto-white border border-beto-gray-subtle divide-y divide-beto-gray-subtle text-sm">
        {recent.map((q) => (
          <li key={q.id} className="px-4 py-3 space-y-2">
            <div className="flex justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate">{q.client?.full_name || "No client linked"}</span>
                <span className="block text-xs text-beto-gray-light">
                  {new Date(q.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "America/Toronto" })} · {q.carat} ct{" "}
                  {q.stone === "labColored" ? "colour " : ""}· {q.metal}
                  {q.options?.hiddenHalo ? " · hidden halo" : ""}
                  {q.options?.semiEternity ? " · semi-eternity" : ""}
                </span>
              </span>
              <span className="font-medium whitespace-nowrap">{money(Number(q.offered_price))}</span>
            </div>
            {q.outcome === "pending" ? (
              <div className="flex flex-wrap gap-2">
                {OUTCOMES.map((o) => (
                  <button key={o.value} type="button" disabled={busy === q.id} onClick={() => answer(q.id, o.value)} className={ghostBtn}>
                    {o.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-beto-gray-light">Client: {OUTCOMES.find((o) => o.value === q.outcome)?.label ?? q.outcome}</p>
            )}
          </li>
        ))}
      </ul>
      {error && <p role="alert" className="text-sm text-red-700 mt-2">{error}</p>}
    </section>
  );
}
