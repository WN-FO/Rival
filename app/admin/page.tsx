'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '../components/ToastProvider'

export default function AdminPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const updateActiveSports = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/update-active-sports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (data.success) {
        showToast('success', 'Successfully updated active sports')
        router.refresh()
      } else {
        showToast('error', data.error || 'Failed to update sports')
      }
    } catch (error) {
      console.error('Error updating sports:', error)
      showToast('error', 'An error occurred while updating sports')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
          Admin Dashboard
        </h1>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Sports Configuration</h2>
          <p className="mb-6 text-gray-600">
            Configure which sports leagues are active in the application.
            Currently focusing on NBA, MLB, and NFL only.
          </p>
          
          <button
            onClick={updateActiveSports}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Active Sports (NBA, MLB, NFL only)'}
          </button>
        </div>
      </div>
    </div>
  )
} 