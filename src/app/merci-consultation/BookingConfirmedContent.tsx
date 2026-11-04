"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { trackMetaSchedule } from "@/lib/metaPixel";

/**
 * Calendly redirige ici après une réservation confirmée (avec les détails de
 * l'événement en paramètres). C'est le seul endroit où le site sait qu'un rendez-vous
 * a vraiment été pris : on y déclenche l'événement Meta « Schedule », sur lequel
 * la campagne « Website Booking » optimise. Une seule fois par réservation, même
 * si la page est rechargée.
 */
export default function BookingConfirmedContent() {
  const c = useTranslation().bookingConfirmed;
  const params = useSearchParams();
  const firstName = params.get("invitee_first_name") || params.get("invitee_full_name")?.split(/\s+/)[0] || "";

  useEffect(() => {
    // Sans identifiant d'événement, on ne peut pas éviter les doublons : on suit quand même.
    const eventId = params.get("event_type_uuid") && params.get("event_start_time")
      ? `${params.get("event_type_uuid")}-${params.get("event_start_time")}-${params.get("invitee_email") ?? ""}`
      : null;
    const key = eventId ? `beto_schedule_tracked_${eventId}` : null;
    try {
      if (key && sessionStorage.getItem(key)) return;
    } catch {
      // Stockage bloqué (navigation privée, navigateur intégré) : on suit quand même.
    }

    // Le pixel et GA ne se chargent qu'après le consentement (Loi 25) : on attend qu'ils
    // soient là, y compris si le visiteur accepte la bannière sur cette page.
    let tries = 0;
    const timer = window.setInterval(() => {
      if (typeof window.fbq !== "function" && typeof window.gtag !== "function") {
        if (++tries > 120) window.clearInterval(timer); // ≈ 1 min, puis on abandonne
        return;
      }
      window.clearInterval(timer);
      trackMetaSchedule("calendly-consultation");
      try {
        if (key) sessionStorage.setItem(key, "1");
      } catch {
        // idem
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [params]);

  return (
    <section
      className="min-h-screen bg-beto-black text-white px-5 py-16 flex items-center"
      style={{ paddingTop: "calc(var(--nav-height, 0px) + 4rem)" }}
    >
      <div role="status" aria-live="polite" className="max-w-xl mx-auto text-left">
        <p className="text-label text-beto-gold mb-4">{c.eyebrow}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-normal leading-tight mb-6">
          {firstName ? `${firstName}, ${c.titleWithName}` : c.title}
        </h1>
        <p className="text-sm text-white/75 leading-relaxed mb-10">{c.body}</p>
        <Link
          href="/"
          className="inline-block text-sm font-medium uppercase tracking-widest px-6 py-4 bg-beto-gold text-beto-black hover:bg-beto-gold-dark transition-colors duration-300"
        >
          {c.cta}
        </Link>
      </div>
    </section>
  );
}
