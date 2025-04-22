import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'

// Components
import Header from './components/Header'
import Footer from './components/Footer'
import Providers from './components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rival Sports - Sports Picks & Analysis',
  description: 'Sports content and fan pick competition platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        <Providers>
          <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse" />}>
            <Header />
          </Suspense>
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
} 