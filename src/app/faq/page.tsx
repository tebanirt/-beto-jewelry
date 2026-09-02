import type { Metadata } from "next";
import FAQContent from "./FAQContent";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to the questions we get asked most — custom design process, timelines, materials, sizing, and more.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return <FAQContent />;
}
