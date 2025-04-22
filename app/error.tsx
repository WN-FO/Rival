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
      <div className="text-center max-w-md">
        <div className="mb-6 mx-auto w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-indigo-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-indigo-600">Time Out!</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-900">We've Hit a Snag</h2>
        <p className="mt-4 text-lg text-gray-600">
          Looks like our play didn't go as planned. Our team is working on a quick comeback!
        </p>
        
        {error.digest && (
          <p className="mt-2 text-sm text-gray-500">
            Error ref: {error.digest}
          </p>
        )}
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-3 bg-white text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Back to Home
          </Link>
        </div>
        
        <p className="mt-8 text-sm text-gray-500">
          Need help? <Link href="/contact" className="text-indigo-600 hover:text-indigo-500">Contact our support team</Link>
        </p>
      </div>
    </div>
  )
} 