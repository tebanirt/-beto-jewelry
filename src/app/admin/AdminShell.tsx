import Link from "next/link";
import { LogoutButton } from "./clients/ClientRowControls";

/**
 * En-tête commun du CRM : marque, sections, déconnexion, puis le titre de la
 * page. Server component (seul le bouton de déconnexion est côté client).
 */

const SECTIONS = [
  { key: "clients", href: "/admin/clients", label: "Clients" },
  { key: "finances", href: "/admin/finances", label: "Finances" },
  { key: "funnel", href: "/admin/funnel", label: "Formulaire" },
  { key: "lauren", href: "/admin/lauren", label: "Espace Lauren" },
  { key: "team", href: "/admin/team", label: "Équipe" },
] as const;

export type AdminSection = (typeof SECTIONS)[number]["key"];

export default function AdminShell({
  active,
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  active: AdminSection;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-beto-offwhite text-beto-black">
      <header className="bg-beto-white border-b border-beto-gray-subtle">
        <div className="max-w-6xl mx-auto px-5 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <Link href="/admin/clients" className="flex items-baseline gap-2 group">
            <span className="font-display text-xl tracking-wide text-beto-black group-hover:text-beto-gold-dark transition-colors">
              Beto Jewelry
            </span>
            <span className="text-label text-beto-gold">CRM</span>
          </Link>
          <nav aria-label="Sections du CRM" className="flex flex-wrap items-center gap-1 -mx-2">
            {SECTIONS.map((s) => {
              const on = s.key === active;
              return (
                <Link
                  key={s.key}
                  href={s.href}
                  aria-current={on ? "page" : undefined}
                  className={`relative px-2.5 py-2 text-sm transition-colors ${
                    on ? "text-beto-black font-medium" : "text-beto-gray-light hover:text-beto-black"
                  }`}
                >
                  {s.label}
                  {on && <span aria-hidden className="absolute left-2.5 right-2.5 -bottom-[13px] h-[2px] bg-beto-gold" />}
                </Link>
              );
            })}
            <span className="mx-2 h-4 w-px bg-beto-gray-subtle" aria-hidden />
            <LogoutButton />
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div className="min-w-0">
            {eyebrow && <p className="text-label text-beto-gold mb-2">{eyebrow}</p>}
            <h1 className="font-display text-4xl sm:text-5xl font-normal leading-tight text-beto-black text-balance">{title}</h1>
            {subtitle && <p className="text-sm text-beto-gray mt-2 max-w-3xl">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Carte blanche à filet fin, le conteneur de base du CRM. */
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-beto-white border border-beto-gray-subtle ${className}`}>{children}</div>;
}

/** Titre de section, petit et espacé, avec une note facultative à droite. */
export function SectionTitle({ children, note }: { children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
      <h2 className="text-label text-beto-gray">{children}</h2>
      {note && <p className="text-xs text-beto-gray-light">{note}</p>}
    </div>
  );
}

/** Chiffre clé : libellé, grand nombre, ligne de contexte. */
export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "gold" | "good" | "bad";
}) {
  const color = tone === "gold" ? "text-beto-gold-dark" : tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-red-700" : "text-beto-black";
  return (
    <div className="bg-beto-white border border-beto-gray-subtle px-5 py-4 min-w-0">
      <p className="text-label text-beto-gray-light">{label}</p>
      <p className={`font-display text-3xl sm:text-[2.1rem] leading-tight mt-1 tabular-nums ${color}`}>{value}</p>
      {hint && <p className="text-xs text-beto-gray-light mt-1">{hint}</p>}
    </div>
  );
}
