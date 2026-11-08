import Link from "next/link";
import { VUES, type VueVentes } from "@/lib/entite";

/**
 * Choix « Tout · Société · Avant la société », affiché à Rayane seulement
 * (la page vérifie le rôle ; le serveur refuse de toute façon une autre vue
 * à une autre session).
 */
export default function VueToggle({
  vue,
  href,
  compact = false,
}: {
  vue: VueVentes;
  /** Adresse de la page pour une vue donnée (garde les autres paramètres, ex. le mois). */
  href: (v: VueVentes) => string;
  compact?: boolean;
}) {
  return (
    <nav aria-label="Ventes affichées" className="flex flex-wrap items-center gap-1.5">
      {VUES.map((v) => {
        const on = v.value === vue;
        return (
          <Link
            key={v.value}
            href={href(v.value)}
            aria-current={on ? "page" : undefined}
            className={`inline-flex items-center ${compact ? "text-xs px-2.5 py-1.5" : "text-xs px-3 py-2"} border transition-colors ${
              on
                ? "bg-beto-black text-white border-beto-black"
                : "border-beto-gray-subtle bg-beto-white text-beto-gray hover:border-beto-gold hover:text-beto-black"
            }`}
          >
            {v.label}
          </Link>
        );
      })}
    </nav>
  );
}
