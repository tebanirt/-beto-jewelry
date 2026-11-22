"use client";

import Image from "next/image";
import Link from "next/link";
import { LINKS } from "@/lib/site-content";
import { useSite } from "../useSite";
import { Eyebrow, FinalCta, PaymentOptions, PhotoSlot, RingPhoto, RuledList, T } from "../ui";
import { SHOW_PHOTO_SLOTS } from "@/lib/constants";

export default function ProcessPage() {
  const { c } = useSite();
  const p = c.process;

  return (
    <>
      {/* ─── En-tête ─── */}
      <section
        aria-labelledby="titre"
        className="bj-gutter"
        style={{ paddingTop: "calc(var(--nav-height) + clamp(72px, 9vw, 136px))", paddingBottom: "clamp(56px, 6vw, 96px)" }}
      >
        <div className="bj-container bj-reveal">
          <Eyebrow className="mb-6">{p.eyebrow}</Eyebrow>
          <h1 id="titre" className="bj-serif text-balance text-beto-black" style={{ fontSize: "clamp(44px, 5.4vw, 84px)", lineHeight: 1.03, letterSpacing: "-0.01em", maxWidth: "15ch" }}>
            <T text={p.title} />
          </h1>
          <p className="mt-8 text-beto-gray" style={{ fontSize: 18, fontWeight: 300, lineHeight: 1.7, maxWidth: "34em" }}>
            <T text={p.body} />
          </p>
        </div>
      </section>

      {/* ─── Paiements ─── */}
      <section aria-labelledby="paiements" className="bj-gutter" style={{ paddingBottom: "clamp(80px, 9vw, 128px)" }}>
        <div className="bj-container bj-reveal bg-beto-ink text-beto-offwhite" style={{ padding: "clamp(32px, 4vw, 56px)" }}>
          <h2 id="paiements" className="bj-eyebrow bj-eyebrow-light" style={{ fontFamily: "var(--font-jost)", letterSpacing: ".26em" }}>
            {p.paymentsTitle}
          </h2>
          <ol className="bj-t3 mt-8 grid list-none p-0" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "32px 40px" }}>
            {p.payments.map((x) => (
              <li key={x.label} style={{ borderTop: "1px solid rgba(246,243,238,.18)", paddingTop: 24 }}>
                <p className="bj-serif text-beto-offwhite" style={{ fontSize: 48, lineHeight: 1 }}>
                  <T text={x.big} />
                </p>
                <p className="mt-4 text-beto-offwhite" style={{ fontSize: 15, lineHeight: 1.6 }}>
                  <T text={x.label} />
                </p>
                <p className="mt-1 text-beto-stone" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  <T text={x.note} />
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Étapes ─── */}
      <section aria-label={p.stepsLabel} className="bj-gutter">
        <ol className="bj-container flex list-none flex-col p-0">
          {p.steps.map((s, i) => {
            const mediaFirst = i % 2 === 0;
            const media =
              s.media.kind === "image" ? (
                <RingPhoto
                  ring={s.media.ring}
                  alt={s.media.alt}
                  sizes="(max-width: 1000px) 100vw, 600px"
                  className="w-full min-w-0"
                  style={{ flex: "1 1 440px", aspectRatio: "4 / 3" }}
                  position="50% 55%"
                />
              ) : s.media.kind === "deposit" ? (
                <div
                  className="bj-reveal flex min-w-0 flex-col items-center justify-center gap-5 bg-beto-ink p-8 text-center"
                  style={{ flex: "1 1 440px", aspectRatio: "4 / 3" }}
                >
                  <p className="bj-serif text-beto-offwhite" style={{ fontSize: "clamp(72px, 9vw, 128px)", lineHeight: 1 }}>
                    <T text={s.media.big} />
                  </p>
                  <p className="bj-eyebrow bj-eyebrow-light">
                    <T text={s.media.note} />
                  </p>
                </div>
              ) : s.media.kind === "still" ? (
                <div className="bj-settle relative w-full min-w-0 overflow-hidden bg-beto-sand" style={{ flex: "1 1 440px", aspectRatio: "4 / 3" }}>
                  <Image src={s.media.src} alt={s.media.alt} fill sizes="(max-width: 1000px) 100vw, 600px" className="object-cover" />
                </div>
              ) : SHOW_PHOTO_SLOTS ? (
                <PhotoSlot code={s.media.code} label={s.media.label} className="bj-reveal min-w-0" style={{ flex: "1 1 440px", aspectRatio: "4 / 3" }} />
              ) : null;
            const text = (
              <div className="bj-reveal min-w-0" style={{ flex: "1 1 420px" }}>
                <p className="bj-serif text-beto-gold-dark" style={{ fontSize: "clamp(64px, 7vw, 104px)", lineHeight: 0.9 }}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="bj-serif text-beto-black" style={{ fontSize: "clamp(30px, 3vw, 42px)", lineHeight: 1.15, marginTop: 24 }}>
                  <T text={s.title} />
                </h2>
                <p className="text-beto-gray" style={{ fontSize: 16, lineHeight: 1.75, marginTop: 16, maxWidth: "32em" }}>
                  <T text={s.body} />
                </p>
                {"link" in s && s.link && (
                  <p className="text-beto-gray" style={{ fontSize: 14, lineHeight: 1.6, marginTop: 16 }}>
                    <Link href={s.link.href} className="bj-prose-link">
                      {s.link.label}
                    </Link>
                  </p>
                )}
                <p className="text-beto-black" style={{ fontSize: 12, fontWeight: 500, letterSpacing: ".18em", textTransform: "uppercase", marginTop: 24 }}>
                  <T text={s.meta} />
                </p>
              </div>
            );
            return (
              <li
                key={s.title}
                className={`flex items-center ${mediaFirst ? "flex-wrap" : "flex-wrap-reverse"}`}
                style={{ gap: "40px clamp(40px, 6vw, 96px)", padding: "clamp(56px, 6vw, 88px) 0", borderTop: "1px solid #DED8CD" }}
              >
                {mediaFirst ? (
                  <>
                    {media}
                    {text}
                  </>
                ) : (
                  <>
                    {text}
                    {media}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* ─── Après la remise ─── */}
      <section aria-labelledby="apres" className="bj-gutter bg-beto-white" style={{ marginTop: "clamp(56px, 6vw, 88px)", paddingTop: "clamp(80px, 9vw, 128px)", paddingBottom: "clamp(80px, 9vw, 128px)" }}>
        <div className="bj-container flex flex-wrap gap-x-16 gap-y-10">
          <div className="bj-reveal" style={{ flex: "1 1 320px", maxWidth: 440 }}>
            <Eyebrow className="mb-5">{p.afterEyebrow}</Eyebrow>
            <h2 id="apres" className="bj-serif text-beto-black" style={{ fontSize: "clamp(34px, 3.6vw, 50px)", lineHeight: 1.1 }}>
              <T text={p.afterTitle} />
            </h2>
          </div>
          <div className="min-w-0" style={{ flex: "2 1 520px" }}>
            <RuledList items={p.after} min={220} titleSize={24} as="ul" />
          </div>
        </div>
      </section>

      <PaymentOptions ctaHref={LINKS.form} ctaLabel={c.common.seePrice} />

      <FinalCta
        title={p.finalTitle}
        body={p.finalBody}
        primary={{ href: LINKS.form, label: c.common.startDesign }}
        secondary={{ href: LINKS.book, label: c.common.bookConsultation }}
      />
    </>
  );
}
