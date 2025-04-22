'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from './SupabaseProvider'
import type { User } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

type Profile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Listen for authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        setIsLoading(false)

        if (session?.user) {
          // Fetch user profile when signed in
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          setProfile(data)
        } else {
          setProfile(null)
        }
      }
    )

    // Initial session check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setProfile(data)
      }
      
      setIsLoading(false)
    }

    checkUser()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Sign in handler
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  // Sign up handler
  const signUp = async (email: string, password: string, username: string) => {
    const { error: signUpError, data } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          username
        }
      }
    })

    if (signUpError) return { error: signUpError }

    // Create profile if sign up successful
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .update({ username })
        .eq('id', data.user.id)

      return { error: profileError }
    }

    return { error: null }
  }

  // Sign out handler
  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Update profile handler
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setProfile((prev) => prev ? { ...prev, ...updates } : null)
    }

    return { error }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
} 