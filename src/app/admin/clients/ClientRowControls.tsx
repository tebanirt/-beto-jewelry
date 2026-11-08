"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientStatus } from "@/lib/supabase";
import { STATUS_OPTIONS } from "@/lib/clientStatus";

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

/** Prix de vente + coût de production → marge par pièce (interne, jamais visible des clients). */
export function MarginControls({
  clientId,
  salePrice,
  productionCost,
}: {
  clientId: string;
  salePrice: number | null;
  productionCost: number | null;
}) {
  const router = useRouter();
  const [sale, setSale] = useState(salePrice?.toString() ?? "");
  const [cost, setCost] = useState(productionCost?.toString() ?? "");
  const [busy, setBusy] = useState(false);
  const margin = sale && cost ? Number(sale) - Number(cost) : null;

  async function save() {
    setBusy(true);
    await patchClient(clientId, {
      salePrice: sale ? Number(sale) : null,
      productionCost: cost ? Number(cost) : null,
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 border-t border-beto-gray-subtle/40 pt-5 mt-5">
      <label className="text-xs font-medium text-beto-black tracking-wide">Marge (interne)</label>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Prix de vente ($)"
          value={sale}
          onChange={(e) => setSale(e.target.value)}
          className="w-36 px-3 py-2 border border-beto-gray-subtle/60 bg-beto-offwhite text-sm focus:outline-none focus:border-beto-gold"
        />
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Coût de production ($)"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="w-44 px-3 py-2 border border-beto-gray-subtle/60 bg-beto-offwhite text-sm focus:outline-none focus:border-beto-gold"
        />
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="text-xs font-medium uppercase tracking-widest text-beto-gold hover:text-beto-black disabled:opacity-40"
        >
          Enregistrer
        </button>
        {margin !== null && (
          <span className={margin >= 1000 ? "text-green-700" : "text-beto-gray"}>
            Marge : {margin.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}
          </span>
        )}
      </div>
    </div>
  );
}

/** Génère un lien Stripe à usage unique que Rayane colle lui-même dans son courriel. */
export function PaymentLinkControls({ clientId, depositAmount }: { clientId: string; depositAmount: number }) {
  const [deposit, setDeposit] = useState(String(depositAmount));
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [link, setLink] = useState("");
  const [total, setTotal] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(kind: "depot" | "solde") {
    setBusy(true);
    setLink("");
    setTotal("");
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/payment-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, amount: Number(kind === "depot" ? deposit : amount), reference }),
      });
      const data = (await res.json()) as { url?: string; error?: string; amount?: number; tps?: number; tvq?: number; total?: number };
      if (!res.ok || !data.url) throw new Error(data.error || String(res.status));
      setLink(data.url);
      if (data.total !== undefined) {
        const $ = (n?: number) => (n ?? 0).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
        setTotal(`${$(data.amount)} + TPS ${$(data.tps)} + TVQ ${$(data.tvq)} = ${$(data.total)}`);
      }
    } catch (err) {
      alert(`Le lien n'a pas été créé (${err instanceof Error ? err.message : "erreur"}). Réessayez.`);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3 border-t border-beto-gray-subtle/40 pt-5 mt-5">
      <label className="text-xs font-medium text-beto-black tracking-wide">Lien de paiement Stripe</label>
      <p className="text-xs text-beto-gray -mt-1">Montants avant taxes : la TPS et la TVQ s’ajoutent au lien.</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            min={1}
            step="1"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            aria-label="Montant du dépôt avant taxes ($)"
            title="250 $ par défaut — 200 $ pour un client déjà soumissionné à l'ancien prix"
            className="w-20 px-3 py-2 border border-beto-gray-subtle/60 bg-beto-offwhite text-sm focus:outline-none focus:border-beto-gold"
          />
          <button
            type="button"
            disabled={busy || !deposit}
            onClick={() => create("depot")}
            className="text-xs font-medium uppercase tracking-widest text-beto-gold hover:text-beto-black disabled:opacity-40"
          >
            Lien pour le dépôt
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            min={1}
            step="0.01"
            placeholder="Solde avant taxes ($)"
            aria-label="Solde avant taxes ($)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-44 px-3 py-2 border border-beto-gray-subtle/60 bg-beto-offwhite text-sm focus:outline-none focus:border-beto-gold"
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
      {total && <p className="text-xs text-beto-black">Le client paiera : {total}</p>}
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
