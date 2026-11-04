import type { ClientStatus } from "@/lib/supabase";

/**
 * Plain module (not "use client") so server pages can read the list: values
 * exported from a client component file are only references on the server.
 */
export const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: "nouveau", label: "Nouveau (pas réservé)" },
  { value: "consultation_reservee", label: "Consultation réservée" },
  { value: "consultation_faite", label: "Consultation faite, pas acheté" },
  { value: "depot_recu", label: "Dépôt reçu" },
  { value: "design", label: "Design en cours" },
  { value: "production", label: "Production" },
  { value: "livre", label: "Livré" },
  { value: "perdu", label: "Perdu" },
];
