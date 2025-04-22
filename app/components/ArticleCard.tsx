'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { useSupabase } from './SupabaseProvider'
import { useAuth } from './AuthProvider'
import { useToast } from './ToastProvider'
import { useRouter } from 'next/navigation'

interface ArticleCardProps {
  article: any
}

// Function to generate a dynamic SVG based on text
const generateSVG = (text: string, bgColor: string = '#4f46e5'): string => {
  const initials = text
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bgColor.replace('#', '%23')}" /><text x="50" y="50" font-family="Arial" font-size="35" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initials}</text></svg>`;
};

// Simple type definitions for votes
interface VoteCount {
  home_votes: number;
  away_votes: number;
}

// User vote record type
interface UserVote {
  user_id: string;
  article_id: string;
  team_vote: 'home' | 'away';
  created_at: string;
}

// Article votes record type
interface ArticleVotes {
  article_id: string;
  home_votes: number;
  away_votes: number;
  updated_at: string;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const game = article.game
  const sport = article.sport
  const hasGame = !!game
  const votes = article.votes && article.votes.length > 0 ? article.votes[0] : { home_votes: 0, away_votes: 0 }
  
  const router = useRouter()
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [votingFor, setVotingFor] = useState<string | null>(null)
  const [localVotes, setLocalVotes] = useState<VoteCount>(votes)

  // Calculate vote percentages for the progress bar
  const totalVotes = localVotes.home_votes + localVotes.away_votes
  const homeVotePercentage = totalVotes > 0 ? (localVotes.home_votes / totalVotes) * 100 : 50
  const awayVotePercentage = totalVotes > 0 ? (localVotes.away_votes / totalVotes) * 100 : 50
  
  // Format the published date
  const publishedAt = new Date(article.published_at)
  const timeAgo = formatDistanceToNow(publishedAt, { addSuffix: true })
  
  // Get team logos for display if this is a game-related article
  const homeTeam = hasGame ? game.home_team : null
  const awayTeam = hasGame ? game.away_team : null

