import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import MetaPixel from "@/components/analytics/MetaPixel";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://betojewelry.com"),
  title: {
    default: "Beto Jewelry | Custom Engagement Rings Montreal",
    template: "%s | Beto Jewelry",
  },
  description:
    "Montreal's premier custom jewelry house. Handcrafted engagement rings, wedding bands, and bespoke fine jewelry. Work directly with our designer. CAD design within 48 hours.",
  keywords: [
    "custom engagement rings Montreal",
    "bespoke jewelry Montreal",
    "wedding bands Montreal",
    "fine jewelry Montreal",
    "custom jewelry designer Montreal",
    "bague de fiançailles Montreal",
    "bijoux sur mesure Montreal",
  ],
  authors: [{ name: "Beto Jewelry" }],
  creator: "Beto Jewelry",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://betojewelry.com",
    siteName: "Beto Jewelry",
    title: "Beto Jewelry | Custom Engagement Rings Montreal",
    description:
      "Montreal's premier custom jewelry house. Every ring is designed specifically for you.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Beto Jewelry — Custom Fine Jewelry Montreal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beto Jewelry | Custom Engagement Rings Montreal",
    description:
      "Montreal's premier custom jewelry house. Every ring is designed specifically for you.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: "Beto Jewelry",
  description:
    "Montreal's premier custom jewelry house. Handcrafted engagement rings, wedding bands, and bespoke fine jewelry.",
  url: "https://betojewelry.com",
  logo: "https://betojewelry.com/logo.png",
  image: "https://betojewelry.com/og-image.jpg",
  email: "betojewlz@gmail.com",
  telephone: "+1-438-874-5759",
  priceRange: "$$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Montreal",
    addressRegion: "QC",
    addressCountry: "CA",
  },
  sameAs: [
    "https://instagram.com/betojewelry",
    "https://facebook.com/betojewelry",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-beto-white text-beto-black antialiased">
        <MetaPixel />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
