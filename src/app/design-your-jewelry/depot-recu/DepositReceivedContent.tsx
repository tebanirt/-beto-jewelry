"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { trackFunnel } from "@/lib/funnel";
import { trackMetaPurchase } from "@/lib/metaPixel";
import { DEPOSIT_AMOUNT_CAD } from "@/lib/deposit";
import CalendlyNextStep from "@/components/shared/CalendlyNextStep";

export default function DepositReceivedContent() {
  const tr = useTranslation();
  const t = tr.pages.depositReceived;

  useEffect(() => {
    trackFunnel("deposit_paid", 0, {}, "deposit");
    // Stripe renvoie ici avec ?session_id=cs_… seulement après un vrai
    // paiement : sans cet identifiant (visite directe), aucun achat n'est
    // signalé à Meta. Valeur avant taxes, comme dans les Finances.
    const sessionId = new URLSearchParams(window.location.search).get("session_id") ?? "";
    if (/^cs_[A-Za-z0-9_]{10,}$/.test(sessionId)) {
      trackMetaPurchase(DEPOSIT_AMOUNT_CAD, "CAD", sessionId);
    }
  }, []);

  return (
    <div className="min-h-screen bg-beto-offwhite" style={{ paddingTop: "var(--nav-height)" }}>
      <div className="container-beto max-w-2xl mx-auto py-16 flex flex-col gap-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={22} className="text-beto-gold-dark shrink-0 mt-1" aria-hidden />
          <div>
            <p className="text-label text-beto-gold-dark mb-2">{t.eyebrow}</p>
            <h1 className="font-display text-beto-black text-4xl font-light text-balance mb-4">{t.title}</h1>
            <p className="text-sm text-beto-gray leading-relaxed">{t.body}</p>
          </div>
        </div>
        <CalendlyNextStep onCtaClick={() => trackFunnel("cta_click", 1, { target: "calendly" }, "deposit")} />
      </div>
    </div>
  );
}
