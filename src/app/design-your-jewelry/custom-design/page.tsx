import type { Metadata } from "next";
import CustomDesignContent from "./CustomDesignContent";

export const metadata: Metadata = {
  title: "Start Your Custom Design",
  description: "Begin your custom jewelry journey — tell us about your project, stone, metal, and budget. Free consultation, no obligation.",
  alternates: { canonical: "/design-your-jewelry/custom-design" },
  openGraph: {
    title: "Start Your Custom Design | Beto Jewelry",
    description: "Begin your custom jewelry journey — tell us about your project, stone, metal, and budget. Free consultation, no obligation.",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Beto Jewelry — Custom Fine Jewelry Montreal" }],
  },
};

export default function CustomDesignPage() {
  return <CustomDesignContent />;
}
