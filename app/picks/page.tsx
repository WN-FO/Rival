import React from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import TodayGames from '@/app/components/TodayGames'
import MyPicks from '@/app/components/MyPicks'
import PicksEmptyState from '@/app/components/PicksEmptyState'

export default async function PicksPage({
  searchParams,
}: {
  searchParams: { tab?: string; game?: string }
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Get the current user
  const { data: { session } } = await supabase.auth.getSession()
  
  // If not logged in, redirect to login
  if (!session) {
    redirect('/login?next=/picks')
  }
  
  const activeTab = searchParams.tab || 'today'
  const gameId = searchParams.game || null
  
  // Get sports for filtering
  const { data: sports } = await supabase
    .from('sports')
    .select('id, name, display_name, icon_url')
    .eq('active', true)
    .order('name', { ascending: true })
  
  // Get today's games
  const today = new Date()
  const startDate = new Date(today)
  startDate.setUTCHours(0, 0, 0, 0)
  
  const endDate = new Date(today)
  endDate.setUTCHours(23, 59, 59, 999)
  
  let gamesQuery = supabase
    .from('games')
    .select(`
      *,
      sport:sports(id, name, display_name, icon_url),
      home_team:teams!games_home_team_id_fkey(id, name, abbreviation, logo_url, city),
      away_team:teams!games_away_team_id_fkey(id, name, abbreviation, logo_url, city),
      my_pick:picks(id, pick_team_id)
    `)
    .gte('start_time', startDate.toISOString())
    .lt('start_time', endDate.toISOString())
    .eq('my_pick.user_id', session.user.id)
    .order('start_time', { ascending: true })
  
  const { data: todayGames, error: gamesError } = await gamesQuery
  
  // Get my picks for today's games
  const { data: myPicks, error: picksError } = await supabase
    .from('picks')
    .select(`
      *,
      game:games(
        id,
        sport_id,
        home_team_id, 
        away_team_id,
        start_time,
        lock_time,
        home_score,
        away_score,
        status,
        winner_id,
        home_team:teams!games_home_team_id_fkey(id, name, abbreviation, logo_url, city),
        away_team:teams!games_away_team_id_fkey(id, name, abbreviation, logo_url, city),
        sport:sports(id, name, display_name)
      ),
      picked_team:teams(id, name, abbreviation, logo_url)
    `)
    .eq('user_id', session.user.id)
    .in('game.status', ['scheduled', 'in_progress', 'final'])
    .order('created_at', { ascending: false })
    .limit(20)
  
  // Get the count of available games today
  const { count: availableGamesCount } = await supabase
    .from('games')
    .select('id', { count: 'exact', head: true })
    .gte('start_time', startDate.toISOString())
    .lt('start_time', endDate.toISOString())
    .eq('status', 'scheduled')
  
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Game Picks</h1>
          <p className="mt-2 text-sm text-gray-500">
            Make your predictions for today's games and track your picks
          </p>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <a
              href="/picks?tab=today"
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'today'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Today's Games
              {availableGamesCount > 0 && (
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === 'today'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {availableGamesCount}
                </span>
              )}
            </a>
            <a
              href="/picks?tab=my-picks"
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'my-picks'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              My Picks
              {(myPicks?.length || 0) > 0 && (
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === 'my-picks'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {myPicks?.length}
                </span>
              )}
            </a>
          </nav>
        </div>
        
        {/* Tab content */}
        {activeTab === 'today' && (
          <>
            {todayGames && todayGames.length > 0 ? (
              <TodayGames games={todayGames} sports={sports || []} highlightGameId={gameId} />
            ) : (
              <PicksEmptyState message="No games scheduled for today" />
            )}
          </>
        )}
        
        {activeTab === 'my-picks' && (
          <>
            {myPicks && myPicks.length > 0 ? (
              <MyPicks picks={myPicks} />
            ) : (
              <PicksEmptyState message="You haven't made any picks yet" actionText="Make Picks" actionUrl="/picks?tab=today" />
            )}
          </>
        )}
      </div>
    </div>
  )
} 