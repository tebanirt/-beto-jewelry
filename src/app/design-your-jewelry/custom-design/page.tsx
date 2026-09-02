import type { Metadata } from "next";
import CustomDesignContent from "./CustomDesignContent";

export const metadata: Metadata = {
  title: "Start Your Custom Design",
  description: "Begin your custom jewelry journey — tell us about your project, stone, metal, and budget. Free consultation, no obligation.",
  alternates: { canonical: "/design-your-jewelry/custom-design" },
};

export default function CustomDesignPage() {
  return <CustomDesignContent />;
}
