"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  titleItalic?: string;
  subtitle?: string;
  dark?: boolean;
  centered?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "py-20 lg:py-24",
  md: "py-24 lg:py-32",
  lg: "py-32 lg:py-40",
};

export default function PageHero({
  eyebrow,
  title,
  titleItalic,
  subtitle,
  dark = false,
  centered = false,
  size = "md",
}: PageHeroProps) {
  return (
    <section
      className={cn(
        sizeMap[size],
        dark ? "bg-beto-black" : "bg-beto-white",
        "relative overflow-hidden"
      )}
      style={{ paddingTop: `calc(${size === "lg" ? "8rem" : "6rem"} + var(--nav-height))` }}
    >
      {/* Subtle gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: dark
            ? "radial-gradient(ellipse at 20% 80%, rgba(201,168,106,0.06) 0%, transparent 60%)"
            : "radial-gradient(ellipse at 80% 20%, rgba(201,168,106,0.05) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className={cn("container-beto relative", centered && "text-center")}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        >
          {eyebrow && (
            <p className="text-label text-beto-gold mb-5">{eyebrow}</p>
          )}
          <h1
            className={cn("font-display mb-0", dark ? "text-white" : "text-beto-black")}
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 5rem)", fontWeight: 300, lineHeight: 1.05 }}
          >
            {title}
            {titleItalic && (
              <>
                <br />
                <span className="italic">{titleItalic}</span>
              </>
            )}
          </h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
              className={cn(
                "mt-6 text-base leading-relaxed max-w-xl",
                dark ? "text-white/60" : "text-beto-gray",
                centered && "mx-auto"
              )}
            >
              {subtitle}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
