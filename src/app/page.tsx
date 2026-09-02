import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import Collections from "@/components/home/Collections";
import WhyBeto from "@/components/home/WhyBeto";
import Process from "@/components/home/Process";
import Testimonials from "@/components/home/Testimonials";
import DesignJourney from "@/components/home/DesignJourney";
import EducationTeaser from "@/components/home/EducationTeaser";

export const metadata: Metadata = {
  title: "Beto Jewelry | Custom Engagement Rings Montreal",
  description:
    "Montreal's premier custom jewelry house. Handcrafted engagement rings, wedding bands, and bespoke fine jewelry. Work directly with our designer. CAD design within 48 hours.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Collections />
      <WhyBeto />
      <Process />
      <Testimonials />
      <DesignJourney />
      <EducationTeaser />
    </>
  );
}
