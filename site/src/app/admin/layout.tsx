import type { Metadata } from "next";
import { Archivo, Bodoni_Moda, IBM_Plex_Mono } from "next/font/google";
import "./docket.css";

const bodoni = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--f-display", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--f-body", display: "swap" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--f-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Press Docket", template: "%s — Press Docket" },
  robots: { index: false, follow: false },
};

/** Bare chrome for the studio's private tools; each page checks sign-in itself. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className={`docket ${bodoni.variable} ${archivo.variable} ${plex.variable}`}>{children}</div>;
}
