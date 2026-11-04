"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const field =
  "w-full px-4 py-3 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold";

export default function TeamForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("Lauren");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState(true);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password, active }),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (res.ok) {
      setPassword("");
      setMessage({ ok: true, text: "Enregistré." });
      router.refresh();
    } else {
      setMessage({ ok: false, text: body.error || "Erreur — rien n'a été enregistré." });
    }
  }

  return (
    <form onSubmit={submit} className="bg-beto-white border border-beto-gray-subtle/40 p-6 space-y-3">
      <h2 className="text-sm font-medium text-beto-black">Créer ou modifier un accès</h2>
      <input className={field} type="email" required placeholder="Courriel de Lauren" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className={field} placeholder="Nom affiché" value={name} onChange={(e) => setName(e.target.value)} />
      <input
        className={field}
        type="password"
        autoComplete="new-password"
        placeholder="Mot de passe (10 caractères min. — vide = ne pas changer)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm text-beto-gray">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Accès actif
      </label>
      <button
        type="submit"
        disabled={saving}
        className="w-full py-3.5 bg-beto-black text-white text-xs font-medium uppercase tracking-widest hover:bg-beto-gold transition-colors disabled:opacity-50"
      >
        {saving ? "..." : "Enregistrer"}
      </button>
      {message && <p className={`text-sm ${message.ok ? "text-beto-gold-dark" : "text-red-700"}`}>{message.text}</p>}
    </form>
  );
}
