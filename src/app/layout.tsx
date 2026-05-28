import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GrudgeVault — Archives Émotionnelles Privées',
  description: "Certains tournent la page. D'autres gardent les preuves.",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'oklch(0.16 0.015 280)',
                border: '1px solid oklch(1 0 0 / 10%)',
                color: 'oklch(0.96 0.01 280)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
