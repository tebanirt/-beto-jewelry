"use client";

import Link from "next/link";
import { LINKS } from "@/lib/site-content";
import Rich from "../Rich";
import { useSite } from "../useSite";
import { ArrowRight, Eyebrow, FinalCta, PhotoSlot, RingPhoto, RuledList, SectionHead, T } from "../ui";

const sectionPad = { paddingTop: "clamp(88px, 10vw, 144px)", paddingBottom: "clamp(88px, 10vw, 144px)" };

export default function CustomRingsPage() {
  const { c, language } = useSite();
  const p = c.custom;

  return (
    <>
      {/* ─── En-tête ─── */}
      <section aria-labelledby="titre" className="bg-beto-ink text-beto-offwhite" style={{ paddingTop: "var(--nav-height)" }}>
        <div className="flex flex-wrap-reverse items-stretch">
          <div
            className="bj-reveal min-w-0 self-center"
            style={{
              flex: "1 1 460px",
              paddingTop: "clamp(56px, 7vw, 112px)",
              paddingBottom: "clamp(56px, 7vw, 112px)",
              paddingRight: "clamp(20px, 5vw, 96px)",
              paddingLeft: "max(clamp(20px, 4vw, 56px), calc((100% - 1248px) / 2))",
            }}
          >
            <Eyebrow light className="mb-6">
              {p.eyebrow}
            </Eyebrow>
            <h1 id="titre" className="bj-serif text-balance text-beto-offwhite" style={{ fontSize: "clamp(44px, 5.2vw, 80px)", lineHeight: 1.03, letterSpacing: "-0.01em" }}>
              <Rich text={p.title} lang={language} emClassName="text-beto-gold-light" />
            </h1>
            <p className="mt-7 text-beto-stone" style={{ fontSize: 18, fontWeight: 300, lineHeight: 1.7, maxWidth: "30em" }}>
              <T text={p.body} />
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link href={LINKS.form} className="bj-btn bj-btn-gold">
                {c.common.seePrice}
              </Link>
              <Link href={LINKS.book} className="bj-tlink bj-tlink-light">
                {c.common.bookConsultation}
                <ArrowRight />
              </Link>
            </div>
          </div>
          <RingPhoto
            ring="roseSolitaire"
            alt={p.heroAlt}
            sizes="(max-width: 1000px) 100vw, 55vw"
            priority
            className="w-full min-w-0"
            style={{ flex: "1 1 520px", minHeight: "min(520px, 100vw)", maxHeight: 760 }}
          />
        </div>
      </section>

      {/* ─── Ce que vous choisissez ─── */}
      <section aria-labelledby="choix" className="bj-gutter" style={sectionPad}>
        <div className="bj-container">
          <SectionHead eyebrow={p.choicesEyebrow} title={p.choicesTitle} id="choix" maxWidth={720} />
          <dl className="bj-g4 grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "48px 40px" }}>
            {p.choices.map((ch, i) => (
              <div key={ch.title} className="bj-reveal" style={{ borderTop: "1px solid #1B1A17", paddingTop: 28, ["--bj-delay" as string]: `${i * 80}ms` }}>
                <dt className="bj-serif bj-opsz-18 text-beto-black" style={{ fontSize: 30, lineHeight: 1.2 }}>
                  <T text={ch.title} />
                </dt>
                <dd className="text-beto-gray" style={{ fontSize: 15, lineHeight: 1.75, marginTop: 14 }}>
                  <T text={ch.body} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─── Styles ─── */}
      <section aria-labelledby="styles" className="bj-gutter bg-beto-white" style={sectionPad}>
        <div className="bj-container">
          <SectionHead eyebrow={p.stylesEyebrow} title={p.stylesTitle} id="styles" link={{ href: LINKS.work, label: p.stylesLink }} />
          <div className="bj-grid-2m grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gap: "40px 24px" }}>
            {p.styles.map((s, i) => {
              const inner = (
                <>
                  <RingPhoto ring={s.ring} alt={s.alt} sizes="(max-width: 560px) 50vw, (max-width: 1100px) 33vw, 300px" style={{ aspectRatio: "4 / 5" }} />
                  <figcaption className="mt-4">
                    <span className="bj-serif bj-opsz-18 block text-beto-black" style={{ fontSize: 24, lineHeight: 1.2 }}>
                      {s.name}
                    </span>
                    <span className="mt-1.5 block text-beto-gray" style={{ fontSize: 14, lineHeight: 1.6 }}>
                      <T text={s.body} />
                    </span>
                  </figcaption>
                </>
              );
              return (
                <figure key={s.name} className="bj-reveal" style={{ ["--bj-delay" as string]: `${(i % 4) * 70}ms` }}>
                  {s.href ? (
                    <Link href={s.href} className="group block no-underline [&_span.bj-serif]:transition-colors hover:[&_span.bj-serif]:text-beto-gold-dark">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </figure>
              );
            })}
            <figure className="bj-reveal" style={{ ["--bj-delay" as string]: "210ms" }}>
              <PhotoSlot code={p.wornPhoto.code} label={p.wornPhoto.label} style={{ aspectRatio: "4 / 5" }} />
              <figcaption className="mt-4">
                <span className="bj-serif bj-opsz-18 block text-beto-black" style={{ fontSize: 24, lineHeight: 1.2 }}>
                  {p.wornName}
                </span>
                <span className="mt-1.5 block text-beto-gray" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  <T text={p.wornBody} />
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ─── Prix ─── */}
      <section aria-labelledby="prix" className="bj-gutter" style={sectionPad}>
        <div className="bj-container flex flex-wrap gap-x-16 gap-y-12">
          <div className="bj-reveal" style={{ flex: "1 1 340px", maxWidth: 460 }}>
            <Eyebrow className="mb-5">{p.priceEyebrow}</Eyebrow>
            <h2 id="prix" className="bj-serif text-balance text-beto-black" style={{ fontSize: "clamp(36px, 4vw, 54px)", lineHeight: 1.1 }}>
              <T text={p.priceTitle} />
            </h2>
            <p className="mt-6 text-beto-gray" style={{ fontSize: 16, lineHeight: 1.75 }}>
              <T text={p.priceBody} />
            </p>
            <div className="mt-9">
              <Link href={LINKS.form} className="bj-btn bj-btn-ink">
                {c.common.seePrice}
              </Link>
            </div>
          </div>
          <div className="flex min-w-0 flex-col" style={{ flex: "2 1 520px" }}>
            {p.prices.map((row, i) => (
              <div
                key={row.title}
                className="bj-reveal flex flex-wrap justify-between gap-x-8 gap-y-2"
                style={{
                  padding: "28px 0",
                  borderTop: i === 0 ? "1px solid #1B1A17" : "1px solid #DED8CD",
                  borderBottom: i === p.prices.length - 1 ? "1px solid #DED8CD" : undefined,
                  ["--bj-delay" as string]: `${i * 70}ms`,
                }}
              >
                <h3 className="bj-serif bj-opsz-18 text-beto-black" style={{ flex: "1 1 220px", fontSize: 26, lineHeight: 1.25 }}>
                  <T text={row.title} />
                </h3>
                <p className="text-beto-gray" style={{ flex: "1.4 1 280px", fontSize: 15, lineHeight: 1.7 }}>
                  <T text={row.body} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Inclus ─── */}
      <section aria-labelledby="inclus" className="bj-gutter bg-beto-ink text-beto-offwhite" style={sectionPad}>
        <div className="bj-container">
          <SectionHead eyebrow={p.includedEyebrow} title={p.includedTitle} id="inclus" light maxWidth={720} />
          <RuledList items={p.included} dark min={220} titleSize={26} as="ul" className="bj-t2" />
        </div>
      </section>

      <FinalCta
        dark={false}
        title={p.finalTitle}
        body={p.finalBody}
        primary={{ href: LINKS.form, label: c.common.seePrice }}
        secondary={{ href: LINKS.book, label: c.common.bookConsultation }}
      />
    </>
  );
}
