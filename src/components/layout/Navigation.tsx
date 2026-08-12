"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useStore, detectLanguage } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronDown, Menu, X } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHomePage);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { language, setLanguage, mobileMenuOpen, setMobileMenuOpen } = useStore();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tr = useTranslation();

  useEffect(() => {
    if (!isHomePage) { setScrolled(true); return; }
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Runs client-side only, after hydration, so the browser-language-detected
  // value never conflicts with the server-rendered ("en") first paint.
  useEffect(() => {
    setLanguage(detectLanguage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const openDropdown = (name: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(name);
  };

  const closeDropdown = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const simpleNavLinks = [
    { label: tr.nav.gallery, href: "/gallery" },
    { label: tr.nav.about, href: "/about" },
    { label: tr.nav.education, href: "/education" },
    { label: tr.nav.blog, href: "/blog" },
  ];

  const mobileExtraLinks = [
    { label: tr.nav.mobile_faq, href: "/faq" },
    { label: tr.nav.mobile_contact, href: "/contact" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-beto-white/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(17,17,17,0.08)]"
            : "bg-transparent"
        )}
        style={{ height: "var(--nav-height)" }}
      >
        <div className="container-beto h-full flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex flex-col items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Beto Jewelry"
              style={{ height: "38px", width: "auto" }}
              className={cn(
                "object-contain transition-all duration-300",
                !scrolled && "brightness-0 invert"
              )}
            />
            <span className={cn(
              "text-[9px] tracking-[0.25em] uppercase font-sans transition-all duration-300 overflow-hidden",
              scrolled ? "mt-0.5 max-h-4 opacity-100 text-beto-gray-light" : "max-h-0 opacity-0"
            )}>
              Montréal · Canada
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {/* Collections Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown("collections")}
              onMouseLeave={closeDropdown}
            >
              <button
                className={cn(
                  "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors duration-200 tracking-wide",
                  scrolled ? "text-beto-black hover:text-beto-gold" : "text-white/90 hover:text-white"
                )}
              >
                {tr.nav.collections}
                <ChevronDown
                  size={14}
                  className={cn(
                    "transition-transform duration-200",
                    activeDropdown === "collections" && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {activeDropdown === "collections" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-beto-white shadow-[0_8px_40px_rgba(17,17,17,0.12)] border border-beto-gray-subtle/40"
                    onMouseEnter={() => openDropdown("collections")}
                    onMouseLeave={closeDropdown}
                  >
                    <div className="p-2">
                      {tr.nav.collections_items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="group flex flex-col px-4 py-3 hover:bg-beto-offwhite transition-colors duration-150"
                        >
                          <span className="text-sm font-medium text-beto-black group-hover:text-beto-gold transition-colors">
                            {item.label}
                          </span>
                          <span className="text-xs text-beto-gray-light mt-0.5">{item.desc}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-beto-gray-subtle/40 p-4">
                      <Link
                        href="/gallery"
                        className="text-xs text-label text-beto-gold hover:text-beto-gold-dark transition-colors"
                      >
                        {tr.nav.viewGallery}
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Design Your Jewelry Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown("design")}
              onMouseLeave={closeDropdown}
            >
              <button
                className={cn(
                  "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors duration-200 tracking-wide",
                  scrolled ? "text-beto-black hover:text-beto-gold" : "text-white/90 hover:text-white"
                )}
              >
                {tr.nav.design}
                <ChevronDown
                  size={14}
                  className={cn(
                    "transition-transform duration-200",
                    activeDropdown === "design" && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {activeDropdown === "design" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-80 bg-beto-white shadow-[0_8px_40px_rgba(17,17,17,0.12)] border border-beto-gray-subtle/40"
                    onMouseEnter={() => openDropdown("design")}
                    onMouseLeave={closeDropdown}
                  >
                    <div className="p-6 bg-beto-offwhite border-b border-beto-gray-subtle/40">
                      <p className="text-label text-beto-gold mb-1">{tr.nav.beginJourney}</p>
                      <p className="text-xs text-beto-gray-light leading-relaxed">
                        {tr.nav.beginSub}
                      </p>
                    </div>
                    <div className="p-2">
                      {tr.nav.design_items.map((item, i) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="group flex flex-col px-4 py-3 hover:bg-beto-offwhite transition-colors duration-150"
                        >
                          <span className="text-sm font-medium text-beto-black group-hover:text-beto-gold transition-colors">
                            {i === 0 && <span className="text-beto-gold mr-1">★</span>}
                            {item.label}
                          </span>
                          <span className="text-xs text-beto-gray-light mt-0.5">{item.desc}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {simpleNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200",
                  scrolled ? "text-beto-black hover:text-beto-gold" : "text-white/90 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: Language + CTA */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Language Toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLanguage("en")}
                className={cn(
                  "text-xs font-medium tracking-widest transition-colors",
                  language === "en"
                    ? scrolled ? "text-beto-black" : "text-white"
                    : scrolled ? "text-beto-gray-light hover:text-beto-black" : "text-white/50 hover:text-white/80"
                )}
              >
                EN
              </button>
              <span className={cn("text-xs", scrolled ? "text-beto-gray-subtle" : "text-white/30")}>|</span>
              <button
                onClick={() => setLanguage("fr")}
                className={cn(
                  "text-xs font-medium tracking-widest transition-colors",
                  language === "fr"
                    ? scrolled ? "text-beto-black" : "text-white"
                    : scrolled ? "text-beto-gray-light hover:text-beto-black" : "text-white/50 hover:text-white/80"
                )}
              >
                FR
              </button>
            </div>

            {/* Primary CTA */}
            <Link
              href="/design-your-jewelry/custom-design"
              className={cn(
                "px-5 py-2.5 text-xs font-medium tracking-widest uppercase transition-all duration-300",
                "border hover:shadow-lg",
                scrolled
                  ? "bg-beto-black text-beto-white border-beto-black hover:bg-beto-gold hover:border-beto-gold"
                  : "bg-beto-gold text-beto-black border-beto-gold hover:bg-beto-gold-light"
              )}
            >
              {tr.nav.cta}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={22} className={scrolled ? "text-beto-black" : "text-white"} />
            ) : (
              <Menu size={22} className={scrolled ? "text-beto-black" : "text-white"} />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="fixed inset-0 z-40 bg-beto-white flex flex-col"
          >
            <div style={{ height: "var(--nav-height)" }} />

            <nav className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-1">
              <p className="text-label text-beto-gold mb-4">{tr.nav.mobile_collections}</p>
              {tr.nav.collections_items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 border-b border-beto-gray-subtle/40 text-xl font-display text-beto-black"
                >
                  {item.label}
                </Link>
              ))}

              <p className="text-label text-beto-gold mb-4 mt-8">{tr.nav.mobile_design}</p>
              {tr.nav.design_items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 border-b border-beto-gray-subtle/40 text-xl font-display text-beto-black"
                >
                  {item.label}
                </Link>
              ))}

              <p className="text-label text-beto-gold mb-4 mt-8">{tr.nav.mobile_explore}</p>
              {[...simpleNavLinks, ...mobileExtraLinks].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 border-b border-beto-gray-subtle/40 text-xl font-display text-beto-black"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="px-6 py-8 border-t border-beto-gray-subtle/40">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setLanguage("en")}
                  className={cn("text-xs font-medium tracking-widest", language === "en" ? "text-beto-black" : "text-beto-gray-light")}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("fr")}
                  className={cn("text-xs font-medium tracking-widest", language === "fr" ? "text-beto-black" : "text-beto-gray-light")}
                >
                  FR
                </button>
              </div>
              <Link
                href="/design-your-jewelry/custom-design"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-4 text-center text-xs font-medium tracking-widest uppercase bg-beto-gold text-beto-black"
              >
                {tr.nav.mobile_cta}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
