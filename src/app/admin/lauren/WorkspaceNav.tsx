"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { href: "/admin/lauren", label: "Today" },
  { href: "/admin/lauren/price", label: "Price" },
  { href: "/admin/lauren/clients", label: "Clients" },
  { href: "/admin/lauren/money", label: "Money" },
];

export default function WorkspaceNav({ name, isOwner }: { name: string; isOwner: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = (href: string) => (href === "/admin/lauren" ? pathname === href : pathname.startsWith(href));

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-label text-beto-gold">Beto Jewelry</p>
          <p className="text-sm text-beto-gray-light">Hi {name}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {isOwner && (
            <Link href="/admin/clients" className="text-beto-gray-light hover:text-beto-black underline">
              CRM complet
            </Link>
          )}
          <button
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              router.push("/admin/login");
              router.refresh();
            }}
            className="text-beto-gray-light hover:text-beto-black underline"
          >
            Log out
          </button>
        </div>
      </div>
      <nav className="grid grid-cols-4 border border-beto-gray-subtle bg-beto-white" aria-label="Workspace">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active(t.href) ? "page" : undefined}
            className={`py-3 text-center text-xs uppercase tracking-widest transition-colors ${
              active(t.href) ? "bg-beto-black text-white" : "text-beto-gray hover:text-beto-gold"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
