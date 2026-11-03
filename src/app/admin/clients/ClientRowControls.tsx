"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientStatus } from "@/lib/supabase";

export const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: "nouveau", label: "Nouveau (pas réservé)" },
  { value: "consultation_reservee", label: "Consultation réservée" },
  { value: "consultation_faite", label: "Consultation faite, pas acheté" },
  { value: "depot_recu", label: "Dépôt reçu" },
  { value: "design", label: "Design en cours" },
  { value: "production", label: "Production" },
  { value: "livre", label: "Livré" },
  { value: "perdu", label: "Perdu" },
];

/** PATCH a client and report failures instead of failing silently. */
async function patchClient(clientId: string, body: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(String(res.status));
    return true;
  } catch {
    alert("La modification n'a pas été enregistrée. Réessayez.");
    return false;
  }
}

export function StatusSelect({ clientId, status }: { clientId: string; status: ClientStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(newStatus: ClientStatus) {
    const previous = value;
    setValue(newStatus);
    setSaving(true);
    const ok = await patchClient(clientId, { status: newStatus });
    if (!ok) setValue(previous);
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as ClientStatus)}
      className="text-xs border border-beto-gray-subtle/60 px-2 py-1.5 bg-beto-white focus:outline-none focus:border-beto-gold"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/** datetime-local value (local time) ↔ ISO string. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FollowupControls({
  clientId,
  consultationAt,
  followupsPaused,
  followupCount,
}: {
  clientId: string;
  consultationAt: string | null;
  followupsPaused: boolean;
  followupCount: number;
}) {
  const router = useRouter();
  const [date, setDate] = useState(toLocalInput(consultationAt));
  const [busy, setBusy] = useState(false);

  async function run(body: Record<string, unknown>) {
    setBusy(true);
    await patchClient(clientId, body);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 border-t border-beto-gray-subtle/40 pt-5 mt-5">
      <div>
        <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">Date de la consultation</label>
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-beto-gray-subtle/60 bg-beto-offwhite text-sm focus:outline-none focus:border-beto-gold"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => run({ consultationAt: date ? new Date(date).toISOString() : null })}
            className="text-xs font-medium uppercase tracking-widest text-beto-gold hover:text-beto-black disabled:opacity-40"
          >
            Enregistrer
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <span className="text-beto-gray-light">Relances dans cette étape : {followupCount}</span>
        <button
          type="button"
          disabled={busy}
          onClick={() => run({ logFollowup: true })}
          className="text-xs font-medium uppercase tracking-widest text-beto-gold hover:text-beto-black disabled:opacity-40"
        >
          J&apos;ai relancé à la main
        </button>
        <label className="flex items-center gap-2 text-xs text-beto-gray cursor-pointer">
          <input
            type="checkbox"
            checked={followupsPaused}
            disabled={busy}
            onChange={(e) => run({ followupsPaused: e.target.checked })}
          />
          Arrêter les relances pour ce client
        </label>
      </div>
    </div>
  );
}

/** Génère un lien Stripe à usage unique que Rayane colle lui-même dans son courriel. */
export function PaymentLinkControls({ clientId, depositAmount }: { clientId: string; depositAmount: number }) {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(kind: "depot" | "solde") {
    setBusy(true);
    setLink("");
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/payment-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, amount: Number(amount), reference }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || String(res.status));
      setLink(data.url);
    } catch (err) {
      alert(`Le lien n'a pas été créé (${err instanceof Error ? err.message : "erreur"}). Réessayez.`);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3 border-t border-beto-gray-subtle/40 pt-5 mt-5">
      <label className="text-xs font-medium text-beto-black tracking-wide">Lien de paiement Stripe</label>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => create("depot")}
          className="text-xs font-medium uppercase tracking-widest text-beto-gold hover:text-beto-black disabled:opacity-40"
        >
          Dépôt de design ({depositAmount} $)
        </button>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            min={1}
            step="0.01"
            placeholder="Solde ($)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-28 px-3 py-2 border border-beto-gray-subtle/60 bg-beto-offwhite text-sm focus:outline-none focus:border-beto-gold"
          />
          <input
            type="text"
            placeholder="No facture (ex. BJ-2026-1103)"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-56 px-3 py-2 border border-beto-gray-subtle/60 bg-beto-offwhite text-sm focus:outline-none focus:border-beto-gold"
          />
          <button
            type="button"
            disabled={busy || !amount}
            onClick={() => create("solde")}
            className="text-xs font-medium uppercase tracking-widest text-beto-gold hover:text-beto-black disabled:opacity-40"
          >
            Lien pour le solde
          </button>
        </div>
      </div>
      {link && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <input readOnly value={link} onFocus={(e) => e.target.select()} className="flex-1 min-w-0 px-3 py-2 border border-beto-gold/60 bg-beto-white" />
          <button type="button" onClick={() => navigator.clipboard.writeText(link)} className="font-medium uppercase tracking-widest text-beto-gold hover:text-beto-black">
            Copier
          </button>
        </div>
      )}
    </div>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="text-xs text-beto-gray-light hover:text-beto-black transition-colors underline"
    >
      Déconnexion
    </button>
  );
}
