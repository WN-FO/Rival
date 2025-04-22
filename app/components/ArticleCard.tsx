import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

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

export default function ArticleCard({ article }: ArticleCardProps) {
  const game = article.game
  const sport = article.sport
  const hasGame = !!game
  
  // Format the published date
  const publishedAt = new Date(article.published_at)
  const timeAgo = formatDistanceToNow(publishedAt, { addSuffix: true })
  
  // Get team logos for display if this is a game-related article
  const homeTeam = hasGame ? game.home_team : null
  const awayTeam = hasGame ? game.away_team : null
  
  return (
    <Link href={`/article/${article.id}`} className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex-shrink-0 h-48 w-full bg-gray-200 relative">
        {/* If we have a game, show the team logos */}
        {hasGame ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-2">
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
              <span className="text-2xl font-bold text-gray-700">vs</span>
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
      
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          {sport && (
            <p className="text-sm font-medium text-indigo-600">
              {sport.display_name}
            </p>
          )}
          <div className="block mt-2">
            <h3 className="text-xl font-semibold text-gray-900">{article.title}</h3>
            <p className="mt-3 text-base text-gray-500 line-clamp-3">{article.summary}</p>
          </div>
          
          {/* Key stats/predictions if available */}
          {(article.key_stat || article.key_prediction) && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              {article.key_stat && (
                <div className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Key Stat:</span> {article.key_stat}
                </div>
              )}
              {article.key_prediction && (
                <div className="text-sm text-gray-700">
                  <span className="font-semibold">Prediction:</span> {article.key_prediction}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center">
          <div className="flex-shrink-0">
            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
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
    </Link>
  )
} 