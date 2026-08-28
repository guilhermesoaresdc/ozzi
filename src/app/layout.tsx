import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { CartProvider } from '@/lib/cart'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ozzi.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Ozzi Moda Feminina · Várzea Alegre - CE',
    template: '%s · Ozzi',
  },
  description:
    'Moda feminina em pronta entrega no Centro de Várzea Alegre. Retirada em até 2 horas, entrega local por motoboy e Correios para todo o Brasil.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Ozzi Moda Feminina',
    title: 'Ozzi Moda Feminina · Várzea Alegre - CE',
    description: 'Pronta entrega, retirada no Centro de Várzea Alegre e envio para todo o Brasil.',
  },
  icons: { icon: '/ozzi-logo.png' },
}

export const viewport: Viewport = {
  themeColor: '#F2EEE7',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
