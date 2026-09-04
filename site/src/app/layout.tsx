import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const manrope = Manrope({
  weight: ["300", "400", "500", "600", "700"],
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

/** Root: fonts, metadata, global CSS. Chrome (nav, footer, cursor) lives in the (site) group. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrument.variable} ${manrope.variable}`}>
      <body className="min-h-dvh bg-ink text-text">{children}</body>
    </html>
  );
}
