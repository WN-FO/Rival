'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../types/supabase'

interface SupabaseContext {
  supabase: ReturnType<typeof createClientComponentClient<Database>>
  serviceClient: ReturnType<typeof createClient<Database>>
}

const SupabaseContext = createContext<SupabaseContext | undefined>(undefined)

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientComponentClient<Database>())
  const [serviceClient] = useState(() => 
    createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  // Listen for realtime changes
  useEffect(() => {
    const channel = supabase.channel('schema-db-changes')
    
    // Listen for article inserts
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'articles' },
      (payload) => {
        console.log('New article:', payload.new)
        // You can trigger a toast or notification here if needed
      }
    )
    
    // Listen for pick inserts
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'picks' },
      (payload) => {
        console.log('New pick:', payload.new)
      }
    )
    
    // Listen for ring changes
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'users', filter: 'ring=eq.HallOfFame' },
      (payload) => {
        console.log('Hall of Fame promotion:', payload.new)
        // This is a good place to trigger a celebration notification
      }
    )
    
    channel.subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <SupabaseContext.Provider value={{ supabase, serviceClient }}>
      {children}
    </SupabaseContext.Provider>
  )
} 