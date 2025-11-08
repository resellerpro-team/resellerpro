import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
// Update the import path if the file is located elsewhere, for example:
import { ThemeProvider } from '../components/providers/theme-provider'
import { AppLoader } from '@/components/onboarding/PremiumLoader'
// Or, if using absolute imports, ensure your tsconfig.json has the correct "paths" and "baseUrl" set.

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ResellerPro - Manage Your Reselling Business',
  description: 'Complete order management system for WhatsApp/Instagram resellers',
  keywords: ['reselling', 'order management', 'inventory', 'business'],
  manifest: '/manifest.json',
  themeColor: '#0f172a',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppLoader/>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}