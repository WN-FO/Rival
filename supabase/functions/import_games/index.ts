import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

interface ExternalGame {
  id: string
  sport: string
  homeTeam: string
  awayTeam: string
  startTime: string
  homeScore?: number
  awayScore?: number
  status: string
  winner?: string
}

// Main function
Deno.serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { sport } = await req.json()
    
    // Default to all active sports if none specified
    let sportsToImport: string[] = []
    if (sport) {
      sportsToImport = [sport]
    } else {
      const { data: activeSports, error: sportsError } = await supabase
        .from('sports')
        .select('name')
        .eq('active', true)
      
      if (sportsError) {
        throw sportsError
      }
      
      sportsToImport = activeSports.map(s => s.name)
    }
    
    const results = {}
    
    // Import games for each sport
    for (const sportName of sportsToImport) {
      const games = await fetchGamesForSport(sportName)
      const result = await importGames(supabase, games, sportName)
      results[sportName] = result
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Function to fetch games from external sources
async function fetchGamesForSport(sport: string): Promise<ExternalGame[]> {
  // This is where you would integrate with various sports APIs
  // For demonstration, we'll return mock data
  
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Example implementation for different sports
  switch (sport.toUpperCase()) {
    case 'NBA':
      // Fetch NBA games from NBA API
      return mockNBAGames()
    case 'NFL':
      // Fetch NFL games from NFL API
      return mockNFLGames()
    case 'MLB':
      // Fetch MLB games from MLB API
      return mockMLBGames()
    default:
      console.log(`No implementation for sport ${sport}`)
      return []
  }
}

// Function to import games into the database
async function importGames(supabase, games: ExternalGame[], sportName: string) {
  try {
    // Get sport ID
    const { data: sport, error: sportError } = await supabase
      .from('sports')
      .select('id')
      .eq('name', sportName.toUpperCase())
      .single()
    
    if (sportError) {
      throw sportError
    }
    
    const sportId = sport.id
    
    // Process each game
    const results = {
      created: 0,
      updated: 0,
      errors: 0,
      details: []
    }
    
    for (const game of games) {
      try {
        // Get team IDs
        const { data: homeTeam, error: homeTeamError } = await supabase
          .from('teams')
          .select('id')
          .eq('sport_id', sportId)
          .eq('name', game.homeTeam)
          .single()
        
        if (homeTeamError) {
          // Team doesn't exist, create it
          const { data: newHomeTeam, error: createHomeError } = await supabase
            .from('teams')
            .insert({
              sport_id: sportId,
              name: game.homeTeam,
              abbreviation: game.homeTeam.substring(0, 3).toUpperCase(),
              city: game.homeTeam.split(' ')[0]
            })
            .select('id')
            .single()
          
          if (createHomeError) {
            throw createHomeError
          }
          
          var homeTeamId = newHomeTeam.id
        } else {
          var homeTeamId = homeTeam.id
        }
        
        const { data: awayTeam, error: awayTeamError } = await supabase
          .from('teams')
          .select('id')
          .eq('sport_id', sportId)
          .eq('name', game.awayTeam)
          .single()
        
        if (awayTeamError) {
          // Team doesn't exist, create it
          const { data: newAwayTeam, error: createAwayError } = await supabase
            .from('teams')
            .insert({
              sport_id: sportId,
              name: game.awayTeam,
              abbreviation: game.awayTeam.substring(0, 3).toUpperCase(),
              city: game.awayTeam.split(' ')[0]
            })
            .select('id')
            .single()
          
          if (createAwayError) {
            throw createAwayError
          }
          
          var awayTeamId = newAwayTeam.id
        } else {
          var awayTeamId = awayTeam.id
        }
        
        // Prepare game data
        const gameData = {
          sport_id: sportId,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          start_time: new Date(game.startTime).toISOString(),
          lock_time: new Date(new Date(game.startTime).getTime() - 5 * 60000).toISOString(), // 5 minutes before start
          home_score: game.homeScore,
          away_score: game.awayScore,
          status: mapStatus(game.status),
          external_id: game.id
        }
        
        // Add winner if game is final
        if (game.status === 'final' && game.winner) {
          const winnerId = game.winner === game.homeTeam ? homeTeamId : awayTeamId
          gameData['winner_id'] = winnerId
        }
        
        // Check if game already exists
        const { data: existingGame, error: gameError } = await supabase
          .from('games')
          .select('id')
          .eq('external_id', game.id)
          .maybeSingle()
        
        if (gameError && gameError.code !== 'PGRST116') {
          throw gameError
        }
        
        if (existingGame) {
          // Update existing game
          const { error: updateError } = await supabase
            .from('games')
            .update(gameData)
            .eq('id', existingGame.id)
          
          if (updateError) {
            throw updateError
          }
          
          results.updated++
          results.details.push({
            type: 'update',
            external_id: game.id,
            game_id: existingGame.id
          })
        } else {
          // Create new game
          const { data: newGame, error: createError } = await supabase
            .from('games')
            .insert(gameData)
            .select('id')
            .single()
          
          if (createError) {
            throw createError
          }
          
          results.created++
          results.details.push({
            type: 'create',
            external_id: game.id,
            game_id: newGame.id
          })
        }
      } catch (error) {
        console.error(`Error importing game ${game.id}:`, error)
        results.errors++
        results.details.push({
          type: 'error',
          external_id: game.id,
          error: error.message
        })
      }
    }
    
    return results
  } catch (error) {
    console.error(`Error in importGames for ${sportName}:`, error)
    return { error: error.message }
  }
}

// Helper function to map external status to internal status
function mapStatus(externalStatus: string): string {
  switch (externalStatus.toLowerCase()) {
    case 'scheduled':
    case 'created':
    case 'upcoming':
      return 'scheduled'
    case 'in_progress':
    case 'active':
    case 'live':
      return 'in_progress'
    case 'final':
    case 'completed':
    case 'closed':
      return 'final'
    default:
      return 'scheduled'
  }
}

// Mock data functions for demonstration
function mockNBAGames(): ExternalGame[] {
  const now = new Date()
  const today = new Date(now.setHours(20, 0, 0, 0)).toISOString()
  
  return [
    {
      id: 'nba-2023-1001',
      sport: 'NBA',
      homeTeam: 'Los Angeles Lakers',
      awayTeam: 'Golden State Warriors',
      startTime: today,
      status: 'scheduled'
    },
    {
      id: 'nba-2023-1002',
      sport: 'NBA',
      homeTeam: 'Boston Celtics',
      awayTeam: 'New York Knicks',
      startTime: today,
      status: 'scheduled'
    }
  ]
}

function mockNFLGames(): ExternalGame[] {
  const now = new Date()
  const today = new Date(now.setHours(16, 0, 0, 0)).toISOString()
  
  return [
    {
      id: 'nfl-2023-1001',
      sport: 'NFL',
      homeTeam: 'Kansas City Chiefs',
      awayTeam: 'Buffalo Bills',
      startTime: today,
      status: 'scheduled'
    },
    {
      id: 'nfl-2023-1002',
      sport: 'NFL',
      homeTeam: 'San Francisco 49ers',
      awayTeam: 'Dallas Cowboys',
      startTime: today,
      status: 'scheduled'
    }
  ]
}

function mockMLBGames(): ExternalGame[] {
  const now = new Date()
  const today = new Date(now.setHours(19, 0, 0, 0)).toISOString()
  
  return [
    {
      id: 'mlb-2023-1001',
      sport: 'MLB',
      homeTeam: 'New York Yankees',
      awayTeam: 'Boston Red Sox',
      startTime: today,
      status: 'scheduled'
    },
    {
      id: 'mlb-2023-1002',
      sport: 'MLB',
      homeTeam: 'Los Angeles Dodgers',
      awayTeam: 'San Francisco Giants',
      startTime: today,
      status: 'scheduled'
    }
  ]
} 