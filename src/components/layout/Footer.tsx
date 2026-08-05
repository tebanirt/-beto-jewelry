"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

function IconInstagram({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  const tr = useTranslation();

  const companyLinks = [
    { label: tr.footer.about, href: "/about" },
    { label: tr.footer.education, href: "/education" },
    { label: tr.footer.faq, href: "/faq" },
    { label: tr.footer.contactPage, href: "/contact" },
  ];

  return (
    <footer className="bg-beto-black text-beto-white">
      {/* Top bar */}
      <div className="border-b border-white/10">
        <div className="container-beto py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Beto Jewelry"
                style={{ height: "40px", width: "auto" }}
                className="object-contain brightness-0 invert"
              />
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-xs">
              {tr.footer.tagline}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/betojewelry"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-beto-gold transition-colors duration-200"
                aria-label="Instagram @betojewelry"
              >
                <IconInstagram size={18} />
              </a>
              <a
                href="https://facebook.com/betojewelry"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-beto-gold transition-colors duration-200"
                aria-label="Facebook betojewelry"
              >
                <IconFacebook size={18} />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <p className="text-label text-beto-gold mb-5">{tr.footer.collections}</p>
            <ul className="flex flex-col gap-3">
              {tr.nav.collections_items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Design Journey */}
          <div>
            <p className="text-label text-beto-gold mb-5">{tr.footer.journey}</p>
            <ul className="flex flex-col gap-3">
              {tr.footer.journeyItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Contact */}
          <div>
            <p className="text-label text-beto-gold mb-5">{tr.footer.company}</p>
            <ul className="flex flex-col gap-3 mb-8">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="text-label text-beto-gold mb-4">{tr.footer.contact}</p>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-2.5 text-sm text-white/50">
                <MapPin size={14} className="text-beto-gold flex-shrink-0" />
                Montréal, Québec, Canada
              </li>
              <li>
                <a
                  href="mailto:betojewlz@gmail.com"
                  className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors"
                >
                  <Mail size={14} className="text-beto-gold flex-shrink-0" />
                  betojewlz@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+14388745759"
                  className="flex items-center gap-2.5 text-sm text-white/50 hover:text-white transition-colors"
                >
                  <Phone size={14} className="text-beto-gold flex-shrink-0" />
                  +1 (438) 874-5759
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container-beto py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/30 tracking-wide">
          © {new Date().getFullYear()} {tr.footer.copyright}
        </p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            {tr.footer.privacy}
          </Link>
          <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            {tr.footer.terms}
          </Link>
        </div>
      </div>
    </footer>
  );
}
