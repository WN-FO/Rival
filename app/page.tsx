import React from 'react'
import Link from 'next/link'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ArticleCard from './components/ArticleCard'
import SportFilter from './components/SportFilter'

// The number of articles to fetch initially
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
        ),
        votes:article_votes(home_votes, away_votes)
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
        title: 'NBA Showdown: Celtics vs Bucks in Eastern Conference Clash',
        summary: 'Jayson Tatum and Giannis go head-to-head in a battle of Eastern Conference titans. Who has the edge tonight?',
        published_at: new Date().toISOString(),
        sport: activeSports.find(s => s.name === 'NBA') || {
          name: 'NBA',
          display_name: 'Basketball',
          icon_url: generateSportIconUrl('NBA')
        },
        key_stat: 'Tatum averaging 28.7 PPG vs. Milwaukee this season',
        key_prediction: 'High-scoring affair with 230+ combined points',
        votes: [{ home_votes: 125, away_votes: 78 }]
      },
      {
        id: '2',
        title: 'MLB Rivalry Week: Yankees vs Red Sox at Fenway',
        summary: 'The most storied rivalry in baseball heats up as the Yankees bring their power bats to Fenway Park tonight.',
        published_at: new Date().toISOString(),
        sport: activeSports.find(s => s.name === 'MLB') || {
          name: 'MLB',
          display_name: 'Baseball',
          icon_url: generateSportIconUrl('MLB')
        },
        key_stat: 'Judge hitting .342 with 6 HR at Fenway this year',
        key_prediction: 'Yankees to edge it with late-inning heroics',
        votes: [{ home_votes: 203, away_votes: 187 }]
      },
      {
        id: '3',
        title: 'NFL Sunday: Chiefs Look to Extend Win Streak Against Raiders',
        summary: 'Patrick Mahomes and the Chiefs aim for their 6th straight win when they face their division rivals in Las Vegas.',
        published_at: new Date().toISOString(),
        sport: activeSports.find(s => s.name === 'NFL') || {
          name: 'NFL',
          display_name: 'Football',
          icon_url: generateSportIconUrl('NFL')
        },
        key_stat: 'Chiefs converting 52% of 3rd downs this season',
        key_prediction: 'Chiefs by 10+ with Mahomes throwing 3+ TDs',
        votes: [{ home_votes: 433, away_votes: 122 }]
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
      // Add demo votes if needed
      if (!article.votes || article.votes.length === 0) {
        article.votes = [{ home_votes: Math.floor(Math.random() * 500), away_votes: Math.floor(Math.random() * 500) }];
      }
      return article;
    });
    
    const displayArticles = (fixedArticles && fixedArticles.length > 0 && !error) ? fixedArticles : demoArticles

    return (
      <div className="bg-white">
        {/* Sticky sport switcher */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 py-2">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SportFilter 
              sports={activeSports} 
              activeSportId={sportId} 
            />
          </div>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Game Day Insights
            </h1>
            <p className="mt-2 text-gray-600">
              Fresh analysis, stats, and predictions for your favorite matchups
            </p>
          </div>
          
          {/* Infinite-scroll feed */}
          <div className="flex flex-col gap-6">
            {displayArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Load More Button instead of pagination for infinite scroll effect */}
          {hasNextPage && (
            <div className="mt-8 flex justify-center">
              <Link
                href={{
                  pathname: '/',
                  query: { ...(sportId ? { sport: sportId } : {}), page: page + 1 },
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
              >
                Load More Matchups
              </Link>
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
            Game Day Insights
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