import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '../components/providers/theme-provider'
import { Providers } from './providers'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script";


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ResellerPro - Manage Your Reselling Business',
  description:
    'ResellerPro is an AI-powered CRM platform for WhatsApp and Instagram resellers to manage leads, orders, and automation.',
  keywords: 'whatsapp crm, instagram crm, reseller crm, resellerpro, order tracking, ai automation',
  openGraph: {
    title: 'ResellerPro - WhatsApp CRM',
    description: 'AI-powered CRM for WhatsApp resellers',
    url: 'https://resellerpro.in',
    siteName: 'ResellerPro',
    images: [
      {
        url: 'https://resellerpro.in/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ResellerPro Dashboard',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@resellerpro',
    title: 'ResellerPro - WhatsApp CRM',
    description: 'AI-powered CRM for WhatsApp resellers',
    images: ['https://resellerpro.in/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: { icon: '/icons/icon-192x192.png', apple: '/icons/icon-512x512.png' },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ResellerPro',
              url: 'https://resellerpro.in',
              logo: 'https://resellerpro.in/icons/icon-512x512.png',
              sameAs: [
                'https://www.instagram.com/resellerpro',
                'https://www.facebook.com/resellerpro',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'ResellerPro',
              url: 'https://resellerpro.in',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://resellerpro.in/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        {/* <AppLoader /> */}
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <OfflineBanner />
            {children}
            <Analytics />
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
