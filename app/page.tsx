import React from 'react'
import Link from 'next/link'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ArticleCard from './components/ArticleCard'
import SportFilter from './components/SportFilter'

// The number of articles to fetch per page
const ARTICLES_PER_PAGE = 12

// Generate dynamic sport icon URLs
const generateSportIconUrl = (sportName: string): string => {
  const bgColors: Record<string, string> = {
    'NBA': '#006BB6',
    'NFL': '#013369',
    'MLB': '#002D72',
    'NHL': '#000000',
    'NCAAF': '#7B0000',
    'NCAAB': '#003399'
  };
  
  const bgColor = bgColors[sportName] || '#4f46e5';
  const initials = sportName.substring(0, 2).toUpperCase();
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${bgColor.replace('#', '%23')}" /><text x="50" y="50" font-family="Arial" font-size="35" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initials}</text></svg>`;
};

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
  
  // Fetch active sports for filter
  const { data: sports, error: sportsError } = await supabase
    .from('sports')
    .select('id, name, display_name, icon_url, active')
    .eq('active', true)
    .order('name', { ascending: true })
  
  // If we can't fetch sports, provide some defaults with dynamically generated icons
  const defaultSports = [
    { id: 1, name: 'NBA', display_name: 'Basketball', icon_url: generateSportIconUrl('NBA'), active: true },
    { id: 2, name: 'NFL', display_name: 'Football', icon_url: generateSportIconUrl('NFL'), active: true },
    { id: 3, name: 'MLB', display_name: 'Baseball', icon_url: generateSportIconUrl('MLB'), active: true },
  ]
  
  // If sports are fetched but don't have icons, add them
  const sportsWithIcons = sports?.map(sport => ({
    ...sport,
    icon_url: sport.icon_url || generateSportIconUrl(sport.name)
  })) || defaultSports;
  
  const activeSports = sportsWithIcons;
  
  try {
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

    // Create demo articles if none are found, with proper icon URLs
    const demoArticles = [
      {
        id: '1',
        title: 'NBA Playoffs: Eastern Conference Finals Preview',
        summary: 'An in-depth look at the upcoming Eastern Conference Finals matchup and key players to watch.',
        published_at: new Date().toISOString(),
        sport: activeSports.find(s => s.name === 'NBA') || {
          name: 'NBA',
          display_name: 'Basketball',
          icon_url: generateSportIconUrl('NBA')
        },
        key_stat: '58.3% - Team shooting percentage in the playoffs',
        key_prediction: 'Series will go to 7 games',
      },
      {
        id: '2',
        title: 'MLB Weekend Roundup: Top Performances',
        summary: 'Recapping the weekend\'s biggest baseball moments and standout player performances from around the league.',
        published_at: new Date().toISOString(),
        sport: activeSports.find(s => s.name === 'MLB') || {
          name: 'MLB',
          display_name: 'Baseball',
          icon_url: generateSportIconUrl('MLB')
        },
        key_stat: '4 home runs in a single game',
        key_prediction: 'Will contend for MVP this season',
      },
      {
        id: '3',
        title: 'NFL Draft Analysis: Winners and Losers',
        summary: 'Breaking down which teams made the smartest moves in this year\'s NFL draft and which ones might regret their choices.',
        published_at: new Date().toISOString(),
        sport: activeSports.find(s => s.name === 'NFL') || {
          name: 'NFL',
          display_name: 'Football',
          icon_url: generateSportIconUrl('NFL')
        },
        key_stat: '5 first-round quarterbacks selected',
        key_prediction: 'Draft class will produce 3+ Pro Bowlers',
      }
    ]
    
    // Fix any articles with missing sport icons
    const fixedArticles = articles?.map(article => {
      if (article.sport && !article.sport.icon_url) {
        return {
          ...article,
          sport: {
            ...article.sport,
            icon_url: generateSportIconUrl(article.sport.name)
          }
        };
      }
      return article;
    });
    
    const displayArticles = (fixedArticles && fixedArticles.length > 0 && !error) ? fixedArticles : demoArticles

    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4 md:mb-0">
              Latest Sports News & Analysis
            </h1>
            
            <SportFilter 
              sports={activeSports} 
              activeSportId={sportId} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

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
  } catch (error) {
    console.error('Error in Home page:', error)
    
    // Fallback content in case of error
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
            Latest Sports News & Analysis
          </h1>
          
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Welcome to Rival Sports</h3>
            <p className="mt-2 text-sm text-gray-500">
              We're experiencing some technical difficulties. Please check back soon for the latest sports news and analysis.
            </p>
            <div className="mt-6">
              <Link
                href="/picks"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                View Today's Picks
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
} 