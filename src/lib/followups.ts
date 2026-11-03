import type { Client } from "@/lib/supabase";

/**
 * Rythme de relance confirmé le 24 oct. 2026 (docs/business-ops-brief.md §7bis/§7ter).
 * Les jours sont comptés à partir du point de départ de l'étape :
 *  - nouveau (jamais réservé)       : depuis la création du client — J+4, J+10
 *    (le J+1 est déjà le premier contact préparé par le triage horaire)
 *  - consultation_faite (pas acheté) : depuis la consultation — J+2, J+10
 * Maximum 3 relances actives au total par étape (premier contact compris), puis pause.
 * La tâche programmée « Relances clients » applique exactement ces règles en SQL.
 */
export const FOLLOWUP_SCHEDULE: Partial<Record<Client["status"], number[]>> = {
  nouveau: [4, 10],
  consultation_faite: [2, 10],
};

const DAY = 24 * 60 * 60 * 1000;

export type FollowupState =
  | { kind: "none" }
  | { kind: "paused" }
  | { kind: "done" }
  | { kind: "due"; number: number }
  | { kind: "scheduled"; number: number; date: Date }
  | { kind: "update_status" }; // consultation passée mais statut encore « réservée »

export function followupState(client: Client, now = new Date()): FollowupState {
  if (client.status === "consultation_reservee") {
    if (client.consultation_at && new Date(client.consultation_at) < now) return { kind: "update_status" };
    return { kind: "none" };
  }
  const schedule = FOLLOWUP_SCHEDULE[client.status];
  if (!schedule) return { kind: "none" };
  if (client.followups_paused) return { kind: "paused" };
  if (client.followup_count >= schedule.length) return { kind: "done" };

  const start =
    client.status === "consultation_faite"
      ? new Date(client.consultation_at ?? client.updated_at)
      : new Date(client.created_at);
  const date = new Date(start.getTime() + schedule[client.followup_count] * DAY);
  const number = client.followup_count + 1;
  return date <= now ? { kind: "due", number } : { kind: "scheduled", number, date };
}
