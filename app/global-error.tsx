'use client'

import React from 'react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen bg-white`}>
        <div className="flex-grow flex items-center justify-center px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-green-600">Rival Sports</h1>
            <h2 className="mt-4 text-3xl font-semibold text-gray-900">We'll be right back</h2>
            <p className="mt-6 text-lg text-gray-600">
              We're experiencing some technical difficulties and are working to fix the issue.
            </p>
            
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => reset()}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-lg"
              >
                Refresh the page
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 