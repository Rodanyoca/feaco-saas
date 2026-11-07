import type { Metadata } from 'next'
import localFont from 'next/font/local'

import './globals.css'
import { DashboardShell } from "@/components/dashboard/dashboard-layout"
import { Toaster } from "@/components/ui/sonner"

const geist = localFont({
  src: './fonts/geist-latin.woff2',
  variable: '--font-geist-sans',
  display: 'swap',
  weight: '100 900',
})

const geistMono = localFont({
  src: './fonts/geist-mono-latin.woff2',
  variable: '--font-geist-mono',
  display: 'swap',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'FEACO - Système de Gestion',
  description: 'Plateforme de gestion de la Fédération d’Athlétisme du Congo',
  generator: 'DS Concept',
  icons: {
    icon: [{ url: '/logo-feaco.jpeg', type: 'image/jpeg' }],
    shortcut: '/logo-feaco.jpeg',
    apple: '/logo-feaco.jpeg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <DashboardShell>{children}</DashboardShell>
        <Toaster />
        
      </body>
    </html>
  )
}
