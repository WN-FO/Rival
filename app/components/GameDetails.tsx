'use client';

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'

interface GameDetailsProps {
  game: any; // Replace with proper type
}

const GameDetails: React.FC<GameDetailsProps> = ({ game }) => {
  const homeTeam = game.home_team;
  const awayTeam = game.away_team;
  const winner = game.winner;
  const isFinal = game.status === 'final';
  const isLive = game.status === 'in_progress';
  const isScheduled = game.status === 'scheduled';
  
  const formattedGameTime = format(new Date(game.start_time), 'MMM d, h:mm a');

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-900 text-white text-sm font-semibold py-2 px-4 flex justify-between items-center">
        <span>
          {isScheduled ? 'Upcoming' : isLive ? 'Live Now' : 'Final'}
        </span>
        <span>{formattedGameTime}</span>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between py-2">
          {/* Home Team */}
          <div className="flex items-center">
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden mr-3">
              {homeTeam.logo_url ? (
                <Image
                  src={homeTeam.logo_url}
                  alt={homeTeam.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-full">
                  <span className="text-xs font-medium text-gray-500">{homeTeam.abbreviation}</span>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">
                {homeTeam.name}
                {isFinal && winner?.id === homeTeam.id && (
                  <span className="ml-2 text-sm text-green-600 font-semibold">WINNER</span>
                )}
              </p>
              <p className="text-sm text-gray-500">{homeTeam.city}</p>
            </div>
          </div>
          
          {/* Score */}
          <div className="text-center mx-4">
            {(isLive || isFinal) && (
              <div className="bg-gray-100 rounded-lg px-4 py-2 text-lg font-bold">
                {game.home_score ?? 0} - {game.away_score ?? 0}
              </div>
            )}
            {isScheduled && (
              <div className="text-lg font-bold">VS</div>
            )}
          </div>
          
          {/* Away Team */}
          <div className="flex items-center">
            <div>
              <p className="font-medium text-right">
                {awayTeam.name}
                {isFinal && winner?.id === awayTeam.id && (
                  <span className="ml-2 text-sm text-green-600 font-semibold">WINNER</span>
                )}
              </p>
              <p className="text-sm text-gray-500 text-right">{awayTeam.city}</p>
            </div>
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden ml-3">
              {awayTeam.logo_url ? (
                <Image
                  src={awayTeam.logo_url}
                  alt={awayTeam.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center rounded-full">
                  <span className="text-xs font-medium text-gray-500">{awayTeam.abbreviation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Make a Pick Button */}
        {isScheduled && (
          <div className="mt-4 text-center">
            <Link
              href={`/picks?game=${game.id}`}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Make Your Pick
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetails; 