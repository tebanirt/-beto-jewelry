"use client";

import PageHero from "@/components/shared/PageHero";
import DesignJourney from "@/components/home/DesignJourney";
import { useTranslation } from "@/hooks/useTranslation";

export default function DesignYourJewelryContent() {
  const tr = useTranslation();
  const p = tr.pages.designYourJewelry;

  return (
    <>
      <PageHero
        eyebrow={p.eyebrow}
        title={p.title}
        titleItalic={p.titleItalic}
        subtitle={p.subtitle}
        centered
      />
      <DesignJourney />
    </>
  );
}
