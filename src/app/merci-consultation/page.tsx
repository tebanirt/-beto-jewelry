import type { Metadata } from "next";
import { Suspense } from "react";
import BookingConfirmedContent from "./BookingConfirmedContent";

// Page de retour après une réservation Calendly (redirection configurée dans
// l'événement Calendly). Jamais indexée : elle n'a de sens qu'après une vraie réservation.
export const metadata: Metadata = {
  title: "Consultation confirmée",
  robots: { index: false, follow: false },
};

export default function BookingConfirmedPage() {
  return (
    <Suspense>
      <BookingConfirmedContent />
    </Suspense>
  );
}
