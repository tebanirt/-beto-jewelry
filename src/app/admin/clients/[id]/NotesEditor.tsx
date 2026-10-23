"use client";

import { useState } from "react";

export default function NotesEditor({ clientId, initialNotes }: { clientId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/clients/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div>
      <label className="text-xs font-medium text-beto-black tracking-wide mb-2 block">Notes internes</label>
      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        rows={3}
        className="w-full px-4 py-3 border border-beto-gray-subtle/60 bg-beto-offwhite text-sm text-beto-black focus:outline-none focus:border-beto-gold transition-colors resize-none"
      />
      <button
        onClick={handleSave}
        disabled={saved || saving}
        className="mt-2 text-xs font-medium uppercase tracking-widest text-beto-gold hover:text-beto-black transition-colors disabled:opacity-40 disabled:cursor-default"
      >
        {saving ? "Enregistrement..." : saved ? "Enregistré" : "Enregistrer"}
      </button>
    </div>
  );
}
