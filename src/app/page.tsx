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
    "Custom engagement rings and fine jewelry in Montreal, designed with you by certified goldsmith Rayane Tebani. 3D rendering in 48 hours, engagement rings delivered in about two weeks.",
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
