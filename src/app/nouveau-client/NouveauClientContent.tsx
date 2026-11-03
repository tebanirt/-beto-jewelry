"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

export default function NouveauClientContent() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; // React nulls e.currentTarget after an await — grab it now
    setStatus("sending");
    const formData = new FormData(form);
    const body = {
      fullName: formData.get("fullName")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      notes: formData.get("notes")?.toString() || "",
    };

    try {
      const res = await fetch("/api/crm/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-beto-offwhite px-5 py-20" style={{ paddingTop: "var(--nav-height)" }}>
      <div className="w-full max-w-md bg-beto-white p-10 border border-beto-gray-subtle/40">
        <p className="text-label text-beto-gold mb-3">Beto Jewelry</p>
        <h1 className="text-2xl font-medium text-beto-black mb-3">Bienvenue !</h1>
        <p className="text-sm text-beto-gray-light mb-8 leading-relaxed">
          Merci pour votre dépôt. Laissez-moi vos coordonnées pour que je puisse
          vous envoyer votre facture et vous tenir au courant de chaque étape de
          la création de votre bijou.
        </p>

        {status === "success" ? (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-4">
            Merci ! Vos informations ont bien été reçues. Vous recevrez votre
            facture très bientôt par courriel.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">Nom complet</label>
              <input name="fullName" required type="text" placeholder="Votre nom complet" className="w-full px-4 py-3.5 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
            </div>
            <div>
              <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">Courriel</label>
              <input name="email" required type="email" placeholder="vous@exemple.com" className="w-full px-4 py-3.5 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
            </div>
            <div>
              <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">Téléphone</label>
              <input name="phone" required type="tel" placeholder="(438) 000-0000" className="w-full px-4 py-3.5 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors" />
            </div>
            <div>
              <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">Notes (optionnel)</label>
              <textarea name="notes" rows={3} placeholder="Détails sur votre projet, si vous voulez en ajouter" className="w-full px-4 py-3.5 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors resize-none" />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full py-4 bg-beto-black text-white text-xs font-medium uppercase tracking-widest hover:bg-beto-gold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? "Envoi..." : "Envoyer"}
            </button>

            {status === "error" && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">
                Une erreur est survenue. Réessayez, ou contactez-moi directement au 438-874-5759.
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
