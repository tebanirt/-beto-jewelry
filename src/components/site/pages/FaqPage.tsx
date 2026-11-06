"use client";

import { EMAIL_DISPLAY, LINKS, PHONE_DISPLAY } from "@/lib/site-content";
import Rich from "../Rich";
import { useSite } from "../useSite";
import { Eyebrow, FinalCta, T } from "../ui";

export default function FaqPage() {
  const { c, language } = useSite();
  const p = c.faq;

  return (
    <>
      {/* ─── En-tête ─── */}
      <section
        aria-labelledby="titre"
        className="bj-gutter border-b border-beto-gray-subtle"
        style={{ paddingTop: "calc(var(--nav-height) + clamp(64px, 8vw, 120px))", paddingBottom: "clamp(56px, 6vw, 88px)" }}
      >
        <div className="bj-container bj-reveal flex flex-wrap items-end justify-between gap-x-16 gap-y-14">
          <div className="min-w-0" style={{ flex: "1 1 560px", maxWidth: 760 }}>
            <Eyebrow>{p.eyebrow}</Eyebrow>
            <h1 id="titre" className="bj-serif mt-6 text-beto-black" style={{ fontSize: "clamp(44px, 5.6vw, 80px)", lineHeight: 1.02, letterSpacing: "-.01em" }}>
              <Rich text={p.title} lang={language} />
            </h1>
            <p className="mt-7 text-beto-gray" style={{ fontSize: 18, fontWeight: 300, lineHeight: 1.7, maxWidth: "34em" }}>
              <T text={p.body} />
            </p>
          </div>
          <dl className="bj-faq-stats m-0 grid min-w-0 border-t border-beto-black" style={{ flex: "0 1 420px", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {p.stats.map((s, i) => (
              <div
                key={s.big}
                style={{
                  padding: i === 0 ? "22px 16px 0 0" : i === 2 ? "22px 0 0 16px" : "22px 16px 0",
                  borderLeft: i === 0 ? undefined : "1px solid #DED8CD",
                }}
              >
                <dt className="bj-serif text-beto-black" style={{ fontSize: "clamp(30px, 3vw, 40px)", lineHeight: 1 }}>
                  <T text={s.big} />
                </dt>
                <dd className="mt-2.5 text-beto-gray" style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <T text={s.label} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─── Questions ─── */}
      <div className="bj-gutter" style={{ paddingTop: "clamp(56px, 7vw, 104px)", paddingBottom: "clamp(80px, 9vw, 136px)" }}>
        <div className="bj-container flex flex-wrap items-start gap-y-12" style={{ columnGap: "clamp(48px, 7vw, 112px)" }}>
          <aside aria-label={p.categoriesLabel} className="bj-faq-aside" style={{ flex: "1 1 240px", maxWidth: 300 }}>
            <p className="text-[12px] font-medium uppercase tracking-[.22em] text-beto-gray">{p.categoriesLabel}</p>
            <nav className="bj-faq-cats mt-5">
              {p.sections.map((s) => (
                <a key={s.id} className="bj-faq-cat" href={`#${s.id}`}>
                  <span>{s.title}</span>
                  <span aria-hidden="true">{s.items.length}</span>
                </a>
              ))}
            </nav>
            <div className="bj-faq-help mt-12 border border-beto-gray-subtle bg-beto-white p-7">
              <p className="bj-serif bj-opsz-11 text-beto-black" style={{ fontSize: 24, lineHeight: 1.2 }}>
                <T text={p.helpTitle} />
              </p>
              <p className="mt-3 text-beto-gray" style={{ fontSize: 14, lineHeight: 1.7 }}>
                <T text={p.helpBody} />
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <a href={LINKS.whatsapp} className="bj-btn bj-btn-ink" style={{ minHeight: 48, padding: "0 20px", fontSize: 12 }}>
                  {p.helpWhatsapp}
                </a>
                <a href={LINKS.phoneTel} className="bj-btn bj-btn-line" style={{ minHeight: 48, padding: "0 20px", fontSize: 12 }}>
                  {PHONE_DISPLAY}
                </a>
              </div>
              <a href={LINKS.email} className="bj-prose-link mt-4 inline-block text-[14px] text-beto-black">
                {EMAIL_DISPLAY}
              </a>
            </div>
          </aside>
          <div className="flex min-w-0 flex-col" style={{ flex: "999 1 560px", gap: "clamp(64px, 7vw, 96px)" }}>
            {p.sections.map((s, si) => (
              <section key={s.id} id={s.id} aria-labelledby={`h-${s.id}`}>
                <h2 id={`h-${s.id}`} className="bj-serif text-beto-black" style={{ fontSize: "clamp(32px, 3.2vw, 44px)", lineHeight: 1.1, marginBottom: 28 }}>
                  <T text={s.title} />
                </h2>
                {s.items.map((it, ii) => (
                  <details key={it.q} className="bj-faq-item" open={si === 0 && ii === 0}>
                    <summary>
                      <span>
                        <T text={it.q} />
                      </span>
                      <span className="bj-faq-icon" aria-hidden="true" />
                    </summary>
                    <p className="bj-faq-answer">
                      <T text={it.a} />
                    </p>
                  </details>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>

      <FinalCta
        title={p.finalTitle}
        body={p.finalBody}
        primary={{ href: LINKS.book, label: c.common.bookConsultation }}
        secondary={{ href: LINKS.form, label: c.common.seePrice }}
      />
    </>
  );
}
