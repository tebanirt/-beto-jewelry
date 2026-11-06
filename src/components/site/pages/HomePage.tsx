"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GOOGLE_REVIEW_URL } from "@/lib/constants";
import { LINKS, PHONE_DISPLAY } from "@/lib/site-content";
import Rich from "../Rich";
import { useSite } from "../useSite";
import { ArrowRight, ArrowUpRight, Check, Eyebrow, FinalCta, OfficeCards, RingPhoto, RuledList, SectionHead, T } from "../ui";

const sectionPad = { paddingTop: "clamp(88px, 10vw, 144px)", paddingBottom: "clamp(88px, 10vw, 144px)" };

function HeroVideo() {
  const { c } = useSite();
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  // Muet forcé (iOS l'exige pour la lecture auto), respect de « moins de
  // mouvement », et un bouton pause toujours visible (WCAG 2.2.2). Si la
  // lecture auto est refusée (mode économie d'énergie), l'affiche reste.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    const sync = () => setPaused(v.paused);
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) v.pause();
    else v.play().catch(sync);
    sync();
    return () => {
      v.removeEventListener("play", sync);
      v.removeEventListener("pause", sync);
    };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => setPaused(true));
    else v.pause();
  };

  return (
    <div className="bj-hero-media">
      <video
        ref={ref}
        data-hero-video=""
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        poster="/videos/hero-poster.jpg"
        aria-label={c.home.heroVideoLabel}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "50% 45%" }}
      >
        <source src="/videos/hero-square.mp4" type="video/mp4" media="(max-width: 760px)" />
        <source src="/videos/hero-1080.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        className="bj-hero-toggle"
        aria-pressed={paused}
        aria-label={paused ? c.common.playVideo : c.common.pauseVideo}
        onClick={toggle}
      >
        {paused ? (
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M4 2.2v9.6L11.6 7z" />
          </svg>
        ) : (
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4.5 2.5v9M9.5 2.5v9" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function HomePage() {
  const { c, language } = useSite();
  const h = c.home;

  return (
    <>
      {/* ─── Hero ─── */}
      <section aria-label={h.heroRegion} className="relative bg-beto-ink text-beto-offwhite">
        <div className="bj-gutter bj-hero-wrap mx-auto" style={{ maxWidth: 1360, paddingTop: "var(--bj-header-top)" }}>
          <div className="bj-hero-text">
            <Eyebrow light className="mb-7">
              {h.heroEyebrow}
            </Eyebrow>
            <h1 className="bj-serif text-balance text-beto-offwhite" style={{ fontSize: "clamp(46px, 5.6vw, 86px)", lineHeight: 1.02, letterSpacing: "-0.01em" }}>
              <Rich text={h.heroTitle} lang={language} emClassName="text-beto-gold-light" />
            </h1>
            <p className="bj-hero-sub mt-7 text-pretty text-beto-stone" style={{ fontSize: 18, fontWeight: 300, lineHeight: 1.7, maxWidth: "30em" }}>
              <T text={h.heroBody} />
            </p>
            <div className="bj-hero-cta mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Link href={LINKS.book} className="bj-btn bj-btn-gold">
                {c.common.bookConsultation}
              </Link>
              <Link href={LINKS.form} className="bj-tlink bj-tlink-light">
                {c.common.seePrice}
                <ArrowRight />
              </Link>
            </div>
            <ul className="bj-hero-trust mt-12 flex flex-col gap-3 text-[13px] tracking-[.04em] text-beto-stone">
              {h.heroTrust.map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <Check />
                  <T text={t} />
                </li>
              ))}
            </ul>
          </div>
          <HeroVideo />
        </div>
      </section>

      {/* ─── Approche ─── */}
      <section aria-labelledby="approche" className="bj-gutter" style={{ paddingTop: "clamp(88px, 11vw, 160px)", paddingBottom: "clamp(88px, 11vw, 160px)" }}>
        <div className="bj-container flex flex-wrap gap-x-16 gap-y-8">
          <p id="approche" className="bj-eyebrow pt-3.5" style={{ flex: "1 1 220px" }}>
            {h.approachEyebrow}
          </p>
          <div className="bj-reveal min-w-0" style={{ flex: "3 1 560px" }}>
            <p className="bj-serif text-pretty text-beto-black" style={{ fontSize: "clamp(30px, 3.4vw, 50px)", lineHeight: 1.18 }}>
              <T text={h.approachLead} />
            </p>
            <div className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
              {h.approachBody.map((p) => (
                <p key={p} className="text-beto-gray" style={{ flex: "1 1 280px", fontSize: 16, lineHeight: 1.75 }}>
                  <T text={p} />
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Processus ─── */}
      <section aria-labelledby="processus" className="bj-gutter bg-beto-white" style={sectionPad}>
        <div className="bj-container">
          <SectionHead eyebrow={h.processEyebrow} title={h.processTitle} id="processus" link={{ href: LINKS.process, label: h.processLink }} />
          <ol className="bj-g5 grid list-none p-0" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(210px, 100%), 1fr))", gap: "40px 32px" }}>
            {h.processSteps.map((s, i) => (
              <li key={s.title} className="bj-reveal flex flex-col" style={{ borderTop: "1px solid #1B1A17", paddingTop: 28, ["--bj-delay" as string]: `${i * 80}ms` }}>
                <p className="bj-serif text-beto-gold-dark" style={{ fontSize: 44, lineHeight: 1 }}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="bj-serif bj-opsz-18 text-beto-black" style={{ fontSize: 26, lineHeight: 1.2, marginTop: 28 }}>
                  <T text={s.title} />
                </h3>
                <p className="text-beto-gray" style={{ fontSize: 15, lineHeight: 1.7, marginTop: 12 }}>
                  <T text={s.body} />
                </p>
                <p className="mt-auto pt-5 text-beto-black" style={{ fontSize: 12, fontWeight: 500, letterSpacing: ".18em", textTransform: "uppercase" }}>
                  <T text={s.meta} />
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Réalisations ─── */}
      <section aria-labelledby="realisations" className="bj-gutter" style={sectionPad}>
        <div className="bj-container">
          <SectionHead eyebrow={h.workEyebrow} title={h.workTitle} id="realisations" link={{ href: LINKS.work, label: h.workLink }} />
          <div className="flex flex-wrap gap-6">
            <figure className="bj-reveal flex min-w-0 flex-col" style={{ flex: "1 1 460px" }}>
              <RingPhoto
                ring={h.work[0].ring}
                alt={h.work[0].alt}
                sizes="(max-width: 1100px) 100vw, 620px"
                className="w-full flex-auto"
                style={{ minHeight: 440 }}
              />
              <figcaption className="mt-4 flex justify-between gap-4 text-[13px] tracking-[.06em] text-beto-gray">
                <span className="text-beto-black">{h.work[0].name}</span>
                <span>{h.work[0].metal}</span>
              </figcaption>
            </figure>
            <div className="bj-t2 bj-grid-2m grid min-w-0 content-start" style={{ flex: "1 1 460px", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 24 }}>
              {h.work.slice(1).map((w, i) => (
                <figure key={w.ring} className="bj-reveal" style={{ ["--bj-delay" as string]: `${(i + 1) * 80}ms` }}>
                  <RingPhoto ring={w.ring} alt={w.alt} sizes="(max-width: 1100px) 50vw, 300px" style={{ aspectRatio: "4 / 5" }} />
                  <figcaption className="mt-4 flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-[13px] tracking-[.06em] text-beto-gray">
                    <span className="text-beto-black">{w.name}</span>
                    <span className="whitespace-nowrap">{w.metal}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pourquoi Beto ─── */}
      <section aria-labelledby="pourquoi" className="bj-gutter bg-beto-ink text-beto-offwhite" style={{ paddingTop: "clamp(88px, 10vw, 152px)", paddingBottom: "clamp(88px, 10vw, 152px)" }}>
        <div className="bj-container">
          <SectionHead eyebrow={h.whyEyebrow} title={h.whyTitle} id="pourquoi" light maxWidth={720} />
          <RuledList items={h.why} dark min={260} className="bj-g4" />
        </div>
      </section>

      {/* ─── Diamants ─── */}
      <section aria-labelledby="diamants" className="bj-gutter" style={sectionPad}>
        <div className="bj-container flex flex-wrap items-center gap-y-12" style={{ columnGap: "clamp(40px, 6vw, 96px)" }}>
          <RingPhoto
            ring="cushionSolitaire"
            alt={h.diamondsImageAlt}
            sizes="(max-width: 1000px) 100vw, 580px"
            className="w-full min-w-0"
            style={{ flex: "1 1 420px", aspectRatio: "4 / 5" }}
          />
          <div className="bj-reveal min-w-0" style={{ flex: "1 1 420px" }}>
            <Eyebrow className="mb-5">{h.diamondsEyebrow}</Eyebrow>
            <h2 id="diamants" className="bj-serif text-balance text-beto-black" style={{ fontSize: "clamp(36px, 4vw, 54px)", lineHeight: 1.1 }}>
              <T text={h.diamondsTitle} />
            </h2>
            {h.diamondsBody.map((p, i) => (
              <p key={p} className="text-beto-gray" style={{ fontSize: 16, lineHeight: 1.75, marginTop: i === 0 ? 28 : 16, maxWidth: "34em" }}>
                <T text={p} />
              </p>
            ))}
            <div className="mt-9">
              <Link href={LINKS.education} className="bj-tlink">
                {h.diamondsLink}
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Avis ─── */}
      <section aria-labelledby="avis" className="bj-gutter bg-beto-white" style={sectionPad}>
        <div className="bj-container">
          <div className="bj-reveal flex flex-wrap items-end justify-between gap-x-12 gap-y-6" style={{ marginBottom: "clamp(48px, 6vw, 72px)" }}>
            <div style={{ maxWidth: 640 }}>
              <Eyebrow className="mb-5">{h.reviewsEyebrow}</Eyebrow>
              <h2 id="avis" className="bj-serif text-beto-black" style={{ fontSize: "clamp(36px, 4vw, 58px)", lineHeight: 1.08 }}>
                <T text={h.reviewsTitle} />
              </h2>
            </div>
            <a href={GOOGLE_REVIEW_URL} className="bj-tlink">
              {h.reviewsLink}
              <ArrowUpRight />
            </a>
          </div>
          <div className="bj-t1 grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "48px 40px" }}>
            {h.reviews.map((r, i) => (
              <figure key={r.author} className="bj-reveal flex flex-col gap-7" style={{ ["--bj-delay" as string]: `${i * 90}ms` }}>
                <p aria-label={c.common.stars} className="text-[14px] tracking-[.3em] text-beto-gold-dark">
                  ★★★★★
                </p>
                <blockquote lang={r.lang} className="bj-serif bj-opsz-18 italic text-beto-black" style={{ fontSize: 24, lineHeight: 1.4 }}>
                  <Rich text={language === "fr" ? `« ${r.quote} »` : `“${r.quote}”`} lang={language} />
                </blockquote>
                <figcaption className="text-[13px] uppercase tracking-[.12em] text-beto-gray">{r.author}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bureaux ─── */}
      <section aria-labelledby="bureaux" className="bj-gutter" style={sectionPad}>
        <div className="bj-container">
          <div className="bj-reveal" style={{ maxWidth: 720, marginBottom: "clamp(48px, 6vw, 72px)" }}>
            <Eyebrow className="mb-5">{h.officesEyebrow}</Eyebrow>
            <h2 id="bureaux" className="bj-serif text-balance text-beto-black" style={{ fontSize: "clamp(36px, 4vw, 58px)", lineHeight: 1.08 }}>
              <T text={h.officesTitle} />
            </h2>
            <p className="mt-6 text-beto-gray" style={{ fontSize: 16, lineHeight: 1.75 }}>
              <T text={h.officesBody} />
            </p>
          </div>
          <OfficeCards />
        </div>
      </section>

      {/* ─── Appel final ─── */}
      <FinalCta
        eyebrow={c.finalCta.home.eyebrow}
        title={c.finalCta.home.title}
        body={c.finalCta.home.body}
        primary={{ href: LINKS.book, label: c.common.bookConsultation }}
        secondary={{ href: LINKS.form, label: c.common.seePrice }}
      >
        <p className="mt-9 text-[14px] leading-[1.6] text-[#8F897F]">
          <T text={c.common.questionCall} />{" "}
          <a href={LINKS.phoneTel} className="bj-prose-link whitespace-nowrap text-beto-offwhite">
            {PHONE_DISPLAY}
          </a>
        </p>
      </FinalCta>
    </>
  );
}

