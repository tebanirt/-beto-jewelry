"use client";

import { useTranslation } from "@/hooks/useTranslation";

/**
 * Slim proof-point band for SEO landing pages (style pages, category pages,
 * the Montréal page). Reinforces the four facts that reduce purchase
 * hesitation: fast CAD, honest starting price, virtual reach, direct-to-maker.
 */
export default function TrustBar({ className = "" }: { className?: string }) {
  const tr = useTranslation();

  return (
    <section className={`bg-beto-offwhite border-y border-beto-gray-subtle/40 ${className}`}>
      <div className="container-beto py-6">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
          {tr.trustBar.map((item) => (
            <li key={item.value}>
              <p className="font-display text-beto-black text-lg font-normal leading-none">{item.value}</p>
              <p className="text-xs text-beto-gray leading-snug mt-1.5">{item.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
