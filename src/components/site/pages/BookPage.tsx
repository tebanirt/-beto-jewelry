"use client";

import { useEffect, useState } from "react";
import { DEPOSIT_PAYMENT_URL } from "@/lib/constants";
import { EMAIL_DISPLAY, LINKS } from "@/lib/site-content";
import { trackMetaLead } from "@/lib/metaPixel";
import { submitLeadForm } from "@/lib/submitForm";
import Rich from "../Rich";
import { useSite } from "../useSite";
import { ArrowUpRight, Check, Eyebrow, T } from "../ui";

type Place = "downtown" | "saintLaurent" | "video";
type Status = "idle" | "sending" | "success" | "error";

const PLACES: Place[] = ["downtown", "saintLaurent", "video"];

export default function BookPage() {
  const { c, language } = useSite();
  const p = c.book;
  const [place, setPlace] = useState<Place>("downtown");
  const [status, setStatus] = useState<Status>("idle");

  // Le bouton « Réserver au centre-ville » de l'accueil arrive avec ?lieu=…
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("lieu");
    if (wanted && (PLACES as string[]).includes(wanted)) queueMicrotask(() => setPlace(wanted as Place));
  }, []);

  const calendlyUrl = place === "video" ? LINKS.calendlyVideo : LINKS.calendlyInPerson;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (k: string) => data.get(k)?.toString().trim() || "";
    setStatus("sending");
    const ok = await submitLeadForm("consultation", {
      "Nom complet": get("nom"),
      Courriel: get("courriel"),
      Téléphone: get("telephone"),
      Langue: get("langue"),
      "Lieu souhaité": p.places.find((x) => x.key === place)?.title ?? "",
      Message: get("message"),
      email: get("courriel"),
    });
    if (ok) {
      setStatus("success");
      trackMetaLead("consultation");
      form.reset();
    } else {
      setStatus("error");
    }
  }

  return (
    <>
      {/* ─── En-tête ─── */}
      <section
        aria-labelledby="titre"
        className="bj-gutter"
        style={{ paddingTop: "calc(var(--nav-height) + clamp(56px, 7vw, 104px))", paddingBottom: "clamp(40px, 4vw, 56px)" }}
      >
        <div className="bj-container bj-reveal">
          <Eyebrow>{p.eyebrow}</Eyebrow>
          <h1 id="titre" className="bj-serif mt-6 text-beto-black" style={{ fontSize: "clamp(44px, 5.6vw, 80px)", lineHeight: 1.02, letterSpacing: "-.01em", maxWidth: "13em" }}>
            <Rich text={p.title} lang={language} />
          </h1>
          <p className="mt-7 text-beto-gray" style={{ fontSize: 18, fontWeight: 300, lineHeight: 1.7, maxWidth: "36em" }}>
            <T text={p.body} />
          </p>
          <ul className="bj-checks mt-9 flex flex-wrap gap-x-9 gap-y-3 text-[14px] tracking-[.02em] text-beto-black">
            {p.checks.map((ch) => (
              <li key={ch} className="flex items-center gap-2.5">
                <Check color="#7D5F2B" />
                <T text={ch} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Réservation ─── */}
      <section aria-label={p.sectionLabel} className="bj-gutter" style={{ paddingBottom: "clamp(80px, 9vw, 128px)" }}>
        <div className="bj-container bj-book border-t border-beto-gray-subtle" style={{ paddingTop: "clamp(48px, 5vw, 72px)" }}>
          <div className="min-w-0" style={{ gridArea: "lieu" }}>
            <fieldset className="m-0 border-0 p-0">
              <legend className="flex items-baseline gap-3.5 p-0">
                <span className="bj-serif bj-opsz-11 text-[15px] text-beto-gold-dark">01</span>
                <span className="bj-serif bj-opsz-18 text-beto-black" style={{ fontSize: 30, lineHeight: 1.15 }}>
                  {p.step1}
                </span>
              </legend>
              <div className="mt-7 flex flex-col gap-3">
                {p.places.map((pl) => (
                  <label key={pl.key} className="bj-choice">
                    <input type="radio" name="lieu" value={pl.key} checked={place === pl.key} onChange={() => setPlace(pl.key as Place)} />
                    <span className="bj-choice-dot" aria-hidden="true" />
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-[16px] font-medium text-beto-black">
                        <T text={pl.title} />
                      </span>
                      <span className="text-[14px] leading-[1.55] text-beto-gray">
                        <T text={pl.line} />
                      </span>
                      {pl.ideal && (
                        <span className="text-[13px] text-beto-gold-dark">
                          <T text={pl.ideal} />
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="min-w-0" style={{ gridArea: "how" }}>
            <p className="text-[12px] font-medium uppercase tracking-[.22em] text-beto-gray">{p.howTitle}</p>
            <ol className="mt-6 flex list-none flex-col border-l border-beto-gray-subtle p-0">
              {p.how.map((step, i) => (
                <li key={step.title} className="relative pl-7" style={{ paddingBottom: i === p.how.length - 1 ? 0 : 28 }}>
                  <span aria-hidden="true" className="absolute rounded-full bg-beto-gold" style={{ left: -4, top: 7, width: 7, height: 7 }} />
                  <p className="text-[15px] font-medium text-beto-black">{step.title}</p>
                  <p className="mt-1 text-[15px] leading-[1.7] text-beto-gray">
                    <T text={step.body} />
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="min-w-0" style={{ gridArea: "cal" }}>
            <div className="flex items-baseline gap-3.5">
              <span className="bj-serif bj-opsz-11 text-[15px] text-beto-gold-dark">02</span>
              <h2 className="bj-serif bj-opsz-18 text-beto-black" style={{ fontSize: 30, lineHeight: 1.15 }}>
                {p.step2}
              </h2>
            </div>
            <div className="mt-7 flex flex-col justify-between gap-10 bg-beto-ink text-beto-offwhite" style={{ padding: "clamp(28px, 4vw, 56px)", minHeight: "clamp(360px, 34vw, 460px)" }}>
              <div>
                <p className="bj-eyebrow bj-eyebrow-light">{p.places.find((x) => x.key === place)?.title}</p>
                <p className="bj-serif mt-5 text-beto-offwhite" style={{ fontSize: "clamp(30px, 3vw, 42px)", lineHeight: 1.12 }}>
                  <T text={p.calendarTitle} />
                </p>
                <p className="mt-5 text-beto-stone" style={{ fontSize: 16, lineHeight: 1.75, maxWidth: "30em" }} aria-live="polite">
                  <T text={p.calendarBody[place]} />
                </p>
              </div>
              <div>
                <a href={calendlyUrl} className="bj-btn bj-btn-gold">
                  {p.calendarCta}
                  <ArrowUpRight />
                </a>
                <p className="mt-4 text-[13px] leading-[1.6] text-[#8F897F]">
                  <T text={p.calendarNote} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Dépôt : seulement quand le vrai lien Stripe existe (règle du 3 nov. 2026) ─── */}
      {DEPOSIT_PAYMENT_URL && (
        <section aria-labelledby="depot" className="bj-gutter bg-beto-ink text-beto-offwhite" style={{ paddingTop: "clamp(80px, 9vw, 136px)", paddingBottom: "clamp(80px, 9vw, 136px)" }}>
          <div className="bj-container flex flex-wrap items-center justify-between gap-y-14" style={{ columnGap: "clamp(48px, 7vw, 112px)" }}>
            <div className="bj-reveal" style={{ flex: "1 1 420px", maxWidth: 560 }}>
              <Eyebrow light>{p.depositEyebrow}</Eyebrow>
              <h2 id="depot" className="bj-serif mt-5 text-beto-offwhite" style={{ fontSize: "clamp(38px, 4.4vw, 60px)", lineHeight: 1.05 }}>
                <T text={p.depositTitle} />
              </h2>
              <p className="mt-6 text-beto-stone" style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.75, maxWidth: "30em" }}>
                <T text={p.depositBody} />
              </p>
            </div>
            <div className="bj-reveal min-w-0 border border-beto-offwhite/15" style={{ flex: "1 1 400px", maxWidth: 520, padding: "clamp(28px, 3.5vw, 44px)" }}>
              <dl className="m-0">
                {p.depositRows.map((row, i) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-6"
                    style={{
                      paddingTop: i === 0 ? 0 : 20,
                      paddingBottom: i === p.depositRows.length - 1 ? 0 : 20,
                      borderBottom: i === p.depositRows.length - 1 ? undefined : "1px solid rgba(246,243,238,.12)",
                    }}
                  >
                    <dt className="text-[15px] text-beto-offwhite">
                      <T text={row.label} />
                      {row.note && (
                        <span className="mt-1 block text-[13px] text-beto-stone">
                          <T text={row.note} />
                        </span>
                      )}
                    </dt>
                    <dd className={i === 0 ? "bj-serif m-0 text-[34px] leading-none text-beto-gold" : "m-0 text-[15px] text-beto-stone"}>
                      <T text={row.value} />
                    </dd>
                  </div>
                ))}
              </dl>
              <a href={DEPOSIT_PAYMENT_URL} className="bj-btn bj-btn-gold mt-8 w-full">
                {p.depositCta}
              </a>
              <p className="mt-3.5 text-center text-[13px] leading-[1.6] text-[#8F897F]">{p.depositNote}</p>
            </div>
          </div>
        </section>
      )}

      {/* ─── Écrire ─── */}
      <section aria-labelledby="ecrire" className="bj-gutter bg-beto-white" style={{ paddingTop: "clamp(80px, 9vw, 136px)", paddingBottom: "clamp(80px, 9vw, 136px)" }}>
        <div className="bj-container flex flex-wrap items-start gap-y-14" style={{ columnGap: "clamp(48px, 7vw, 112px)" }}>
          <div className="bj-reveal" style={{ flex: "1 1 300px", maxWidth: 400 }}>
            <Eyebrow>{p.writeEyebrow}</Eyebrow>
            <h2 id="ecrire" className="bj-serif mt-5 text-beto-black" style={{ fontSize: "clamp(36px, 3.8vw, 52px)", lineHeight: 1.06 }}>
              <T text={p.writeTitle} />
            </h2>
            <p className="mt-5 text-beto-gray" style={{ fontSize: 16, lineHeight: 1.75 }}>
              <T text={p.writeBody} />
            </p>
            <div className="mt-9 flex flex-col gap-1 text-[15px] sm:gap-3.5">
              <a href={LINKS.whatsapp} className="bj-prose-link inline-flex min-h-11 items-center self-start sm:min-h-0">
                {p.writeLinks.whatsapp}
              </a>
              <a href={LINKS.phoneTel} className="bj-prose-link inline-flex min-h-11 items-center self-start sm:min-h-0">
                {p.writeLinks.phone}
              </a>
              <a href={LINKS.email} className="bj-prose-link inline-flex min-h-11 items-center self-start sm:min-h-0">
                {EMAIL_DISPLAY}
              </a>
            </div>
          </div>

          <div className="min-w-0" style={{ flex: "1.4 1 480px" }}>
            {status === "success" ? (
              <div role="status" className="border border-beto-gray-subtle bg-beto-offwhite" style={{ padding: "clamp(28px, 4vw, 48px)" }}>
                <p className="bj-serif bj-opsz-18 text-beto-black" style={{ fontSize: 28, lineHeight: 1.25 }}>
                  <T text={p.form.success} />
                </p>
                <a href={calendlyUrl} className="bj-btn bj-btn-ink mt-8">
                  {p.calendarCta}
                  <ArrowUpRight />
                </a>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "24px 20px" }}>
                <div className="bj-field">
                  <label htmlFor="c-nom">{p.form.name}</label>
                  <input id="c-nom" name="nom" type="text" autoComplete="name" required />
                </div>
                <div className="bj-field">
                  <label htmlFor="c-courriel">{p.form.email}</label>
                  <input id="c-courriel" name="courriel" type="email" autoComplete="email" required />
                </div>
                <div className="bj-field">
                  <label htmlFor="c-tel">
                    {p.form.phone} <span className="font-normal text-beto-gray">{p.form.optional}</span>
                  </label>
                  <input id="c-tel" name="telephone" type="tel" autoComplete="tel" />
                </div>
                <div className="bj-field">
                  <label htmlFor="c-langue">{p.form.language}</label>
                  <select id="c-langue" name="langue" key={language}>
                    {p.form.languages.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="bj-field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="c-message">{p.form.message}</label>
                  <textarea id="c-message" name="message" rows={5} placeholder={p.form.placeholder} required />
                </div>
                <div className="flex flex-wrap items-center gap-x-7 gap-y-4" style={{ gridColumn: "1 / -1" }}>
                  <button type="submit" className="bj-btn bj-btn-ink" disabled={status === "sending"}>
                    {status === "sending" ? p.form.sending : p.form.send}
                  </button>
                  <p className="text-[13px] leading-[1.6] text-beto-gray" style={{ maxWidth: "30em" }}>
                    <T text={p.form.privacy} />
                  </p>
                </div>
                {status === "error" && (
                  <p role="alert" className="text-[14px] leading-[1.6] text-[#9F0712]" style={{ gridColumn: "1 / -1" }}>
                    <T text={p.form.error} />
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── Avant de réserver ─── */}
      <section aria-labelledby="rassurance" className="bj-gutter border-t border-beto-gray-subtle" style={{ paddingTop: "clamp(72px, 8vw, 120px)", paddingBottom: "clamp(72px, 8vw, 120px)" }}>
        <div className="bj-container">
          <h2 id="rassurance" className="bj-serif text-beto-black" style={{ fontSize: "clamp(32px, 3.2vw, 44px)", lineHeight: 1.1 }}>
            <T text={p.reassureTitle} />
          </h2>
          <div className="bj-t3 mt-10 grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "40px 32px" }}>
            {p.reassure.map((r, i) => (
              <div key={r.title} className="bj-reveal" style={{ borderTop: "1px solid #1B1A17", paddingTop: 24, ["--bj-delay" as string]: `${i * 80}ms` }}>
                <h3 className="bj-serif bj-opsz-18 text-beto-black" style={{ fontSize: 24, lineHeight: 1.25 }}>
                  <T text={r.title} />
                </h3>
                <p className="mt-3 text-beto-gray" style={{ fontSize: 15, lineHeight: 1.75 }}>
                  <T text={r.body} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
