import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About Beto Jewelry",
  description: "The story behind Beto Jewelry — Montreal's custom fine jewelry house. Learn about our goldsmith, our values, and our mission.",
};

export default function AboutPage() {
  return <AboutContent />;
}
