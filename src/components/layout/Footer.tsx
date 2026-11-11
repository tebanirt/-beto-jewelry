"use client";

import Image from "next/image";
import Link from "next/link";
import { EMAIL_DISPLAY, LINKS, PHONE_DISPLAY } from "@/lib/site-content";
import { useSite } from "@/components/site/useSite";
import { T } from "@/components/site/ui";

const linkClass =
  "inline-flex min-h-9 items-center text-[14px] leading-normal text-beto-stone no-underline transition-colors hover:text-beto-offwhite sm:min-h-0";

function ColTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-[12px] font-medium uppercase tracking-[.22em] text-beto-offwhite">{children}</p>;
}

/** Pied de page du site (planches du canevas), sur fond encre. */
export default function Footer() {
  const { c, language, setLanguage } = useSite();
  const f = c.footer;
  return (
    <footer className="bj-gutter border-t border-beto-offwhite/10 bg-beto-ink text-beto-stone" style={{ paddingTop: "clamp(64px, 7vw, 96px)", paddingBottom: 40 }}>
      <div className="bj-container">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-10 lg:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))]">
          <div className="col-span-2 max-w-[340px] lg:col-span-1">
            <Image src="/brand/logo-mark.png" alt="Beto Jewelry" width={1096} height={616} style={{ height: 40, width: "auto", filter: "brightness(0) invert(1)" }} />
            <p className="mt-6 text-[14px] leading-[1.7]">
              <T text={f.blurb} />
            </p>
          </div>
          <nav aria-label={f.footerNav} className="flex min-w-0 flex-col gap-3">
            <ColTitle>{f.siteTitle}</ColTitle>
            {f.site.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex min-w-0 flex-col gap-3">
            <ColTitle>{f.moreTitle}</ColTitle>
            {f.more.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass}>
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <ColTitle>{f.contactTitle}</ColTitle>
            <a href={LINKS.phoneTel} className={`${linkClass} whitespace-nowrap`}>
              {PHONE_DISPLAY}
            </a>
            <a href={LINKS.email} className={`${linkClass} break-all`}>
              {EMAIL_DISPLAY}
            </a>
            <a href={LINKS.whatsapp} className={linkClass}>
              WhatsApp
            </a>
            <a href={LINKS.instagram} className={linkClass}>
              Instagram
            </a>
            <a href={LINKS.facebook} className={linkClass}>
              Facebook
            </a>
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <ColTitle>{f.officesTitle}</ColTitle>
            {f.offices.map((o) => (
              <p key={o} className="text-[14px] leading-[1.6]">
                <T text={o} />
              </p>
            ))}
          </div>
        </div>
        <div className="mt-[72px] flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-beto-offwhite/10 pt-7 text-[13px] text-[#8F897F]">
          <p>{f.rights}</p>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-1">
            <Link href={LINKS.privacy} className={`${linkClass} !text-[13px]`}>
              {f.privacy}
            </Link>
            <Link href={LINKS.terms} className={`${linkClass} !text-[13px]`}>
              {f.terms}
            </Link>
            <button
              type="button"
              lang={language === "fr" ? "en" : "fr"}
              onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
              className={`${linkClass} min-h-11 !text-[13px] cursor-pointer sm:min-h-0`}
            >
              {f.switchLang}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
