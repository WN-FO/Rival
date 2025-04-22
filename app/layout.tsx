import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'

// Components
import Header from './components/Header'
import Footer from './components/Footer'
import AuthProvider from './components/AuthProvider'

// Utils
import SupabaseProvider from './components/SupabaseProvider'
import ToastProvider from './components/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RivalAI - Sports Picks & Analysis',
  description: 'AI-powered sports content and fan pick competition platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        <SupabaseProvider>
          <AuthProvider>
            <ToastProvider>
              <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse" />}>
                <Header />
              </Suspense>
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </ToastProvider>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
} 