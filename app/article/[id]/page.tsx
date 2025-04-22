import React from 'react'
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import GameDetails from '../../components/GameDetails'
import CommentSection from '../../components/CommentSection'

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      *,
      sport:sports(id, name, display_name, icon_url),
      game:games(
        id,
        sport_id,
        home_team_id,
        away_team_id,
        status,
        start_time,
        lock_time,
        home_score,
        away_score,
        winner_id,
        home_team:teams!games_home_team_id_fkey(id, name, abbreviation, logo_url),
        away_team:teams!games_away_team_id_fkey(id, name, abbreviation, logo_url),
        winner:teams(id, name, abbreviation, logo_url)
      )
    `)
    .eq('id', params.id)
    .single()
  
  if (error || !article) {
    notFound()
  }
  
  const publishedAt = new Date(article.published_at)
  const timeAgo = formatDistanceToNow(publishedAt, { addSuffix: true })
  const formattedDate = format(publishedAt, 'MMMM d, yyyy')
  
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <article>
          {/* Sport & Published Date */}
          <div className="mb-5 flex items-center justify-between">
            {article.sport && (
              <Link 
                href={`/?sport=${article.sport.id}`}
                className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800"
              >
                {article.sport.icon_url && (
                  <div className="w-4 h-4 mr-1 relative">
                    <Image
                      src={article.sport.icon_url}
                      alt={article.sport.name}
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  </div>
                )}
                {article.sport.display_name}
              </Link>
            )}
            <time className="text-sm text-gray-500" dateTime={article.published_at} title={formattedDate}>
              {timeAgo}
            </time>
          </div>
          
          {/* Article Title */}
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {article.title}
          </h1>
          
          {/* Game Details */}
          {article.game && (
            <div className="mt-6 mb-8">
              <GameDetails game={article.game} />
            </div>
          )}
          
          {/* Article Summary */}
          {article.summary && (
            <div className="mt-6">
              <p className="text-xl leading-8 text-gray-700 font-medium italic border-l-4 border-indigo-500 pl-4 py-1">
                {article.summary}
              </p>
            </div>
          )}
          
          {/* Article Content */}
          <div className="mt-8 prose prose-indigo prose-lg max-w-none">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
          
          {/* Key Points */}
          {(article.key_stat || article.key_storyline || article.key_prediction) && (
            <div className="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Key Points</h2>
              
              <div className="space-y-4">
                {article.key_stat && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Key Stat</h3>
                    <p className="mt-1 text-gray-700">{article.key_stat}</p>
                  </div>
                )}
                
                {article.key_storyline && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Key Storyline</h3>
                    <p className="mt-1 text-gray-700">{article.key_storyline}</p>
                  </div>
                )}
                
                {article.key_prediction && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Prediction</h3>
                    <p className="mt-1 text-gray-700">{article.key_prediction}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Author Info */}
          <div className="mt-10 flex items-center border-t border-gray-200 pt-6">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-semibold">AI</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">RivalAI</p>
              <div className="flex space-x-1 text-sm text-gray-500">
                <span>AI-generated sports analysis</span>
              </div>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="mt-10 border-t border-gray-200 pt-10">
            <CommentSection articleId={article.id} />
          </div>
        </article>
      </div>
    </div>
  )
} 