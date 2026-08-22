import type { Metadata } from 'next'
import { Archivo, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const archivo = Archivo({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Fam de Studio — decorative print & packaging',
  description:
    'Hot foil, drip-off, metalized and soft-touch packaging for small premium brands. ' +
    'Designed and produced in Pakistan, from 200 pieces, delivered to your door.',
  openGraph: {
    title: 'Fam de Studio — decorative print & packaging',
    description:
      'The fine work most printers won’t attempt. Foil, drip-off, metalized, soft touch — from 200 pieces.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
