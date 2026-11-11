"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, type CSSProperties, type ReactNode } from "react";
import { LINKS, RINGS } from "@/lib/site-content";
import { SHOW_PHOTO_SLOTS } from "@/lib/constants";
import Rich from "./Rich";
import { useSite } from "./useSite";

/* ─── Icônes (traits fins, comme le canevas) ─────────────────────────── */

export function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={(size * 10) / 16} viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M0 5h15M11 1l4 4-4 4" />
    </svg>
  );
}

export function ArrowUpRight() {
  return (
    <svg aria-hidden="true" width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M1 10L10 1M3.5 1H10v6.5" />
    </svg>
  );
}

export function Check({ color = "#C9A86A" }: { color?: string }) {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.3" className="flex-none">
      <path d="M2.5 7.5l3 3 6-7" />
    </svg>
  );
}

/* ─── Apparitions au défilement ──────────────────────────────────────── */

/**
 * Observe tous les éléments .bj-reveal / .bj-settle de la page (y compris ceux
 * ajoutés plus tard, ex. filtres de la galerie) et ajoute .is-in quand ils
 * entrent à l'écran. Sans JavaScript ou avec « moins de mouvement », tout est
 * visible d'office (voir globals.css).
 */
export function RevealObserver() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll(".bj-reveal, .bj-settle").forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );
    const scan = () =>
      document.querySelectorAll(".bj-reveal:not(.is-in), .bj-settle:not(.is-in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}

/* ─── Textes ─────────────────────────────────────────────────────────── */

/** Texte du contenu avec la typographie de la langue courante. */
export function T({ text, em = "" }: { text: string; em?: string }) {
  const { language } = useSite();
  return <Rich text={text} lang={language} emClassName={em} />;
}

export function Eyebrow({
  children,
  light = false,
  className = "",
  id,
}: {
  children: ReactNode;
  light?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <p id={id} className={`bj-eyebrow ${light ? "bj-eyebrow-light" : ""} ${className}`}>
      {children}
    </p>
  );
}

/* ─── Images ─────────────────────────────────────────────────────────── */

/** Une des 11 vraies photos de bagues, qui se pose avec un léger recul. */
export function RingPhoto({
  ring,
  alt,
  sizes,
  className = "",
  style,
  priority = false,
  position = "50% 50%",
}: {
  ring: keyof typeof RINGS;
  alt: string;
  sizes: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  position?: string;
}) {
  return (
    <div className={`bj-settle relative overflow-hidden bg-beto-sand ${className}`} style={style}>
      <Image
        src={RINGS[ring]}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={{ objectPosition: position }}
      />
    </div>
  );
}

/**
 * Espace réservé pour une photo à fournir : toujours étiqueté avec son numéro
 * de la liste de photos, jamais présenté comme une vraie image.
 */
export function PhotoSlot({
  code,
  label,
  tag,
  className = "",
  style,
  small = false,
}: {
  code: string;
  label: string;
  tag?: string;
  className?: string;
  style?: CSSProperties;
  small?: boolean;
}) {
  const { c } = useSite();
  return (
    <div
      role="img"
      aria-label={`${c.common.photoToCome} ${code} : ${label}`}
      className={`bj-ph flex items-end ${small ? "p-3" : "p-4"} ${className}`}
      style={style}
    >
      <span className="bj-ph-tag" style={small ? { padding: "7px 10px", letterSpacing: ".14em" } : undefined}>
        {tag ?? `${c.common.photoToCome} · ${code}`}
      </span>
    </div>
  );
}

/* ─── Blocs récurrents ───────────────────────────────────────────────── */

type Cta = { href: string; label: string };

function CtaLink({ cta, className }: { cta: Cta; className: string }) {
  return (
    <Link href={cta.href} className={className}>
      {cta.label}
    </Link>
  );
}

/** Appel final en bas de page (fond encre ou ivoire). */
export function FinalCta({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  dark = true,
  id = "final",
  children,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  primary: Cta;
  secondary: Cta;
  dark?: boolean;
  id?: string;
  children?: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`bj-gutter text-center ${dark ? "bg-beto-ink text-beto-offwhite" : ""}`}
      style={{ paddingTop: "clamp(96px, 11vw, 160px)", paddingBottom: "clamp(96px, 11vw, 160px)" }}
    >
      <div className="bj-reveal mx-auto" style={{ maxWidth: 820 }}>
        {eyebrow && (
          <Eyebrow light={dark} className="mb-6">
            {eyebrow}
          </Eyebrow>
        )}
        <h2
          id={id}
          className={`bj-serif text-balance ${dark ? "text-beto-offwhite" : "text-beto-black"}`}
          style={{ fontSize: "clamp(42px, 5vw, 72px)", lineHeight: 1.04 }}
        >
          <T text={title} />
        </h2>
        <p
          className={`mx-auto mt-6 text-pretty ${dark ? "text-beto-stone" : "text-beto-gray"}`}
          style={{ fontSize: 18, fontWeight: 300, lineHeight: 1.7, maxWidth: "32em" }}
        >
          <T text={body} />
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <CtaLink cta={primary} className={`bj-btn ${dark ? "bj-btn-gold" : "bj-btn-ink"}`} />
          <CtaLink cta={secondary} className={`bj-btn ${dark ? "bj-btn-line-light" : "bj-btn-line"}`} />
        </div>
        {children}
      </div>
    </section>
  );
}

