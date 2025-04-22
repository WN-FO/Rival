import React from 'react'
import Link from 'next/link'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ArticleCard from './components/ArticleCard'
import SportFilter from './components/SportFilter'

// The number of articles to fetch per page
const ARTICLES_PER_PAGE = 12

export default async function Home({
  searchParams,
}: {
  searchParams: { sport?: string; page?: string }
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Parse params
  const sportId = searchParams.sport || null
  const page = parseInt(searchParams.page || '1')
  
  // Calculate pagination
  const from = (page - 1) * ARTICLES_PER_PAGE
  const to = from + ARTICLES_PER_PAGE - 1
  
  // Fetch all sports for filter
  const { data: sports } = await supabase
    .from('sports')
    .select('id, name, display_name, icon_url')
    .eq('active', true)
    .order('name', { ascending: true })
  
  // Build query for articles
  let articlesQuery = supabase
    .from('articles')
    .select(`
      *,
      sport:sports(id, name, display_name, icon_url),
      game:games(
        id,
        home_team_id,
        away_team_id,
        status,
        start_time,
        home_score,
        away_score,
        home_team:teams!games_home_team_id_fkey(id, name, abbreviation, logo_url),
        away_team:teams!games_away_team_id_fkey(id, name, abbreviation, logo_url)
      )
    `)
    .order('published_at', { ascending: false })
    .range(from, to)
  
  // Apply sport filter if provided
  if (sportId) {
    articlesQuery = articlesQuery.eq('sport_id', sportId)
  }
  
  // Execute the query
  const { data: articles, error } = await articlesQuery
  
  // Get total count for pagination
  const { count: totalCount } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq(sportId ? 'sport_id' : 'id', sportId || undefined)
  
  const totalPages = Math.ceil((totalCount || 0) / ARTICLES_PER_PAGE)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4 md:mb-0">
            Latest Sports News & Analysis
          </h1>
          
          <SportFilter 
            sports={sports || []} 
            activeSportId={sportId} 
          />
        </div>
        
        {error ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Error loading articles</h3>
            <p className="mt-2 text-sm text-gray-500">Please try again later.</p>
          </div>
        ) : articles?.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No articles found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {sportId ? 'Try selecting a different sport or check back later.' : 'Check back later for new content.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles?.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <nav className="inline-flex items-center justify-center rounded-md">
              {hasPrevPage && (
                <Link
                  href={{
                    pathname: '/',
                    query: { ...(sportId ? { sport: sportId } : {}), page: page - 1 },
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-l-md"
                >
                  Previous
                </Link>
              )}
              
              <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border">
                Page {page} of {totalPages}
              </span>
              
              {hasNextPage && (
                <Link
                  href={{
                    pathname: '/',
                    query: { ...(sportId ? { sport: sportId } : {}), page: page + 1 },
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-r-md"
                >
                  Next
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
} 