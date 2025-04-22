import React from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import LeaderboardTabs from '../components/LeaderboardTabs'

export default async function RanksPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Get the active tab from URL params or default to 'global'
  const activeTab = searchParams.tab || 'global'
  
  // Fetch top users ordered by points
  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      avatar_url,
      points,
      rank,
      correct_picks,
      total_picks,
      win_streak,
      best_streak
    `)
    .order('points', { ascending: false })
    .limit(100)
  
  // Create demo users if none exist
  const demoUsers = [
    {
      id: '1',
      username: 'SportsMaster',
      avatar_url: null,
      points: 15000,
      rank: 'Diamond',
      correct_picks: 450,
      total_picks: 600,
      win_streak: 12,
      best_streak: 15
    },
    {
      id: '2',
      username: 'StatGenius',
      avatar_url: null,
      points: 12500,
      rank: 'Platinum',
      correct_picks: 380,
      total_picks: 520,
      win_streak: 8,
      best_streak: 14
    },
    {
      id: '3',
      username: 'PickPro',
      avatar_url: null,
      points: 10000,
      rank: 'Gold',
      correct_picks: 300,
      total_picks: 450,
      win_streak: 5,
      best_streak: 10
    }
  ]
  
  const displayUsers = (users && users.length > 0 && !error) ? users : demoUsers
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Leaderboard</h1>
            <p className="mt-2 text-lg text-gray-700">
              See how you stack up against the competition
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <LeaderboardTabs activeTab={activeTab} users={displayUsers} />
        </div>
      </div>
    </div>
  )
} 