'use client'

import React from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16 sm:py-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-green-600">Oops!</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-900">Something went wrong</h2>
        <p className="mt-6 text-lg text-gray-600">
          We're having some trouble loading this page. Our team has been notified.
        </p>
        
        {error.digest && (
          <p className="mt-2 text-sm text-gray-500">
            Error reference: {error.digest}
          </p>
        )}
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Try again
          </button>
          
          <Link
            href="/"
            className="px-4 py-2 bg-white text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
} 