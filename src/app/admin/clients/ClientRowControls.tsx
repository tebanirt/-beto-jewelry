"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientStatus } from "@/lib/supabase";

const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: "nouveau", label: "Nouveau" },
  { value: "consultation", label: "Consultation" },
  { value: "depot_recu", label: "Dépôt reçu" },
  { value: "design", label: "Design en cours" },
  { value: "production", label: "Production" },
  { value: "livre", label: "Livré" },
  { value: "perdu", label: "Perdu" },
];

export function StatusSelect({ clientId, status }: { clientId: string; status: ClientStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(newStatus: ClientStatus) {
    setValue(newStatus);
    setSaving(true);
    await fetch(`/api/admin/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
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
