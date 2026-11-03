"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const CALENDLY_URL = "https://calendly.com/betojewlz";
const REDIRECT_SECONDS = 4;

/**
 * Shown after any lead form is sent successfully. A form submission only
 * emails Rayane — it never lands in the calendar — so leads were sitting
 * unbooked (real case, 26 oct. 2026). This turns "request sent" into
 * "now pick your time", with name and email pre-filled in Calendly.
 *
 * autoRedirect: used on the consultation form, where the visitor already
 * said they want a consultation. Same-tab navigation, no target="_blank"
 * (new tabs get swallowed by ad-block/in-app browsers — see consultation page).
 */
export function buildCalendlyUrl(name?: string, email?: string) {
  const params = new URLSearchParams();
  if (name?.trim()) params.set("name", name.trim());
  if (email?.trim()) params.set("email", email.trim());
  const qs = params.toString();
  return qs ? `${CALENDLY_URL}?${qs}` : CALENDLY_URL;
}

export default function CalendlyNextStep({
  name,
  email,
  autoRedirect = false,
}: {
  name?: string;
  email?: string;
  autoRedirect?: boolean;
}) {
  const c = useTranslation().bookingNextStep;
  const url = buildCalendlyUrl(name, email);
  const [seconds, setSeconds] = useState(REDIRECT_SECONDS);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (!autoRedirect || cancelled) return;
    if (seconds <= 0) {
      window.location.href = url;
      return;
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [autoRedirect, cancelled, seconds, url]);

  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <div role="status" aria-live="polite" className="bg-beto-black text-white p-8 sm:p-10 text-left">
      <p className="text-label text-beto-gold mb-4">{c.eyebrow}</p>
      <h3 className="font-display text-2xl sm:text-3xl font-normal leading-tight mb-4">
        {firstName ? `${firstName}, ${c.titleWithName}` : c.title}
      </h3>
      <p className="text-sm text-white/75 leading-relaxed mb-8">{c.body}</p>

      <a
        href={url}
        className="block text-center text-sm font-medium uppercase tracking-widest px-4 py-4 bg-beto-gold text-beto-black hover:bg-beto-gold-dark transition-colors duration-300"
      >
        {c.cta}
      </a>

      {autoRedirect && !cancelled && (
        <p className="text-xs text-white/60 mt-4 text-center">
          {c.redirecting.replace("{s}", String(Math.max(seconds, 0)))}{" "}
          <button
            type="button"
            onClick={() => setCancelled(true)}
            className="underline underline-offset-2 hover:text-beto-gold transition-colors"
          >
            {c.stay}
          </button>
        </p>
      )}

      <p className="text-xs text-white/50 mt-6 text-center leading-relaxed">{c.fallback}</p>
    </div>
  );
}
