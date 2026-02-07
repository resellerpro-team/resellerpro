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
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-180x180.png',
  },
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
        {/* 🚀 SELF-HEALING / CACHE-BUSTER: Force clear stale Service Workers causing UI issues */}
        <script id="force-update" dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(registrations => {
                for(let registration of registrations) {
                  // In development or if explicitly requested, unregister stale workers
                  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                  if (isDev) {
                    registration.unregister();
                    console.log('[ResellerPro] Unregistered stale Service Worker for development stability.');
                  } else {
                    console.log('[ResellerPro] Optimizing Service Worker...');
                  }
                }
              });
            }
            // Add build timestamp to window to identify deployment
            window.__BUILD_ID__ = "${new Date().toISOString()}";
          `
        }} />
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
