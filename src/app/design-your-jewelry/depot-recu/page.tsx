import type { Metadata } from "next";
import DepositReceivedContent from "./DepositReceivedContent";

// Where the Stripe Payment Link sends clients after paying the design deposit.
export const metadata: Metadata = {
  title: "Dépôt reçu",
  robots: { index: false, follow: false },
};

export default function DepositReceivedPage() {
  return <DepositReceivedContent />;
}
