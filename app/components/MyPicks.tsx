'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { CheckIcon, XCircleIcon } from './icons'

interface MyPicksProps {
  picks: any[]
}

export default function MyPicks({ picks }: MyPicksProps) {
  return (
    <div className="space-y-6">
      {picks.map(pick => {
        const game = pick.game
        const pickedTeam = pick.picked_team
        const homeTeam = game.home_team
        const awayTeam = game.away_team
        const isCorrect = pick.correct
        const isGameFinished = game.status === 'final'
        const isWinner = game.winner_id === pickedTeam.id
        const isHome = pickedTeam.id === homeTeam.id
        const opponent = isHome ? awayTeam : homeTeam
        
        // Format dates
        const gameDate = new Date(game.start_time)
        const formattedDate = format(gameDate, 'MMM d, yyyy')
        const formattedTime = format(gameDate, 'h:mm a')
        const timeAgo = formatDistanceToNow(new Date(pick.created_at), { addSuffix: true })
        
        return (
          <div 
            key={pick.id} 
            className={`rounded-lg border ${
              isGameFinished
                ? isCorrect
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
                : 'border-gray-200'
            } overflow-hidden`}
          >
            <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">
                  {game.sport.display_name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {formattedDate}
                </span>
              </div>
              <div className="flex items-center">
                {isGameFinished && (
                  <span className={`mr-2 flex items-center text-sm font-medium ${
                    isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isCorrect ? (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Correct
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Incorrect
                      </>
                    )}
                  </span>
                )}
                <Link
                  href={`/article?game=${game.id}`}
                  className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  View Details
                </Link>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-500">Your Pick</h3>
                <div className="mt-1 flex items-center">
                  <div className="mr-2 h-8 w-8 flex-shrink-0 overflow-hidden">
                    {pickedTeam.logo_url ? (
                      <Image
                        src={pickedTeam.logo_url}
                        alt={pickedTeam.name}
                        width={32}
                        height={32}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-full">
                        <span className="text-xs font-medium text-gray-500">{pickedTeam.abbreviation}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-base font-semibold text-gray-900">{pickedTeam.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    to {isWinner ? 'win' : 'beat'} {opponent.name}
                  </span>
                </div>
              </div>
              
              {isGameFinished && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">Result</h3>
                  <div className="mt-1 flex justify-between">
                    <div className="flex items-center">
                      <span className="mr-1 font-medium">{homeTeam.name}</span>
                      <span className="text-sm">{game.home_score}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm">{game.away_score}</span>
                      <span className="ml-1 font-medium">{awayTeam.name}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-xs text-gray-500 text-right">
                Pick made {timeAgo}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 