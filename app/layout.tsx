import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

import '@/app/globals.css'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { Providers } from '@/components/providers'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from "@vercel/analytics/react"
import { GameProvider } from '@/lib/game/game-context'
import { GameSidebar } from '@/components/game/game-sidebar'
import { LogoBadge } from '@/components/logo-badge'

export const metadata = {
  metadataBase: process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : undefined,
  title: {
    default: 'Stocrates - Learn Markets Through the Socratic Method',
    template: `%s - Stocrates`,
  },
  description:
    'Educational AI-powered financial literacy platform combining stock market analysis with the Socratic Method. Learn through historical patterns, not predictions.',
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg'
  }
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'font-sans antialiased',
          GeistSans.variable,
          GeistMono.variable
        )}
        suppressHydrationWarning
      >
        <Toaster position="top-center" />
        <Providers
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <GameProvider>
            <div className="flex flex-col min-h-screen bg-stocrates-cream">
              <Header />
              <main className="flex flex-col flex-1 bg-stocrates-cream">{children}</main>
            </div>
            <GameSidebar />
            <LogoBadge />
            {/* <ThemeToggle /> */}
            <Analytics />
          </GameProvider>
        </Providers>
      </body>
    </html>
  )
}
