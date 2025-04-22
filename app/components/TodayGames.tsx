'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useSupabase } from './SupabaseProvider'
import { useAuth } from './AuthProvider'
import { useToast } from './ToastProvider'
import { format } from 'date-fns'
import { CheckIcon } from './icons'
import type { Database } from '../types/supabase'

type Game = Database['public']['Tables']['games']['Row'] & {
  sport: Database['public']['Tables']['sports']['Row'] | null
  home_team: Database['public']['Tables']['teams']['Row']
  away_team: Database['public']['Tables']['teams']['Row']
  my_pick: Pick<Database['public']['Tables']['picks']['Row'], 'id' | 'pick_team_id'>[] | null
}

interface Sport {
  id: number
  name: string
  display_name: string
  icon_url: string | null
  active: boolean
}

interface TodayGamesProps {
  games: Game[]
  sports: Sport[]
  highlightGameId?: string | null
}

const TodayGames: React.FC<TodayGamesProps> = ({ games, sports, highlightGameId }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { showToast } = useToast()
  
  const [makingPick, setMakingPick] = useState<string | null>(null)
  const [activeSport, setActiveSport] = useState<number | null>(null)
  
  // Filter out inactive sports
  const activeSports = sports.filter(sport => sport.active)
  
  // Filter games by selected sport
  const filteredGames = activeSport 
    ? games.filter(game => game.sport_id === activeSport)
    : games
  
  // Group games by start time
  const groupedGames = filteredGames.reduce((acc, game) => {
    const startHour = new Date(game.start_time).getHours()
    if (!acc[startHour]) {
      acc[startHour] = []
    }
    acc[startHour].push(game)
    return acc
  }, {} as Record<number, Game[]>)
  
  // Sort time slots
  const sortedTimeSlots = Object.keys(groupedGames).map(Number).sort((a, b) => a - b)
  
  // Handle pick submission
  const makePick = async (gameId: string, teamId: number) => {
    if (!user) {
      router.push('/login?next=/picks')
      return
    }
    
    setMakingPick(gameId)
    
    try {
      const { error } = await supabase
        .from('picks')
        .upsert({
          user_id: user.id,
          game_id: gameId,
          pick_team_id: teamId,
          created_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Error making pick:', error)
        showToast('error', error.message)
      } else {
        showToast('success', 'Your pick has been recorded!')
        
        // Update the game in the local state to show the pick immediately
        // This is best done by refreshing the page to get the updated data
        router.refresh()
      }
    } catch (err) {
      console.error('Error making pick:', err)
      showToast('error', 'Failed to submit your pick')
    } finally {
      setMakingPick(null)
    }
  }
  
  // Helper to check if a team is picked
  const isTeamPicked = (game: Game, teamId: number) => {
    return game.my_pick && game.my_pick.length > 0 && game.my_pick[0].pick_team_id === teamId
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Today's Games</h2>
      <div className="space-y-4">
      {/* Sport Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSport(null)}
          className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ${
            activeSport === null
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Sports
        </button>
          {activeSports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setActiveSport(sport.id)}
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ${
              activeSport === sport.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {sport.icon_url && (
              <span className="mr-1.5 h-4 w-4 relative">
                <Image
                  src={sport.icon_url}
                  alt={sport.name}
                  width={16}
                  height={16}
                  className="object-contain"
                />
              </span>
            )}
            {sport.display_name}
          </button>
        ))}
      </div>
      
      {filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No games found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Try selecting a different sport or check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Games by time slot */}
          {sortedTimeSlots.map(timeSlot => {
            const gamesInSlot = groupedGames[timeSlot]
              const startHour = timeSlot
            const formattedTime = format(
              new Date().setHours(startHour, 0, 0, 0),
              'h:mm a'
            )
            
            return (
              <div key={timeSlot}>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {formattedTime}
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                    {gamesInSlot.map((game: Game) => {
                    const isHighlighted = highlightGameId === game.id
                    const isLocked = new Date(game.lock_time) <= new Date()
                    const homeTeam = game.home_team
                    const awayTeam = game.away_team
                    const homeTeamPicked = isTeamPicked(game, homeTeam.id)
                    const awayTeamPicked = isTeamPicked(game, awayTeam.id)
                    const hasPick = homeTeamPicked || awayTeamPicked

                    return (
                      <div 
                        key={game.id} 
                        className={`rounded-lg border ${isHighlighted ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200'} overflow-hidden`}
                      >
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">
                            {game.sport?.display_name || 'Sports'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(game.start_time), 'MMM d, h:mm a')}
                            {isLocked && ' · Locked'}
                          </span>
                        </div>
                        
                        <div className="p-4">
                          <div className="grid grid-cols-7 gap-2 items-center">
                            {/* Away Team */}
                            <div className="col-span-3 flex items-center space-x-3">
                              <div className="h-10 w-10 flex-shrink-0 overflow-hidden">
                                {awayTeam.logo_url ? (
                                  <Image
                                    src={awayTeam.logo_url}
                                    alt={awayTeam.name}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-full">
                                    <span className="text-xs font-medium text-gray-500">{awayTeam.abbreviation}</span>
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{awayTeam.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{awayTeam.city}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* VS */}
                            <div className="col-span-1 text-center">
                              <span className="text-sm font-medium text-gray-500">@</span>
                            </div>
                            
                            {/* Home Team */}
                            <div className="col-span-3 flex items-center space-x-3 justify-end">
                              <div className="min-w-0 text-right">
                                <p className="text-sm font-medium text-gray-900 truncate">{homeTeam.name}</p>
                                <p className="text-xs text-gray-500 truncate">{homeTeam.city}</p>
                              </div>
                              <div className="h-10 w-10 flex-shrink-0 overflow-hidden">
                                {homeTeam.logo_url ? (
                                  <Image
                                    src={homeTeam.logo_url}
                                    alt={homeTeam.name}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-full">
                                    <span className="text-xs font-medium text-gray-500">{homeTeam.abbreviation}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Pick Buttons */}
                          {!isLocked ? (
                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <button
                                onClick={() => makePick(game.id, awayTeam.id)}
                                disabled={makingPick === game.id}
                                className={`px-3 py-2 text-sm font-medium rounded-md flex justify-center items-center ${
                                  awayTeamPicked
                                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                }`}
                              >
                                {awayTeamPicked && (
                                  <CheckIcon className="h-4 w-4 mr-1 text-indigo-600" />
                                )}
                                {awayTeam.name}
                              </button>
                              
                              <button
                                onClick={() => makePick(game.id, homeTeam.id)}
                                disabled={makingPick === game.id}
                                className={`px-3 py-2 text-sm font-medium rounded-md flex justify-center items-center ${
                                  homeTeamPicked
                                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                }`}
                              >
                                {homeTeamPicked && (
                                  <CheckIcon className="h-4 w-4 mr-1 text-indigo-600" />
                                )}
                                {homeTeam.name}
                              </button>
                            </div>
                          ) : (
                            <div className="mt-4">
                              {hasPick ? (
                                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                                  <p className="text-sm text-gray-500">
                                    Your pick: <span className="font-medium text-gray-900">
                                      {homeTeamPicked ? homeTeam.name : awayTeam.name}
                                    </span>
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                                  <p className="text-sm text-gray-500">
                                    Picks locked for this game
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
      </div>
    </div>
  )
} 

export default TodayGames 