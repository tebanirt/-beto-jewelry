"use client";

import { LINKS } from "@/lib/site-content";
import Rich from "../Rich";
import { useSite } from "../useSite";
import { Eyebrow, FinalCta, PhotoSlot, RuledList, T } from "../ui";

const sectionPad = { paddingTop: "clamp(88px, 10vw, 144px)", paddingBottom: "clamp(88px, 10vw, 144px)" };

export default function AboutPage() {
  const { c, language } = useSite();
  const p = c.about;
  const review = c.home.reviews[0];

  return (
    <>
      {/* ─── Portrait et histoire ─── */}
      <section
        aria-labelledby="titre"
        className="bj-gutter"
        style={{ paddingTop: "calc(var(--nav-height) + clamp(64px, 8vw, 120px))", paddingBottom: "clamp(64px, 8vw, 120px)" }}
      >
        <div className="bj-container flex flex-wrap items-center gap-y-12" style={{ columnGap: "clamp(48px, 7vw, 112px)" }}>
          <PhotoSlot code={p.portrait.code} label={p.portrait.label} className="bj-reveal min-w-0" style={{ flex: "1 1 400px", aspectRatio: "4 / 5", padding: 20 }} />
          <div className="bj-reveal min-w-0" style={{ flex: "1.15 1 460px" }}>
            <Eyebrow className="mb-6">{p.eyebrow}</Eyebrow>
            <h1 id="titre" className="bj-serif text-beto-black" style={{ fontSize: "clamp(44px, 5vw, 76px)", lineHeight: 1.04, letterSpacing: "-0.01em" }}>
              <T text={p.title} />
            </h1>
            <p className="bj-serif bj-opsz-18 mt-8 italic text-beto-black" style={{ fontSize: "clamp(22px, 2vw, 28px)", lineHeight: 1.45, maxWidth: "26em" }}>
              <T text={p.quote} />
            </p>
            {p.body.map((b, i) => (
              <p key={b} className="text-beto-gray" style={{ fontSize: 16, lineHeight: 1.8, marginTop: i === 0 ? 28 : 16, maxWidth: "34em" }}>
                <T text={b} />
              </p>
            ))}
            <p className="mt-9 text-[13px] font-medium uppercase tracking-[.18em] text-beto-black">{p.signature}</p>
          </div>
        </div>
      </section>

      {/* ─── En bref ─── */}
      <section aria-label={p.factsLabel} className="bj-gutter bg-beto-ink text-beto-offwhite" style={{ paddingTop: "clamp(64px, 7vw, 104px)", paddingBottom: "clamp(64px, 7vw, 104px)" }}>
        <dl className="bj-container bj-t2 grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "40px 32px" }}>
          {p.facts.map((f, i) => (
            <div key={f.big} className="bj-reveal" style={{ borderTop: "1px solid rgba(246,243,238,.18)", paddingTop: 24, ["--bj-delay" as string]: `${i * 80}ms` }}>
              <dt className="bj-serif text-beto-offwhite" style={{ fontSize: 40, lineHeight: 1.1 }}>
                {f.big}
              </dt>
              <dd className="mt-3 text-beto-stone" style={{ fontSize: 15, lineHeight: 1.6 }}>
                <T text={f.label} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ─── Vision ─── */}
      <section aria-labelledby="vision" className="bj-gutter" style={sectionPad}>
        <div className="bj-container">
          <div className="bj-reveal" style={{ maxWidth: 820, marginBottom: "clamp(56px, 6vw, 88px)" }}>
            <Eyebrow className="mb-5">{p.visionEyebrow}</Eyebrow>
            <h2 id="vision" className="bj-serif text-balance text-beto-black" style={{ fontSize: "clamp(36px, 4.2vw, 60px)", lineHeight: 1.08 }}>
              <T text={p.visionTitle} />
            </h2>
          </div>
          <RuledList items={p.vision} min={300} className="bj-t3" />
        </div>
      </section>

      {/* ─── Atelier ─── */}
      <section aria-labelledby="atelier" className="bj-gutter bg-beto-white" style={sectionPad}>
        <div className="bj-container">
          <div className="bj-reveal" style={{ maxWidth: 720, marginBottom: "clamp(48px, 6vw, 72px)" }}>
            <Eyebrow className="mb-5">{p.workshopEyebrow}</Eyebrow>
            <h2 id="atelier" className="bj-serif text-balance text-beto-black" style={{ fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1.1 }}>
              <T text={p.workshopTitle} />
            </h2>
          </div>
          <div className="flex flex-wrap gap-6">
            <PhotoSlot code={p.workshopPhotos[0].code} label={p.workshopPhotos[0].label} className="bj-reveal min-w-0" style={{ flex: "2 1 520px", aspectRatio: "3 / 2" }} />
            <div className="flex min-w-0 flex-col gap-6" style={{ flex: "1 1 300px" }}>
              {p.workshopPhotos.slice(1).map((ph) => (
                <PhotoSlot key={ph.code} code={ph.code} label={ph.label} className="bj-reveal" style={{ flex: "1 1 200px", minHeight: 200 }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Avis ─── */}
      <section aria-label={p.reviewLabel} className="bj-gutter text-center" style={sectionPad}>
        <figure className="bj-reveal mx-auto" style={{ maxWidth: 860 }}>
          <p aria-label={c.common.stars} className="text-[14px] tracking-[.3em] text-beto-gold-dark">
            ★★★★★
          </p>
          <blockquote lang={review.lang} className="bj-serif mt-7 italic text-beto-black" style={{ fontSize: "clamp(26px, 2.8vw, 38px)", lineHeight: 1.35 }}>
            <Rich text={language === "fr" ? `« ${review.quote} »` : `“${review.quote}”`} lang={language} />
          </blockquote>
          <figcaption className="mt-7 text-[13px] uppercase tracking-[.16em] text-beto-gray">{p.reviewAuthor}</figcaption>
        </figure>
      </section>

      <FinalCta
        title={p.finalTitle}
        body={p.finalBody}
        primary={{ href: LINKS.book, label: c.common.bookConsultation }}
        secondary={{ href: LINKS.form, label: c.common.seePrice }}
      />
    </>
  );
}
