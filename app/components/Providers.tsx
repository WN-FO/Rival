'use client'

import { AuthProvider } from './AuthProvider'
import SupabaseProvider from './SupabaseProvider'
import ToastProvider from './ToastProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </SupabaseProvider>
  )
} 