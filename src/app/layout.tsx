import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Analytics from "@/components/analytics/Analytics";
import AttributionCapture from "@/components/analytics/AttributionCapture";
import HideOnAdmin from "@/components/layout/HideOnAdmin";

// Système visuel « Site 50 000 $ » : Bodoni Moda pour les titres (avec l'axe
// de taille optique), Jost pour le texte et l'interface.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://betojewelry.com"),
  title: {
    default: "Beto Jewelry | Custom Engagement Rings Montreal",
    template: "%s | Beto Jewelry",
  },
  description:
    "Custom engagement rings and fine jewelry in Montreal, designed with you by certified goldsmith Rayane Tebani. 3D rendering in 48 hours, engagement rings delivered in about two weeks.",
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
      "Custom engagement rings and fine jewelry in Montreal. Every ring is designed with you, directly by the goldsmith who makes it.",
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
      "Custom engagement rings and fine jewelry in Montreal. Every ring is designed with you, directly by the goldsmith who makes it.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "kpg9jk6NmaZ_4iU-IHPSq6IIOIYFPn-nJiEk_4bTJM8",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0E0C",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["JewelryStore", "LocalBusiness"],
  "@id": "https://betojewelry.com/#business",
  name: "Beto Jewelry",
  description:
    "Custom engagement rings, wedding bands and fine jewelry in Montreal, designed with you by certified goldsmith Rayane Tebani. 3D CAD rendering in 48 hours, engagement rings delivered in about two weeks.",
  url: "https://betojewelry.com",
  logo: "https://betojewelry.com/logo.png",
  image: "https://betojewelry.com/og-image.jpg",
  email: "betojewlz@gmail.com",
  telephone: "+1-438-874-5759",
  priceRange: "$$$",
  currenciesAccepted: "CAD",
  paymentAccepted: "Credit Card, Bank Transfer, Installments",
  slogan: "Your real competition isn't Cartier — it's uncertainty.",
  knowsLanguage: ["en", "fr"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Montreal",
    addressRegion: "QC",
    addressCountry: "CA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 45.5019,
    longitude: -73.5674,
  },
  areaServed: [
    { "@type": "City", name: "Montreal" },
    { "@type": "AdministrativeArea", name: "Quebec" },
    { "@type": "Country", name: "Canada" },
  ],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "10:00",
    closes: "18:00",
    description: "By appointment — in person in Montreal or by virtual consultation.",
  },
  founder: {
    "@type": "Person",
    name: "Rayane Tebani",
    jobTitle: "Goldsmith & Founder",
    description:
      "Certified goldsmith trained in jewellery-making at the École des métiers du Sud-Ouest-de-Montréal (CSSDM). 500+ designs created over his career.",
    knowsAbout: [
      "Custom engagement rings",
      "Diamond selection",
      "CAD jewellery design",
      "Wedding bands",
    ],
  },
  makesOffer: {
    "@type": "Offer",
    priceCurrency: "CAD",
    priceSpecification: {
      "@type": "PriceSpecification",
      minPrice: 2000,
      priceCurrency: "CAD",
      description: "Custom engagement rings typically start around $2,000 CAD including the diamond.",
    },
    itemOffered: {
      "@type": "Service",
      name: "Custom engagement ring design",
      serviceType: "Bespoke jewellery design and manufacturing",
    },
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Beto Jewelry Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom engagement rings" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom wedding bands" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom fine jewelry" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Heirloom redesign" } },
    ],
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
      className={`${bodoni.variable} ${jost.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Les apparitions au défilement ne masquent le contenu que si JavaScript tourne. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('bj-js')" }} />
      </head>
      <body className="bj-site bg-beto-offwhite text-beto-black antialiased">
        <HideOnAdmin>
          <Analytics />
          <AttributionCapture />
        </HideOnAdmin>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <HideOnAdmin>
          <Navigation />
        </HideOnAdmin>
        <main id="contenu" tabIndex={-1} className="outline-none">{children}</main>
        <HideOnAdmin>
          <Footer />
        </HideOnAdmin>
      </body>
    </html>
  );
}
