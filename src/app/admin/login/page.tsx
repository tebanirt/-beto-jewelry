"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin/clients");
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-beto-offwhite px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-beto-white p-10 border border-beto-gray-subtle/40">
        <p className="text-label text-beto-gold mb-3">Beto Jewelry</p>
        <h1 className="text-xl font-medium text-beto-black mb-6">Accès CRM</h1>
        <input
          type="password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="w-full px-4 py-3.5 border border-beto-gray-subtle/60 bg-beto-white text-sm text-beto-black placeholder:text-beto-gray-light focus:outline-none focus:border-beto-gold transition-colors mb-4"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-beto-black text-white text-xs font-medium uppercase tracking-widest hover:bg-beto-gold transition-colors duration-300 disabled:opacity-50"
        >
          {loading ? "..." : "Entrer"}
        </button>
        {error && <p className="text-sm text-red-700 mt-4">Mot de passe incorrect.</p>}
      </form>
    </section>
  );
}
