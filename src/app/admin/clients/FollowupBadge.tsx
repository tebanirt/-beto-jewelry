import type { FollowupState } from "@/lib/followups";

export default function FollowupBadge({ state }: { state: FollowupState }) {
  switch (state.kind) {
    case "due":
      return <span className="text-xs font-medium text-beto-black bg-beto-gold/20 px-2 py-1">Relance {state.number} due</span>;
    case "scheduled":
      return (
        <span className="text-xs text-beto-gray-light">
          Relance {state.number} le {state.date.toLocaleDateString("fr-CA", { timeZone: "America/Toronto" })}
        </span>
      );
    case "update_status":
      return <span className="text-xs font-medium text-beto-black bg-beto-gold/20 px-2 py-1">Consultation passée : mettre à jour le statut</span>;
    case "paused":
      return <span className="text-xs text-beto-gray-light">En pause</span>;
    case "done":
      return <span className="text-xs text-beto-gray-light">Relances terminées</span>;
    default:
      return <span className="text-xs text-beto-gray-light">—</span>;
  }
}
