"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
  },
  item: {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  },
};

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const tr = useTranslation();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const scrollToContent = () => {
    const el = document.getElementById("collections");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full h-screen min-h-[600px] max-h-[900px] flex items-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-beto-black" aria-hidden="true">
        <video
          ref={videoRef}
          src="/hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A86A]/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-beto pb-20 lg:pb-28">
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          <motion.p variants={stagger.item} className="text-label text-beto-gold mb-6">
            {tr.hero.eyebrow}
          </motion.p>

          <motion.h1
            variants={stagger.item}
            className="font-display text-white leading-[1.05] mb-6"
            style={{ fontSize: "clamp(3rem, 7vw, 6rem)", fontWeight: 300, letterSpacing: "-0.02em" }}
          >
            {tr.hero.headline}
            <br />
            <span className="italic">{tr.hero.headlineItalic}</span>
          </motion.h1>

          <motion.p
            variants={stagger.item}
            className="text-base text-white/60 leading-relaxed mb-10 max-w-md font-sans"
          >
            {tr.hero.sub}
          </motion.p>

          <motion.div variants={stagger.item} className="flex flex-col sm:flex-row items-start gap-4">
            <Link
              href="/design-your-jewelry/custom-design"
              className="inline-flex items-center justify-center px-8 py-4 bg-beto-gold text-beto-black text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:bg-beto-gold-light hover:shadow-[0_0_30px_rgba(201,168,106,0.3)]"
            >
              {tr.hero.cta1}
            </Link>
            <Link
              href="/design-your-jewelry/consultation"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white text-xs font-medium uppercase tracking-[0.2em] border border-white/30 transition-all duration-300 hover:border-white hover:bg-white/5"
            >
              {tr.hero.cta2}
            </Link>
          </motion.div>

          <motion.div variants={stagger.item} className="mt-12 flex flex-wrap items-center gap-8">
            {tr.hero.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-white text-2xl font-display font-light">{stat.value}</p>
                <p className="text-white/40 text-xs tracking-widest uppercase mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToContent}
        className="absolute bottom-8 right-8 lg:right-12 z-10 flex flex-col items-center gap-2 text-white/40 hover:text-beto-gold transition-colors group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        aria-label="Scroll to collections"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown size={16} />
        </motion.div>
        <span className="text-label" style={{ writingMode: "vertical-rl" }}>
          {tr.hero.explore}
        </span>
      </motion.button>
    </section>
  );
}
