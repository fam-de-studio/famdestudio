import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { site } from "@/content/site";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Cursor } from "@/components/site/Cursor";
import "./globals.css";

const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const manrope = Manrope({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Luxury Packaging Design & Production`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — Luxury Packaging Design & Production`,
    description: site.description,
    url: site.url,
    images: [{ url: "/og.jpg", width: 1376, height: 768, alt: "A collection of luxury rigid boxes and cartons by FAM De Studio" }],
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Luxury Packaging Design & Production`,
    description: site.description,
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0e0e0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrument.variable} ${manrope.variable}`}>
      <body className="min-h-dvh bg-ink text-text">
        <a
          href="#main"
          className="t-nav sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-text focus:px-4 focus:py-3 focus:text-ink"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <Cursor />
      </body>
    </html>
  );
}