  // Handle voting
  const handleVote = async (team: 'home' | 'away') => {
    if (!user) {
      router.push('/login?next=/')
      return
    }

    setVotingFor(team)

    try {
      // Update local state immediately for responsive UI
      const newVotes = { ...localVotes }
      if (team === 'home') {
        newVotes.home_votes += 1
      } else {
        newVotes.away_votes += 1
      }
      setLocalVotes(newVotes)

      // Record the vote in the database
      const userVote: UserVote = {
        user_id: user.id,
        article_id: article.id,
        team_vote: team,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_votes')
        .insert(userVote as any)

      if (error) {
        console.error('Error recording vote:', error)
        showToast('error', 'Failed to record your vote')
        // Revert the local state if there was an error
        setLocalVotes(votes)
      } else {
        showToast('success', 'Your vote has been counted!')
        
        // Update article votes count in the database
        const articleVote: ArticleVotes = {
          article_id: article.id,
          home_votes: newVotes.home_votes,
          away_votes: newVotes.away_votes,
          updated_at: new Date().toISOString()
        }

        await supabase
          .from('article_votes')
          .upsert(articleVote as any)
      }
    } catch (err) {
      console.error('Error voting:', err)
      showToast('error', 'Something went wrong')
      setLocalVotes(votes)
    } finally {
      setVotingFor(null)
    }
  }
  
  return (
    <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-100">
      <div className="flex flex-col md:flex-row">
        <div className="flex-shrink-0 h-48 md:h-auto md:w-1/3 bg-gray-200 relative">
          {/* If we have a game, show the team logos */}
          {hasGame ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                {awayTeam.logo_url ? (
                  <div className="w-16 h-16 relative">
                    <Image
                      src={awayTeam.logo_url}
                      alt={awayTeam.name}
                      width={64}
                      height={64}
                      className="object-contain"
                      unoptimized={true}
                      onError={(e) => {
                        // Use dynamically generated SVG as fallback
                        e.currentTarget.src = generateSVG(awayTeam.name, '#0369a1');
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center rounded-full" 
                       style={{ background: `url("${generateSVG(awayTeam.abbreviation, '#0369a1')}") center/cover` }}>
                  </div>
                )}
                <span className="text-2xl font-bold text-gray-700">vs</span>
                {homeTeam.logo_url ? (
                  <div className="w-16 h-16 relative">
                    <Image
                      src={homeTeam.logo_url}
                      alt={homeTeam.name}
                      width={64}
                      height={64}
                      className="object-contain"
                      unoptimized={true}
                      onError={(e) => {
                        // Use dynamically generated SVG as fallback
                        e.currentTarget.src = generateSVG(homeTeam.name, '#0369a1');
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center rounded-full"
                       style={{ background: `url("${generateSVG(homeTeam.abbreviation, '#0369a1')}") center/cover` }}>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Otherwise, show a sport icon if available
            sport?.icon_url ? (
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-24 h-24 relative">
                  <Image
                    src={sport.icon_url}
                    alt={sport.name}
                    width={96}
                    height={96}
                    className="object-contain"
                    unoptimized={true}
                    onError={(e) => {
                      // Use dynamically generated SVG as fallback
                      e.currentTarget.src = generateSVG(sport.name, '#4f46e5');
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl font-bold text-gray-400">Rival Sports</div>
              </div>
            )
          )}
        </div>
        
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex-1">
            {sport && (
              <p className="text-sm font-medium text-indigo-600">
                {sport.display_name}
              </p>
            )}
            <Link href={`/article/${article.id}`} className="block mt-2">
              <h3 className="text-xl font-semibold text-gray-900">{article.title}</h3>
              <p className="mt-3 text-base text-gray-500 line-clamp-3">{article.summary}</p>
            </Link>
            
            {/* Key stats/predictions if available */}
            {(article.key_stat || article.key_prediction) && (
              <div className="mt-3 pt-3 space-y-1">
                {article.key_stat && (
                  <div className="text-sm bg-blue-50 text-blue-700 py-1 px-2 rounded-md inline-block mr-2">
                    <span className="font-medium">⚡ Key Stat:</span> {article.key_stat}
                  </div>
                )}
                {article.key_prediction && (
                  <div className="text-sm bg-purple-50 text-purple-700 py-1 px-2 rounded-md inline-block">
                    <span className="font-medium">🔮 Prediction:</span> {article.key_prediction}
                  </div>
                )}
              </div>
            )}

            {/* Crowd vote progress bar */}
            {hasGame && (
              <div className="mt-4">
                <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                  <span>{awayTeam.name} ({localVotes.away_votes})</span>
                  <span>{homeTeam.name} ({localVotes.home_votes})</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full flex">
                    <div 
                      className="bg-blue-500 transition-all duration-500" 
                      style={{ width: `${awayVotePercentage}%` }}
                    />
                    <div 
                      className="bg-red-500 transition-all duration-500" 
                      style={{ width: `${homeVotePercentage}%` }}
                    />
                  </div>
                </div>
                
                {/* Voting buttons */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleVote('away');
                    }}
                    disabled={votingFor !== null}
                    className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200 transition flex items-center justify-center"
                  >
                    {votingFor === 'away' ? 'Voting...' : `${awayTeam.name} Win`}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleVote('home');
                    }}
                    disabled={votingFor !== null}
                    className="px-3 py-1.5 text-sm font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 border border-red-200 transition flex items-center justify-center"
                  >
                    {votingFor === 'home' ? 'Voting...' : `${homeTeam.name} Win`}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center">
            <div className="flex-shrink-0">
              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">RS</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Rival Sports</p>
              <div className="flex space-x-1 text-sm text-gray-500">
                <time dateTime={article.published_at}>{timeAgo}</time>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 