/** Titre de section : surtitre + grand titre, avec un lien à droite si besoin. */
export function SectionHead({
  eyebrow,
  title,
  id,
  link,
  light = false,
  maxWidth = 640,
  titleSize = "clamp(36px, 4vw, 58px)",
  children,
}: {
  eyebrow: string;
  title: string;
  id: string;
  link?: Cta;
  light?: boolean;
  maxWidth?: number;
  titleSize?: string;
  children?: ReactNode;
}) {
  return (
    <div className="bj-reveal flex flex-wrap items-end justify-between gap-x-12 gap-y-6" style={{ marginBottom: "clamp(48px, 6vw, 80px)" }}>
      <div style={{ maxWidth }}>
        <Eyebrow light={light} className="mb-5">
          {eyebrow}
        </Eyebrow>
        <h2
          id={id}
          className={`bj-serif text-balance ${light ? "text-beto-offwhite" : "text-beto-black"}`}
          style={{ fontSize: titleSize, lineHeight: 1.08 }}
        >
          <T text={title} />
        </h2>
        {children}
      </div>
      {link && (
        <Link href={link.href} className={`bj-tlink ${light ? "bj-tlink-light" : ""}`}>
          {link.label}
          <ArrowRight />
        </Link>
      )}
    </div>
  );
}

/**
 * Étapes de paiement + possibilité de crédit (Affirm ou Klarna). Loi sur la
 * protection du consommateur (art. 244, 245 et 247, règlement art. 80) : dans
 * une publicité, seulement « Crédit offert », « Possibilité de crédit » ou le
 * nom du prêteur ; jamais de montant par mois, de taux ou de durée, jamais
 * d'incitation à acheter à crédit, et pas de photo de bague à côté.
 */
export function PaymentOptions({ id = "paiement", ctaHref, ctaLabel }: { id?: string; ctaHref: string; ctaLabel: string }) {
  const { c } = useSite();
  const p = c.payments;
  return (
    <section aria-labelledby={id} className="bj-gutter bg-beto-white" style={{ paddingTop: "clamp(88px, 10vw, 144px)", paddingBottom: "clamp(88px, 10vw, 144px)" }}>
      <div className="bj-container">
        <SectionHead eyebrow={p.eyebrow} title={p.title} id={id}>
          <p className="mt-6 text-pretty text-beto-gray" style={{ fontSize: 16, lineHeight: 1.75, maxWidth: "36em" }}>
            <T text={p.lead} />
          </p>
        </SectionHead>
        <ol className="grid list-none p-0" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "40px 32px" }}>
          {p.steps.map((s, i) => (
            <li key={s.title} className="bj-reveal" style={{ borderTop: "1px solid #1B1A17", paddingTop: 28, ["--bj-delay" as string]: `${i * 80}ms` }}>
              <p className="bj-serif text-beto-gold-dark" style={{ fontSize: 40, lineHeight: 1 }}>
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="bj-serif bj-opsz-18 text-beto-black" style={{ fontSize: 26, lineHeight: 1.2, marginTop: 24 }}>
                <T text={s.title} />
              </h3>
              <p className="text-beto-gray" style={{ fontSize: 15, lineHeight: 1.7, marginTop: 12 }}>
                <T text={s.body} />
              </p>
            </li>
          ))}
        </ol>
        <div className="bj-reveal mt-16 flex flex-wrap items-end justify-between gap-x-12 gap-y-8 bg-beto-ink text-beto-offwhite" style={{ padding: "clamp(32px, 4vw, 56px)" }}>
          <div style={{ maxWidth: "40em" }}>
            <h3 className="bj-serif text-beto-offwhite" style={{ fontSize: "clamp(26px, 2.6vw, 36px)", lineHeight: 1.15 }}>
              <T text={p.planTitle} />
            </h3>
            <p className="mt-5 text-beto-stone" style={{ fontSize: 15, lineHeight: 1.75 }}>
              <T text={p.planBody} />
            </p>
            <p className="mt-4 text-beto-gold-light" style={{ fontSize: 15, lineHeight: 1.75 }}>
              <T text={p.planWhy} />
            </p>
          </div>
          <Link href={ctaHref} className="bj-btn bj-btn-gold">
            {ctaLabel}
          </Link>
        </div>
        <p className="mt-6 text-beto-gray" style={{ fontSize: 13, lineHeight: 1.7 }}>
          <T text={p.note} />
        </p>
      </div>
    </section>
  );
}

