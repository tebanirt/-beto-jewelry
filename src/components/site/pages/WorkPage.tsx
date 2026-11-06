"use client";

import Link from "next/link";
import { useState } from "react";
import { LINKS } from "@/lib/site-content";
import { useSite } from "../useSite";
import { ArrowRight, Eyebrow, FinalCta, PhotoSlot, RingPhoto, T } from "../ui";

const sectionPad = { paddingTop: "clamp(88px, 10vw, 144px)", paddingBottom: "clamp(88px, 10vw, 144px)" };

export default function WorkPage() {
  const { c } = useSite();
  const p = c.work;
  const [filter, setFilter] = useState("all");
  const items = filter === "all" ? p.items : p.items.filter((it) => it.tag === filter);

  return (
    <>
      {/* ─── En-tête ─── */}
      <section
        aria-labelledby="titre"
        className="bj-gutter"
        style={{ paddingTop: "calc(var(--nav-height) + clamp(72px, 9vw, 136px))", paddingBottom: "clamp(40px, 5vw, 64px)" }}
      >
        <div className="bj-container bj-reveal flex flex-wrap items-end justify-between gap-x-16 gap-y-8">
          <div className="min-w-0" style={{ flex: "1 1 520px" }}>
            <Eyebrow className="mb-6">{p.eyebrow}</Eyebrow>
            <h1 id="titre" className="bj-serif text-balance text-beto-black" style={{ fontSize: "clamp(44px, 5.4vw, 84px)", lineHeight: 1.03, letterSpacing: "-0.01em", maxWidth: "13ch" }}>
              <T text={p.title} />
            </h1>
          </div>
          <p className="text-beto-gray" style={{ flex: "1 1 340px", maxWidth: 440, fontSize: 17, fontWeight: 300, lineHeight: 1.7 }}>
            <T text={p.body} />
          </p>
        </div>
      </section>

      {/* ─── Filtres et grille ─── */}
      <section aria-label={p.gridLabel} className="bj-gutter" style={{ paddingBottom: "clamp(80px, 9vw, 128px)" }}>
        <div className="bj-container">
          <div role="group" aria-label={p.filterLabel} className="flex flex-wrap gap-2.5 border-t border-beto-gray-subtle pt-6 pb-10">
            {p.filters.map((f) => (
              <button key={f.key} type="button" className="bj-chip" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="bj-grid-2m grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "48px 24px" }}>
            {items.map((it, i) => (
              <figure key={it.ring} className="bj-reveal" style={{ ["--bj-delay" as string]: `${(i % 3) * 70}ms` }}>
                <RingPhoto ring={it.ring} alt={it.alt} sizes="(max-width: 560px) 50vw, (max-width: 1100px) 50vw, 400px" style={{ aspectRatio: "4 / 5" }} />
                <figcaption className="mt-3.5 flex flex-wrap justify-between gap-x-4 gap-y-0.5 text-[14px] tracking-[.04em] text-beto-gray">
                  <span className="text-beto-black">{it.name}</span>
                  <span className="whitespace-nowrap">{it.metal}</span>
                </figcaption>
              </figure>
            ))}
            <Link
              href={LINKS.form}
              className="bj-reveal bj-span-2m group flex flex-col justify-between gap-8 bg-beto-ink text-beto-offwhite no-underline"
              style={{ aspectRatio: "4 / 5", padding: "clamp(28px, 3vw, 40px)" }}
            >
              <Eyebrow light>{p.nextEyebrow}</Eyebrow>
              <div>
                <p className="bj-serif text-beto-offwhite" style={{ fontSize: "clamp(30px, 2.6vw, 38px)", lineHeight: 1.15 }}>
                  <T text={p.nextTitle} />
                </p>
                <span className="mt-7 inline-flex items-center gap-2.5 border-b border-current pb-1.5 text-[13px] font-medium uppercase tracking-[.16em] transition-colors group-hover:text-beto-gold">
                  {c.common.startDesign}
                  <ArrowRight />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Du rendu à la bague ─── */}
      <section aria-labelledby="rendu" className="bj-gutter bg-beto-white" style={sectionPad}>
        <div className="bj-container">
          <div className="bj-reveal" style={{ maxWidth: 720, marginBottom: "clamp(48px, 6vw, 72px)" }}>
            <Eyebrow className="mb-5">{p.renderEyebrow}</Eyebrow>
            <h2 id="rendu" className="bj-serif text-balance text-beto-black" style={{ fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1.1 }}>
              <T text={p.renderTitle} />
            </h2>
          </div>
          <div className="bj-t3 grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))", gap: "40px 24px" }}>
            {[1, 2, 3].map((n) => {
              const pair = p.renderPair(n);
              return (
                <figure key={n} className="bj-reveal" style={{ ["--bj-delay" as string]: `${(n - 1) * 80}ms` }}>
                  <div className="bj-pair grid gap-2" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                    <PhotoSlot code="P12" label={pair.render} tag={pair.renderTag} small style={{ aspectRatio: "4 / 5" }} />
                    <PhotoSlot code="P12" label={pair.ring} tag={pair.ringTag} small style={{ aspectRatio: "4 / 5" }} />
                  </div>
                  <figcaption className="mt-3.5 text-[14px] text-beto-gray">
                    <T text={pair.caption} />
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Portées ─── */}
      <section aria-labelledby="portees" className="bj-gutter" style={sectionPad}>
        <div className="bj-container">
          <div className="bj-reveal" style={{ maxWidth: 720, marginBottom: "clamp(48px, 6vw, 72px)" }}>
            <Eyebrow className="mb-5">{p.wornEyebrow}</Eyebrow>
            <h2 id="portees" className="bj-serif text-balance text-beto-black" style={{ fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1.1 }}>
              <T text={p.wornTitle} />
            </h2>
            <p className="mt-5 text-beto-gray" style={{ fontSize: 15, lineHeight: 1.7 }}>
              <T text={p.wornBody} />
            </p>
          </div>
          <div className="bj-g4 bj-grid-2m grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 24 }}>
            {[1, 2, 3, 4].map((n) => (
              <PhotoSlot key={n} code="P14" label={p.wornPhoto(n)} className="bj-reveal" style={{ aspectRatio: "4 / 5", ["--bj-delay" as string]: `${(n - 1) * 70}ms` }} />
            ))}
          </div>
        </div>
      </section>

      <FinalCta
        title={p.finalTitle}
        body={p.finalBody}
        primary={{ href: LINKS.form, label: c.common.startDesign }}
        secondary={{ href: LINKS.book, label: c.common.bookConsultation }}
      />
    </>
  );
}
