import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'Travel Stories',
    template: '%s — Travel Stories',
  },
  description: 'Stories from the road — travel, code, and everything in between.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