/** Liste à filet fin (titre serif + texte), sur fond clair ou sombre. */
export function RuledList({
  items,
  dark = false,
  min = 260,
  titleSize = 28,
  as = "div",
  className = "",
}: {
  items: { title: string; body: string }[];
  dark?: boolean;
  min?: number;
  titleSize?: number;
  as?: "div" | "ul";
  className?: string;
}) {
  const Wrapper = as;
  const Item = as === "ul" ? "li" : "div";
  return (
    <Wrapper
      className={`grid list-none p-0 ${className}`}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`, gap: "48px 40px" }}
    >
      {items.map((it, i) => (
        <Item
          key={it.title}
          className="bj-reveal"
          style={{
            borderTop: dark ? "1px solid rgba(246,243,238,.18)" : "1px solid #1B1A17",
            paddingTop: 28,
            ["--bj-delay" as string]: `${i * 80}ms`,
          }}
        >
          <h3 className={`bj-serif bj-opsz-18 ${dark ? "text-beto-offwhite" : "text-beto-black"}`} style={{ fontSize: titleSize, lineHeight: 1.2 }}>
            <T text={it.title} />
          </h3>
          <p className={dark ? "text-beto-stone" : "text-beto-gray"} style={{ fontSize: 15, lineHeight: 1.75, marginTop: 14 }}>
            <T text={it.body} />
          </p>
        </Item>
      ))}
    </Wrapper>
  );
}

/** Les deux bureaux privés et la vidéo, avec un bouton de réservation sous chacun. */
export function OfficeCards() {
  const { c } = useSite();
  const o = c.offices;
  const cards = [
    { key: "downtown", data: o.downtown, photo: { code: o.downtown.photo, label: o.downtown.photoLabel } },
    { key: "saintLaurent", data: o.saintLaurent, photo: { code: o.saintLaurent.photo, label: o.saintLaurent.photoLabel } },
    { key: "video", data: o.video, photo: null },
  ] as const;
  return (
    <div className={`bj-t2 grid ${SHOW_PHOTO_SLOTS ? "bj-offices" : ""}`} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: "40px 32px" }}>
      {cards.map((card, i) => (
        <article
          key={card.key}
          className="bj-reveal flex flex-col"
          style={{ ["--bj-delay" as string]: `${i * 90}ms`, ...(SHOW_PHOTO_SLOTS ? {} : { borderTop: "1px solid #DED8CD", paddingTop: 28 }) }}
        >
          {!SHOW_PHOTO_SLOTS ? null : card.photo ? (
            <PhotoSlot code={card.photo.code} label={card.photo.label} style={{ aspectRatio: "3 / 2" }} />
          ) : (
            <div className="flex items-center justify-center bg-beto-ink" style={{ aspectRatio: "3 / 2" }}>
              <svg aria-hidden="true" width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="#C9A86A" strokeWidth="1.2">
                <rect x="6" y="16" width="32" height="24" rx="1" />
                <path d="M38 24l12-7v22l-12-7" />
              </svg>
            </div>
          )}
          <h3 className="bj-serif bj-opsz-18 text-beto-black" style={{ fontSize: 28, lineHeight: 1.2, marginTop: SHOW_PHOTO_SLOTS ? 28 : 0 }}>
            <T text={card.data.name} />
          </h3>
          <p className="text-beto-black" style={{ fontSize: 15, lineHeight: 1.7, marginTop: 10 }}>
            <T text={card.data.address} />
          </p>
          <p className="text-beto-gray" style={{ fontSize: 14, lineHeight: 1.6, marginTop: 8 }}>
            <T text={card.data.ideal} />
          </p>
          <div className="mt-auto pt-6">
            <Link href={`${LINKS.book}?lieu=${card.key}`} className="bj-btn bj-btn-line">
              {card.data.cta}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
